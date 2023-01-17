export interface CollectionGame {
  gameId: number;
  name: string;
  imageUrl: string;
  playerCountStats: PlayerCountStats[];
  userStats: UserStats[];
  avgWeight: number;
  avgPlayerRating: number;
  geekRating: number;
  avgWeightRank: number;
  avgPlayerRatingRank: number;
  geekRatingRank: number;
  minPlayTime: number;
  maxPlayTime: number;
  isExpansion: boolean;
  isFromThread: boolean;
  cacheDate: Date;
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

export interface UserStats {
  username: string;
  rating: number | null;
  rank: number | null;
  isOwned: boolean;
  isWishlisted: boolean;
  cacheDate: Date | null;
}
