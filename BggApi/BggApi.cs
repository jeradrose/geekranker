using BggApi.Models;
using Microsoft.Extensions.Caching.Distributed;
using NeoSmart.Caching.Sqlite;
using System.Xml.Serialization;
using Thread = BggApi.Models.Thread;
using SystemThread = System.Threading.Thread;
using System.Threading;

namespace BggApi;

public class BggClient {
    private static readonly HttpClient _client = new HttpClient();

    public async Task<List<BoardGame>?> GetBoardGamesAsync(IEnumerable<int> gameIds) {
        var gameIdList = string.Join(',', gameIds.Distinct().Order());
        var cacheKey = $"{nameof(GetBoardGamesAsync)}-{gameIdList}";
        var url = $"https://boardgamegeek.com/xmlapi2/thing?id={gameIdList}&stats=1";

        return await GetOrSetXmlAndDateCache<List<BoardGame>?>(cacheKey, url, "items");
    }

    public async Task<List<CollectionItem>?> GetCollectionAsync(string username) {
        var cacheKey = $"{nameof(GetCollectionAsync)}-{username}";
        var url = $"https://boardgamegeek.com/xmlapi2/collection?username={username}&stats=1";

        return await GetOrSetXmlAndDateCache<List<CollectionItem>?>(cacheKey, url, "items");
    }

    public async Task<Thread?> GetThreadAsync(int threadId) {
        var cacheKey = $"{nameof(GetThreadAsync)}-{threadId}";
        var url = $"https://boardgamegeek.com/xmlapi2/thread?id={threadId}";

        return await GetOrSetXmlAndDateCache<Thread?>(cacheKey, url, "thread");
    }

    public async Task<GeekList?> GetGeekListAsync(int geekListId) {
        var cacheKey = $"{nameof(GetGeekListAsync)}-{geekListId}";
        var url = $"https://boardgamegeek.com/xmlapi/geeklist/{geekListId}";

        return await GetOrSetXmlAndDateCache<GeekList?>(cacheKey, url, "geeklist");
    }

    private async Task<T?> GetOrSetXmlAndDateCache<T>(string cacheKey, string url, string xmlRoot) where T : new() {
        var cache = new SqliteCache(new SqliteCacheOptions());
        var cacheDateKey = $"{cacheKey}-date";

        var xml = cache.GetString(cacheKey);
        var dateString = cache.GetString(cacheDateKey);

        var response = default(T);

        if (!string.IsNullOrEmpty(xml) && !string.IsNullOrEmpty(dateString)) {
            response = SerializeXmlSafe<T?>(xml, xmlRoot);
            if (response != null) {
                return response;
            }
        }

        const int maxRetries = 10;

        async Task<string> apiCallAsync() {
            try {
                return await _client.GetStringAsync(url);
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
            SystemThread.Sleep(1000 * tries); // Add another second delay for each retry
            xml = await apiCallAsync();
        }

        if (xml.Contains("Invalid username")) {
            return default;
        }

        dateString = DateTime.UtcNow.ToString();

        cache.SetString(cacheKey, xml);
        cache.SetString(cacheDateKey, dateString);

        return SerializeXml<T?>(xml, xmlRoot);
    }

    private T? SerializeXmlSafe<T>(string xml, string xmlRoot) where T : new() {
        try {
            return SerializeXml<T>(xml, xmlRoot);
        } catch {
            return default;
        }
    }

    private T? SerializeXml<T>(string xml, string xmlRoot) where T : new() {
        var serializer = new XmlSerializer(
            typeof(T),
            new XmlRootAttribute(xmlRoot)
        );

        using var sr = new StringReader(xml);

        return (T?)serializer.Deserialize(sr);
    }
}
