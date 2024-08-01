import { getBggGames, getBggCollection, getBggThread, getBggGeekList } from "./BggApi";
import { BggGame } from "./BggApiGames";
import { BggCollection } from "./BggApiCollection";
import { Game, GameExpiration, GetRankingsResponse, PlayerCountStats, UserStats } from "./models";
import { ApiState } from "./Utilities";

export const getRankings = async (
  usernames: string[],
  gameIds: number[],
  threadId: number | undefined,
  geekListId: number | undefined,
  apiState: ApiState,
  setApiState: (value: ApiState) => void,
  includeOwned: boolean,
  includeRated: boolean,
  includeWishlisted: boolean,
): Promise<GetRankingsResponse> => {
  const response: GetRankingsResponse = {
    games: [],
    threadTitle: "",
    geekListTitle: "",
  };

  usernames = [...new Set(usernames)].sort();

  const stats = await getUsers(usernames, getGameExpirations(), apiState, setApiState);

  const userGameIds: number[] = stats
    .filter(s =>
      (s.isOwned && includeOwned) ||
      (s.isWishlisted && includeWishlisted) ||
      (!s.isOwned && !s.isWishlisted && includeRated)
    )
    .map(s => s.gameId);

  const threadGameIds: number[] = [];

  if (threadId) {
    setApiState({ currentlyLoading: 'thread' });

    const thread = await getBggThread(threadId, apiState, setApiState);
    if (thread) {
      response.threadTitle = thread.subject;
      const regexp = /boardgamegeek\.com\/boardgame\/([0-9]*)/g;
      threadGameIds.push(
        ...new Set(
          [...thread.articles[0].article.flatMap(a =>
            [...a.body[0].matchAll(regexp)].map(m => parseInt(m[1]))
          )]
        )
      );
    }
  }

  const geekListGameIds: number[] = [];

  if (geekListId) {
    setApiState({ currentlyLoading: 'geeklist' });
    const geekList = await getBggGeekList(geekListId, apiState, setApiState);
    if (geekList) {
      response.geekListTitle = geekList.title;

      geekListGameIds.push(
        ...new Set([
          ...geekList.item
            .filter(i => i.$.objecttype === "thing" && i.$.subtype === "boardgame")
            .map(i => parseInt(i.$.objectid))
        ])
      );
    }
  }

  const gameIdsToLoad = [...new Set([
    ...gameIds,
    ...userGameIds,
    ...threadGameIds,
    ...geekListGameIds,
  ])];

  const games = await getGames(gameIdsToLoad, apiState, setApiState);

  games.map(g => {
    g.userStats = stats.filter(s => s.gameId === g.gameId);
    g.threadSequence = threadGameIds.indexOf(g.gameId) + 1;
    g.geekListSequence = geekListGameIds.indexOf(g.gameId) + 1;
  });

  response.games = games;

  setApiState({});

  return response;
}

const getGameExpirations = (): GameExpiration[] =>
  JSON.parse(localStorage.getItem('game-expirations') || '[]');

export const getGames = async (gameIds: number[], apiState: ApiState, setApiState: (value: ApiState) => void): Promise<Game[]> => {
  const games: Game[] = gameIds
    .map(id => localStorage.getItem(`game-${id}`))
    .filter((s): s is string => Boolean(s))
    .map(s => JSON.parse(s));

  const missingGameIds = gameIds.filter(id => !games.find(g => g.gameId === id));

  if (missingGameIds.length) {
    const gamesPerPage = 250;
    const totalPages = Math.trunc(missingGameIds.length / gamesPerPage) + 1;

    const gameExpirations = getGameExpirations();

    for (let page = 0; page < totalPages; page++) {
      setApiState({
        currentlyLoading: 'games',
        currentItem: page,
        maxItem: totalPages,
      });

      const startGame = (page * gamesPerPage);
      const endGame = Math.min(((page + 1) * gamesPerPage), missingGameIds.length);
      const gameIdsToLoad = missingGameIds.slice(startGame, endGame);

      const bggGames = await getBggGames(gameIdsToLoad, apiState, setApiState);

      const newGames = bggGames.map(bggGameToGrGame);

      newGames.map(g => cacheGame(g, gameExpirations));

      games.push(...newGames);
    }

    setLocalStorageSafely('game-expirations', gameExpirations, gameExpirations);
  }

  return games;
}

const setLocalStorageSafely = (key: string, object: any, gameExpirations: GameExpiration[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(object));
  } catch {
    const oldestGames = gameExpirations
      .sort((a, b) =>
        new Date(a.accessDate > a.cacheDate ? a.cacheDate : a.accessDate).getTime() -
        new Date(b.accessDate > b.cacheDate ? b.cacheDate : b.accessDate).getTime())
      .slice(0, 100)
      .map(g => g.gameId);

    oldestGames.map(id => {
      localStorage.removeItem(`game-${id}`);

      const gameExpiration = gameExpirations.find(ge => ge.gameId === id);
      const index = gameExpiration && gameExpirations.indexOf(gameExpiration);
      if (index && index > -1) {
        gameExpirations.splice(index, 1);
      }
    });
    setLocalStorageSafely(key, object, gameExpirations);
  }
}

const cacheGame = (game: Game, gameExpirations: GameExpiration[]) => {
  let gameExpiration = gameExpirations.find(ge => ge.gameId === game.gameId);
  if (!gameExpiration) {
    gameExpiration = {
      gameId: game.gameId,
      accessDate: new Date(),
      cacheDate: new Date(),
    };

    gameExpirations.push(gameExpiration);
  }
  setLocalStorageSafely(`game-${game.gameId}`, game, gameExpirations);
}

const getDateHasExpired = (cacheDate: Date): boolean => {
  const now = new Date();
  const cacheDateDate = new Date(cacheDate);
  const expirationDate = new Date(cacheDateDate.getTime() + 86400000);
  return now.getTime() - expirationDate.getTime() > 0;
}

export const getUsers = async (usernames: string[], gameExpirations: GameExpiration[], apiState: ApiState, setApiState: (value: ApiState) => void): Promise<UserStats[]> => {
  const userStats: UserStats[] = usernames
    .map(u => localStorage.getItem(`user-${u}`))
    .filter((s): s is string => Boolean(s))
    .flatMap(s => [...JSON.parse(s)]);

  const missingUsernames = usernames.filter(u => !userStats.find(us => us.username === u && !getDateHasExpired(us.cacheDate)));

  if (missingUsernames.length) {
    const newUserStats = (await Promise.all(
      missingUsernames.map(async (u) => {
        setApiState({ currentlyLoading: 'users' });
        const response = await getBggCollection(u, apiState, setApiState);

        if (!response.item || !response.item.length) {

          setApiState({ ...apiState, usernamesNotFound: [...apiState.usernamesNotFound || [], u] });
          return [];
        } else {
          return bggCollectionToUserStats(response, u);
        }
      })
    )).flat();

    missingUsernames.map(u => setLocalStorageSafely(`user-${u}`, newUserStats.filter(us => us.username === u), gameExpirations))

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
    yearPublished: parseInt(bggGame.yearpublished[0].$.value),
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
      accessDate: new Date(),
    };

    return userStats;
  });

  return userStatsList
}