﻿namespace GeekRankerApi.Models;

public class GetRankingsResponse {
    public string ThreadTitle { get; set; }
    public string GeekListTitle { get; set; }
    public List<CollectionGame> Games { get; set; }
}

public class CollectionGame {
    public int GameId { get; set; }
    public string Name { get; set; }
    public string ImageUrl { get; set; }
    public List<PlayerCountStats> PlayerCountStats { get; set; }
    public List<UserStats> UserStats { get; set; }
    public double AvgWeight { get; set; }
    public double AvgPlayerRating { get; set; }
    public double GeekRating { get; set; }
    public int AvgWeightRank { get; set; }
    public int AvgPlayerRatingRank { get; set; }
    public int GeekRatingRank { get; set; }
    public int MinPlayTime { get; set; }
    public int MaxPlayTime { get; set; }
    public bool IsExpansion { get; set; }
    public int? ThreadSequence { get; set; }
    public int? GeekListSequence { get; set; }
    public DateTime CacheDate { get; set; }
}

public class PlayerCountStats {
    public int PlayerCount { get; set; }
    public int BestVotes { get; set; }
    public int RecommendedVotes { get; set; }
    public int NotRecommendedVotes { get; set; }
    public int TotalVotes => BestVotes + RecommendedVotes + NotRecommendedVotes;
    public double BestPercent => TotalVotes > 0 ? (double)BestVotes / TotalVotes : 0;
    public double RecommendedPercent => TotalVotes > 0 ? (double)RecommendedVotes / TotalVotes : 0;
    public double NotRecommendedPercent => TotalVotes > 0 ? (double)NotRecommendedVotes / TotalVotes : 0;
    public double Score => (BestPercent + (RecommendedPercent * (3.0/ 4))) * 10.0;
    public int Rank { get; set; }
}

public class UserStats {
    public string Username { get; set; }
    public double? Rating { get; set; }
    public int Rank { get; set; }
    public bool IsOwned { get; set; }
    public bool IsWishlisted { get; set; }
    public DateTime? CacheDate { get; set; }
}
