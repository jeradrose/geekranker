namespace GeekRankerApi.Models;

public class CollectionGame {
    public int GameId { get; set; }
    public string Name { get; set; }
    public string ImageUrl { get; set; }
    public List<PlayerCountStats> PlayerCountStats { get; set; }
    public List<UserRating> UserRatings { get; set; }
    public double AvgWeight { get; set; }
    public double AvgPlayerRating { get; set; }
    public double GeekRating { get; set; }
    public int AvgWeightRank { get; set; }
    public int AvgPlayerRatingRank { get; set; }
    public int GeekRatingRank { get; set; }
    public int MinPlayTime { get; set; }
    public int MaxPlayTime { get; set; }
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

public class UserRating {
    public string Username { get; set; }
    public double? Rating { get; set; }
    public int Rank { get; set; }
}
