import { Game, PlayerCountStats } from "./models";

export type SelectedTab = "user" | "game" | "thread" | "geeklist" | "advanced";

export const sortOptions = ["game", "id", "gr-index", "user-rating", "player-rating", "geek-rating", "weight", "time", "thread", "geek-list", "year"] as const;
export type SortOptions = typeof sortOptions[number];

export type DisplayMode = "vertical" | "horizontal";

export type CurrentlyLoading = "users" | "games" | "thread" | "geeklist";

export interface ApiState {
  currentlyLoading?: CurrentlyLoading;
  currentItem?: number,
  maxItem?: number,
  isRequestPending?: boolean,
  isNotFound?: boolean,
  usernamesNotFound?: string[],
}

export enum QueryParams {
  SelectedTab = "tab",
  Usernames = "u",
  ThreadId = "t",
  GeekListId = "gl",
  Sort = "sort",
  ShowGameId = "sid",
  ShowThreadSequence = "sts",
  ShowGeekListSequence = "sgl",
  ShowGrIndex = "sgi",
  ShowUserRating = "sur",
  ShowPlayerRating = "spr",
  ShowGeekRating = "sgr",
  ShowPlayerCount = "spc",
  ShowWeight = "sw",
  ShowTime = "st",
  ShowYear = "sy",
  ShowIndividualUserRatings = "sir",
  IncludeOwned = "own",
  IncludeWishlisted = "wish",
  IncludeRated = "rated",
  IncludeBase = "base",
  IncludeExpansion = "exp",
  GameIdFilter = "fid",
  ScorePlayerCount = "scpc",
  PlayerCountRange = "pc",
  IdealWieght = "iw",
  IdealTime = "it",
  IdealYear = "iy",
  ScoreUserRating = "scur",
  ScorePlayerRating = "scpr",
  ScoreGeekRating = "scgr",
  GameIds = "g",
}

export const defaultQueryValues: { [key in QueryParams]: number | string | boolean | undefined } = {
  [QueryParams.SelectedTab]: "user",
  [QueryParams.Usernames]: undefined,
  [QueryParams.GameIds]: undefined,
  [QueryParams.ThreadId]: undefined,
  [QueryParams.GeekListId]: undefined,
  [QueryParams.Sort]: "gr-index",
  [QueryParams.ShowGameId]: false,
  [QueryParams.ShowThreadSequence]: false,
  [QueryParams.ShowGeekListSequence]: false,
  [QueryParams.ShowGrIndex]: true,
  [QueryParams.ShowUserRating]: true,
  [QueryParams.ShowPlayerRating]: true,
  [QueryParams.ShowGeekRating]: false,
  [QueryParams.ShowPlayerCount]: true,
  [QueryParams.ShowWeight]: true,
  [QueryParams.ShowTime]: true,
  [QueryParams.ShowYear]: false,
  [QueryParams.ShowIndividualUserRatings]: false,
  [QueryParams.IncludeOwned]: true,
  [QueryParams.IncludeWishlisted]: false,
  [QueryParams.IncludeRated]: false,
  [QueryParams.IncludeBase]: true,
  [QueryParams.IncludeExpansion]: false,
  [QueryParams.GameIdFilter]: "all",
  [QueryParams.ScorePlayerCount]: true,
  [QueryParams.PlayerCountRange]: "2 4",
  [QueryParams.IdealWieght]: undefined,
  [QueryParams.IdealTime]: undefined,
  [QueryParams.IdealYear]: undefined,
  [QueryParams.ScoreUserRating]: true,
  [QueryParams.ScorePlayerRating]: true,
  [QueryParams.ScoreGeekRating]: false,
}

export const getQueryParam = (queryParam: QueryParams) =>
  (new URLSearchParams(window.location.search)).get(queryParam);

export const getTypedStringQueryParam = <T>(queryParam: QueryParams): T => {
  const param = getQueryParam(queryParam) as T;
  return param === null ? defaultQueryValues[queryParam] as T : param;
}

export const getStringQueryParam = (queryParam: QueryParams): string => {
  const param = getQueryParam(queryParam);
  return param === null ? defaultQueryValues[queryParam] as string : param;
}

export const getNumberQueryParam = (queryParam: QueryParams): number => {
  const param = getQueryParam(queryParam);
  return !param ? defaultQueryValues[queryParam] as number : parseInt(param);
}

export const getNumberArrayQueryParam = (queryParam: QueryParams): number[] => {
  const param = getQueryParam(queryParam);
  const arrayString = !param ? defaultQueryValues[queryParam] as string : param;
  return [parseInt(arrayString.split(" ")[0]), parseInt(arrayString.split(" ")[1])];
}

export const getBoolQueryParam = (queryParam: QueryParams): boolean => {
  const param = getQueryParam(queryParam);
  return param === null ?
    defaultQueryValues[queryParam] as boolean :
    !(param.toLowerCase() === "false" || param.toLowerCase() === "f" || param === "0" || param === "no");
}

export const getApiUrl = (url: string): string =>
  (process.env.NODE_ENV === "production" ? "https://api.geekranker.com" : "") + url;

export const getSortLabel = (sortOption: SortOptions) => {
  switch (sortOption) {
    case "game": return "Game";
    case "id": return "ID";
    case "thread": return "# in Thread";
    case "geek-list": return "# on GeekList";
    case "gr-index": return "GR Index";
    case "user-rating": return "User Rating";
    case "player-rating": return "Average Rating";
    case "geek-rating": return "Geek Rating";
    case "weight": return "Weight";
    case "time": return "Time";
    case "year": return "Year";
  }
}

export const getUsernamesFromString = (usernamesString: string | undefined | null): string[] => {
  const spacesWithQuotesRegex = /[^a-zA-Z0-9_\-"](?=(?:[^"]*"[^"]*")*[^"]*$)/;
  const usernames = usernamesString?.split(spacesWithQuotesRegex).map(u => u.replaceAll('"', ''));
  return usernames?.filter(u => u.length) ?? [];
}

export const getGameIdsFromString = (gameIdsString: string | undefined | null): number[] =>
  gameIdsString?.split(/[^0-9]/).filter(id => id.length).map(id => parseInt(id)) ?? [];

export const getIdFromString = (idString: string | undefined | null): number | undefined => {
  const parsedId = parseInt(idString?.split(/[^0-9]/).find(id => id.length) || "");
  return isNaN(parsedId) ? undefined : parsedId;
}

export const updateRanks = <T>(
  list: T[],
  scoreGetter: (item: T) => number | undefined,
  idGetter: (item: T) => number,
  rankSetter: (item: T, rank: number | undefined) => void
) => {
  const ranks = list
    .sort((a, b) => (scoreGetter(b) || 0) - (scoreGetter(a) || 0))
    .map(i => idGetter(i));

  list.map(i => rankSetter(i, scoreGetter(i) && ranks.indexOf(idGetter(i)) + 1));
}

export const getGameUserRating = (username: string, game: Game): number | undefined => {
  const filteredPlayerRating = game.userStats.filter(r => r.username === username);

  const hasUserRating = filteredPlayerRating.length === 1;

  return hasUserRating && filteredPlayerRating[0].rating || undefined;
}

export const getGamePlayerCountStats = (count: number, game: Game): PlayerCountStats | undefined =>
  game.playerCountStats.find(s => s.playerCount === count);

export const getBggGameUrl = (gameId: number) =>
  `https://www.boardgamegeek.com/boardgame/${gameId}`;

export const getIsMobileView = (screenWidth: number) => screenWidth < 600;

export const getShowCondensedFooter = (screenWidth: number) => screenWidth < 800;