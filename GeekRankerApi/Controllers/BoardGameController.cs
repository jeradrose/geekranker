using BggApi;
using BggApi.Models;
using GeekRankerApi.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace GeekRankerApi.Controllers;

[ApiController]
[Route("[controller]")]
public class BoardGameController : ControllerBase {
    private static readonly BggClient _bggApi = new BggClient();
    private readonly ILogger<BoardGameController> _logger;

    public BoardGameController(ILogger<BoardGameController> logger) {
        _logger = logger;
    }

    [HttpGet("GetGame")]
    public async Task<List<BoardGame>> GetGame(int id) {
        return await _bggApi.GetBoardGamesAsync(new []{ id });
    }

    [HttpGet("GetCollection")]
    public async Task<List<CollectionItem>> GetCollection(string username) {
        return await _bggApi.GetCollectionAsync(username);
    }

    [HttpPost("GetRankings")]
    public async Task<List<CollectionGame>> GetRankings([FromBody]GetRankingsRequest request) {
        var usernames = request.Usernames.Where(un => !string.IsNullOrEmpty(un)).Distinct().ToArray();
        var gameIds = request.GameIds.Distinct().ToList();

        var collections = new Dictionary<string, List<CollectionItem>>();

        foreach (var username in usernames) { 
            collections.Add(username, await _bggApi.GetCollectionAsync(username));
        }

        gameIds.AddRange(collections.SelectMany(s => s.Value.Select(g => g.Id)).Distinct());

        gameIds = gameIds.Distinct().Order().ToList();

        var games = await _bggApi.GetBoardGamesAsync(gameIds);

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

        usernames.ToList().ForEach(username => {
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

        return collectionSet;
    }
}
