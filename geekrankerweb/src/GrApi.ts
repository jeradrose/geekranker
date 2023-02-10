import { getBggGames, getBggCollection, getBggThread, getBggGeekList } from "./BggApi";
import { BggGame } from "./BggApiGames";
import { BggCollection } from "./BggApiCollection";
import { Game, GetRankingsResponse, PlayerCountStats, UserStats } from "./models";

export const getRankings = async (
  usernames: string[],
  gameIds: number[],
  threadId: number | undefined,
  geekListId: number | undefined,
): Promise<GetRankingsResponse> => {
  const response: GetRankingsResponse = {
    games: [],
    threadTitle: "",
    geekListTitle: "",
  };

  usernames = [...new Set(usernames)].sort();

  const stats = await getUsers(usernames);

  const userGameIds: number[] = stats.map(s => s.gameId);

  const threadGameIds: number[] = [];

  if (threadId) {
    const thread = await getBggThread(threadId);
    if (thread) {
      response.threadTitle = thread.subject;
      const regexp = /boardgamegeek\.com\/boardgame\/([0-9]*)/g;
      threadGameIds.push(...new Set(
        [...thread.articles[0].article.flatMap(a =>
          [...a.body[0].matchAll(regexp)].map(m => parseInt(m[1]))
        )]
      ));
    }
  }

  const geekListGameIds: number[] = [];

  if (geekListId) {
    const geekList = await getBggGeekList(geekListId);
    if (geekList) {
      response.geekListTitle = geekList.title;

      geekListGameIds.push(
        ...geekList.item
          .filter(i => i.$.objecttype === "thing" && i.$.subtype === "boardgame")
          .map(i => parseInt(i.$.objectid))
      );
    }
  }

  const gameIdsToLoad = [...new Set([
    ...gameIds,
    ...userGameIds,
    ...threadGameIds,
    ...geekListGameIds,
  ])];

  const games = await getGames(gameIdsToLoad);

  games.map(g => {
    g.userStats = stats.filter(s => s.gameId === g.gameId);
    g.threadSequence = threadGameIds.indexOf(g.gameId) + 1;
    g.geekListSequence = geekListGameIds.indexOf(g.gameId) + 1;
  });

  response.games = games;

  return response;
}

export const getGames = async (gameIds: number[]): Promise<Game[]> => {
  const games: Game[] = gameIds
    .map(id => localStorage.getItem(`game-${id}`))
    .filter((s): s is string => Boolean(s))
    .map(s => JSON.parse(s));

  const missingGameIds = gameIds.filter(id => !games.find(g => g.gameId === id));

  if (missingGameIds.length) {
    const bggGames = await getBggGames(missingGameIds);

    const newGames = bggGames.map(bggGameToGrGame);

    newGames.map(g => localStorage.setItem(`game-${g.gameId}`, JSON.stringify(g)));

    games.push(...newGames);
  }

  return games;
}

export const getUsers = async (usernames: string[]): Promise<UserStats[]> => {
  const userStats: UserStats[] = usernames
    .map(u => localStorage.getItem(`userstats-${u}`))
    .filter((s): s is string => Boolean(s))
    .map(s => JSON.parse(s));

  const missingUsernames = usernames.filter(u => !userStats.find(us => us.username === u));

  if (missingUsernames.length) {
    const newUserStats = (await Promise.all(
      missingUsernames.map(async (u) =>
        bggCollectionToUserStats(await getBggCollection(u), u)
      )
    )).flat();

    newUserStats.map(us => localStorage.setItem(`user-${us.username}`, JSON.stringify(us)));

    userStats.push(...newUserStats);
  }

  return userStats;
}

const bggGameToGrGame = (bggGame: BggGame): Game => {
  const game: Game = {
    gameId: parseInt(bggGame.$.id.toString()),
    name: bggGame.name.find(n => n.$.type === "primary")?.$.value || "",
    imageUrl: bggGame.thumbnail,
    grIndex: 0,
    grIndexRank: 0,
    geekRating: parseFloat(bggGame.statistics[0].ratings[0].bayesaverage[0].$.value),
    geekRatingRank: 0,
    avgPlayerRating: parseFloat(bggGame.statistics[0].ratings[0].average[0].$.value),
    avgPlayerRatingRank: 0,
    avgUserRating: 0,
    avgUserRatingRank: 0,
    avgWeight: parseFloat(bggGame.statistics[0].ratings[0].averageweight[0].$.value),
    avgWeightRank: 0,
    minPlayTime: parseInt(bggGame.minplaytime[0].$.value),
    maxPlayTime: parseInt(bggGame.maxplaytime[0].$.value),
    isExpansion: bggGame.$.type === "boardgameexpansion",
    playerCountStats: bggGame
      .poll
      .find(p => p.$.name === "suggested_numplayers")?.results
      .filter(r => !isNaN(parseInt(r.$.numplayers)) && parseInt(r.$.numplayers) > 0 && r.$.numplayers.indexOf("+") === -1)
      .map(r => {
        const bestVotes = parseInt(r.result.find(r2 => r2.$.value === "Best")?.$.numvotes || "0");
        const recommendedVotes = parseInt(r.result.find(r2 => r2.$.value === "Recommended")?.$.numvotes || "0");
        const notRecommendedVotes = parseInt(r.result.find(r2 => r2.$.value === "Not Recommended")?.$.numvotes || "0");
        const totalVotes = bestVotes + recommendedVotes + notRecommendedVotes;

        const stats: PlayerCountStats = {
          playerCount: parseInt(r.$.numplayers),
          bestVotes: bestVotes,
          recommendedVotes: recommendedVotes,
          notRecommendedVotes: notRecommendedVotes,
          bestPercent: totalVotes && bestVotes / totalVotes,
          recommendedPercent: totalVotes && recommendedVotes / totalVotes,
          notRecommendedPercent: totalVotes && notRecommendedVotes / totalVotes,
          rank: 0,
          score: 0,
          totalVotes: totalVotes,
        };

        stats.score = (stats.bestPercent + (stats.recommendedPercent * (3.0 / 4))) * 10.0;

        return stats;
      })
      .filter(r => r.notRecommendedPercent < 0.9 && r.totalVotes)
      || [],
    userStats: [],
    threadSequence: 0,
    geekListSequence: 0,
    cacheDate: new Date(),
  };

  return game;
}

const bggCollectionToUserStats = (bggCollection: BggCollection, username: string): UserStats[] => {
  const userStatsList: UserStats[] = bggCollection.item.map(g => {
    const userStats: UserStats = {
      username: username,
      gameId: parseInt(g.$.objectid),
      isOwned: g.status[0].$.own === "1",
      isWishlisted: g.status[0].$.wishlist === "1",
      rating: g.stats[0].rating[0].$.value === "N/A" ? undefined : parseFloat(g.stats[0].rating[0].$.value),
      rank: undefined,
      cacheDate: new Date(),
    };

    return userStats;
  });

  return userStatsList
}