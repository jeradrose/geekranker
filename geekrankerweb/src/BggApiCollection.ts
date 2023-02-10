export interface BggCollectionResult {
  items: BggCollection,
}

export interface BggCollection {
  item: BggCollectionGame[],
}

export interface BggCollectionGame {
  $: BggCollectionGameAttributes,
  stats: BggCollectionStats[],
  status: BggCollectionStatus[],
}

export interface BggCollectionGameAttributes {
  objectid: string,
}

export interface BggCollectionStats {
  rating: BggCollectionStatsRating[],
}

export interface BggCollectionStatsRating {
  $: BggCollectionStatsRatingAttributes,
}

export interface BggCollectionStatsRatingAttributes {
  value: string,
}

export interface BggCollectionStatus {
  $: BggCollectionStatusAttributes,
}

export interface BggCollectionStatusAttributes {
  own: string,
  wishlist: string,
}
