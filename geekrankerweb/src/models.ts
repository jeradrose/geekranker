export interface CollectionGame {
    gameId: number;
    name: string;
    imageUrl: string;
    playerCountStats: PlayerCountStats[];
    playerRatings: PlayerRating[];
    avgWeight: number;
    avgPlayerRating: number;
    geekRating: number;
    avgWeightRank: number;
    avgPlayerRatingRank: number;
    geekRatingRank: number;
    minPlayTime: number;
    maxPlayTime: number;
}

export interface PlayerCountStats {
    playerCount: number;
    bestVotes: number;
    recommendedVotes: number;
    notRecommendedVotes: number;
    totalVotes: number;
    bestPercent: number;
    recommendedPercent: number;
    notRecommendedPercent: number;
    score: number;
    rank: number;
}

export interface PlayerRating {
    username: string;
    rating: number | null;
    rank: number | null;
}
