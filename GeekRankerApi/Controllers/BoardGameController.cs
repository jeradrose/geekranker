using BggApi;
using BggApi.Models;
using GeekRankerApi.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace GeekRankerApi.Controllers;

[ApiController]
[Route("[controller]")]
public class BoardGameController : ControllerBase {
    private static readonly BggClient _bggApi = new BggClient();

    [HttpGet("GetGame")]
    public async Task<List<BoardGame>> GetGame(int id) {
        return await _bggApi.GetBoardGamesAsync(new []{ id }) ?? new List<BoardGame>();
    }

    [HttpGet("GetCollection")]
    public async Task<List<CollectionItem>> GetCollection(string username) {
        return await _bggApi.GetCollectionAsync(username) ?? new List<CollectionItem>();
    }

    [HttpPost("GetRankings")]
    public async Task<GetRankingsResponse> GetRankings([FromBody]GetRankingsRequest request) {
        var response = new GetRankingsResponse();

        var usernames = request.Usernames?.Where(un => !string.IsNullOrEmpty(un)).Distinct().ToArray();
        var gameIds = (request.GameIds?.Distinct().ToList()) ?? new List<int>();

        var collections = new Dictionary<string, List<CollectionItem>>();

        if (usernames != null) {
        foreach (var username in usernames) { 
                var collection = await _bggApi.GetCollectionAsync(username);

                if (collection != null) {
                    collections.Add(username, collection);
                }
        }

        gameIds.AddRange(collections.SelectMany(s => s.Value.Select(g => g.Id)).Distinct());
        }

        var threadGameIds = new List<int>();

        if (request.ThreadId.HasValue) {
            var thread = await _bggApi.GetThreadAsync(request.ThreadId.Value);

            if (thread != null) {
                response.ThreadTitle = thread.Subject;

                var regex = new Regex(@"boardgamegeek\.com\/boardgame\/([0-9]*)");

                threadGameIds = thread.Articles.ArticleList.SelectMany(a =>
                    regex.Matches(a.Body).Select(m => int.Parse(m.Groups[1].Value))
                ).ToList();

                gameIds.AddRange(threadGameIds);
            }
        }

        var geekListGameIds = new List<int>();

        if (request.GeekListId.HasValue) {
            var geekList = await _bggApi.GetGeekListAsync(request.GeekListId.Value);

            if (geekList != null) {
                response.GeekListTitle = geekList.Title;

                geekListGameIds = geekList
                    .Items
                    .Where(i => i.ObjectType == "thing" && i.SubType == "boardgame")
                    .Select(i => i.ObjectId)
                    .Distinct()
                    .ToList();

                gameIds.AddRange(geekListGameIds);
            }
        }

        gameIds = gameIds.Distinct().Order().ToList();

        var games = await _bggApi.GetBoardGamesAsync(gameIds);

        if (games == null) {
            return new GetRankingsResponse { Games = new List<CollectionGame>() };
        }

        var collectionSet = games
            .Select(g => new CollectionGame {
                GameId = g.ObjectId,
                Name = g.Names.Single(n => n.Type == NameType.Primary).Value,
                ImageUrl = g.ThumbnailUrl,
                GeekRating = g.Statistics.Single().Ratings.Single().BayesAverage.Value,
                AvgPlayerRating = g.Statistics.Single().Ratings.Single().Average.Value,
                AvgWeight = g.Statistics.Single().Ratings.Single().AverageWeight.Value,
                MinPlayTime = g.MinPlayTime.Value,
                MaxPlayTime = g.MaxPlayTime.Value,
                IsExpansion = g.Type == "boardgameexpansion",
                ThreadSequence = threadGameIds.IndexOf(g.ObjectId) + 1,
                GeekListSequence = geekListGameIds.IndexOf(g.ObjectId) + 1,
                CacheDate = g.CacheDate,
                UserStats = collections
                    .Select(c => {
                        var collectionGame = c.Value.FirstOrDefault(cg => cg.Id == g.ObjectId);
                        double.TryParse(collectionGame?.Stats.Rating.Value, out var rating);
                        return new UserStats {
                            Username = c.Key,
                            Rating = rating == 0 ? null : rating,
                            IsOwned = collectionGame?.Status.Own ?? false,
                            IsWishlisted = collectionGame?.Status.Wishlist ?? false,
                            CacheDate = collectionGame?.CacheDate,
                        };
                    })
                    .ToList(),
                PlayerCountStats = g.Poll
                    .Where(p => p.Name == PollName.SuggestedNumPlayers).Single().Results
                    .Select(r => {
                        if (!int.TryParse(r.NumPlayers, out var numPlayers)) {
                            return new PlayerCountStats();
                        }

                        return new PlayerCountStats {
                            PlayerCount = numPlayers,
                            BestVotes = r.Results.Single(r2 => r2.Value == "Best").NumVotes,
                            RecommendedVotes = r.Results.Single(r2 => r2.Value == "Recommended").NumVotes,
                            NotRecommendedVotes = r.Results.Single(r2 => r2.Value == "Not Recommended").NumVotes,
                        };
                    })
                    .Where(r => r.TotalVotes > 0 && r.NotRecommendedPercent < 0.95)
                    .ToList(),
            })
            .OrderBy(g => g.Name)
            .ToList();

        var geekRatingRanks = collectionSet.OrderByDescending(g => g.GeekRating).ToRankDictionary();
        var avgPlayerRatingRanks = collectionSet.OrderByDescending(g => g.AvgPlayerRating).ToRankDictionary();
        var avgWeightRanks = collectionSet.OrderByDescending(g => g.AvgWeight).ToRankDictionary();

        collectionSet.ForEach(g => {
            g.GeekRatingRank = geekRatingRanks[g.GameId];
            g.AvgPlayerRatingRank = avgPlayerRatingRanks[g.GameId];
            g.AvgWeightRank = avgWeightRanks[g.GameId];
       });

        var playerCounts = collectionSet.SelectMany(g => g.PlayerCountStats.Select(s => s.PlayerCount)).Distinct().ToList();

        playerCounts.ForEach(c => {
            var playerCountRanks = collectionSet
                .Where(g => g.PlayerCountStats.Any(s => s.PlayerCount == c))
                .OrderByDescending(g => g.PlayerCountStats.Single(s => s.PlayerCount == c).Score)
                .ToRankDictionary();

            collectionSet.ForEach(g => {
                if (playerCountRanks.ContainsKey(g.GameId)) {
                    g.PlayerCountStats.Single(s => s.PlayerCount == c).Rank = playerCountRanks[g.GameId];
                }
            });
        });

        usernames?.ToList().ForEach(username => {
            var userRanks = collectionSet
                .Where(g => g.UserStats.Any(r => r.Username == username && r.Rating.HasValue))
                .OrderByDescending(g => g.UserStats.Single(r => r.Username == username).Rating)
                .ToRankDictionary();

            collectionSet.ForEach(g => {
                if (userRanks.ContainsKey(g.GameId)) {
                    g.UserStats.Single(r => r.Username == username).Rank = userRanks[g.GameId];
                }
            });
        });

        response.Games = collectionSet;

        return response;
    }
}
