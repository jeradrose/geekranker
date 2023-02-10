export interface GetRankingsResponse {
  threadTitle: string;
  geekListTitle: string;
  games: Game[];
}

export interface Game {
  gameId: number;
  name: string;
  imageUrl: string;
  playerCountStats: PlayerCountStats[];
  userStats: UserStats[];
  grIndex: number;
  grIndexRank: number;
  avgWeight: number;
  avgWeightRank: number;
  avgPlayerRating: number;
  avgPlayerRatingRank: number;
  avgUserRating: number;
  avgUserRatingRank: number;
  geekRating: number;
  geekRatingRank: number;
  minPlayTime: number;
  maxPlayTime: number;
  isExpansion: boolean;
  threadSequence: number;
  geekListSequence: number;
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
  gameId: number;
  rating: number | undefined;
  rank: number | undefined;
  isOwned: boolean;
  isWishlisted: boolean;
  cacheDate: Date | undefined;
}
