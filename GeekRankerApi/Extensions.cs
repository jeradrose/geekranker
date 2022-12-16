using GeekRankerApi.Models;

namespace GeekRankerApi {
    public static class Extensions {
        public static Dictionary<int, int> ToRankDictionary(this IOrderedEnumerable<CollectionGame> collectionGames) =>
            collectionGames.Select((g, i) => new { g.GameId, Rank = i + 1 }).ToDictionary(g => g.GameId, g => g.Rank);
    }
}
