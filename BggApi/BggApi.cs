using BggApi.Models;
using Microsoft.Extensions.Caching.Distributed;
using NeoSmart.Caching.Sqlite;
using System.Xml.Serialization;

namespace BggApi;

public class BggClient {
    private static readonly HttpClient _client = new HttpClient();

    public async Task<List<BoardGame>> GetBoardGamesAsync(int[] gameIds) {
        var cache = new SqliteCache(new SqliteCacheOptions());
        var gameIdList = string.Join(',', gameIds.Distinct().Order());
        var cacheKey = $"{nameof(GetBoardGamesAsync)}-{gameIdList}";
        var cacheDateKey = $"{cacheKey}-date";

        var xml = cache.GetString(cacheKey);
        var dateString = cache.GetString(cacheDateKey);

        if (string.IsNullOrEmpty(xml) || string.IsNullOrEmpty(dateString)) {
            xml = await _client.GetStringAsync($"https://boardgamegeek.com/xmlapi2/thing?id={gameIdList}&stats=1");
            dateString = DateTime.UtcNow.ToString();
            cache.SetString(cacheKey, xml, new DistributedCacheEntryOptions { });
            cache.SetString(cacheDateKey, dateString);
        }

        var serializer = new XmlSerializer(
            typeof(List<BoardGame>), 
            new XmlRootAttribute("items")
        );

        using var sr = new StringReader(xml);

        var boardGames = (List<BoardGame>?)serializer.Deserialize(sr);

        boardGames?.ForEach(g => g.CacheDate = DateTime.Parse(dateString));

        if (boardGames == null) {
            return new List<BoardGame>();
        }

        return boardGames;
    }

    public async Task<List<CollectionItem>> GetCollectionAsync(string username) {
        var cache = new SqliteCache(new SqliteCacheOptions());
        var cacheKey = $"{nameof(GetCollectionAsync)}-{username}";
        var cacheDateKey = $"{cacheKey}-date";

        var xml = cache.GetString(cacheKey);
        var dateString = cache.GetString(cacheDateKey);

        if (string.IsNullOrEmpty(xml) || string.IsNullOrEmpty(dateString)) {
            const int maxRetries = 10;

            async Task<string> apiCallAsync() {
                try {
                    return await _client.GetStringAsync($"https://boardgamegeek.com/xmlapi2/collection?username={username}&stats=1&excludesubtype=boardgameexpansion");
                } catch (Exception ex) {
                    throw new BggException($"Exception calling BGG API after {maxRetries} attempts: {ex.Message}");
                }
            }

            xml = await apiCallAsync();
            var tries = 0;

            while (xml.Contains("Please try again later for access.") && tries <= maxRetries) {
                if (tries == maxRetries) {
                    throw new BggException("Too many attempts.");
                }
                tries++;
                Thread.Sleep(1000 * tries); // Add another second delay for each retry
                xml = await apiCallAsync();
            }

            if (xml.Contains("Invalid username")) {
                return new List<CollectionItem>();
            }

            dateString = DateTime.UtcNow.ToString();

            cache.SetString(cacheKey, xml);
            cache.SetString(cacheDateKey, dateString);
        }

        var serializer = new XmlSerializer(
            typeof(List<CollectionItem>),
            new XmlRootAttribute("items")
        );

        using var sr = new StringReader(xml);

        var collection = (List<CollectionItem>?)serializer.Deserialize(sr);

        collection?.ForEach(g => g.CacheDate = DateTime.Parse(dateString));

        if (collection == null) {
            return new List<CollectionItem>();
        }

        return collection;
    }
}
