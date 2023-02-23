export interface BggGamesResult {
  items: BggGames,
}

export interface BggGames {
  item: BggGame[],
}

export interface BggGame {
  $: BggGameAttributes,
  thumbnail: string,
  name: BggGameName[],
  minplaytime: StringValue[],
  maxplaytime: StringValue[],
  poll: BggGamePoll[],
  statistics: BggGameStatistics[],
  yearpublished: StringValue[],
}

export interface BggGameAttributes {
  type: "boardgame" | "boardgameexpansion",
  id: number,
}

export interface BggGameName {
  $: BggGameNameAttributes,
}

export interface BggGameNameAttributes {
  type: "primary" | "alternate",
  value: string,
}

export interface StringValue {
  $: StringValueAttributes,
}

export interface StringValueAttributes {
  value: string,
}

export interface BggGamePoll {
  $: BggGamePollAttributes,
  results: BggGamePollResults[],
}

export interface BggGamePollAttributes {
  name: "suggested_numplayers" | "suggested_playerage" | "language_dependence",
}

export interface BggGamePollResults {
  $: BggGameNumPlayersAttributes,
  result: BggGamePollResult[],
}

export interface BggGameNumPlayersAttributes {
  numplayers: string,
}

export interface BggGamePollResult {
  $: BggGamePollResultAttributes,
}

export interface BggGamePollResultAttributes {
  numvotes: string,
  value: "Best" | "Recommended" | "Not Recommended",
}

export interface BggGameStatistics {
  ratings: BggGameRatings[],
}

export interface BggGameRatings {
  average: StringValue[],
  bayesaverage: StringValue[],
  averageweight: StringValue[],
}
