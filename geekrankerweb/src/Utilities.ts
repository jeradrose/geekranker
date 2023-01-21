export enum QueryParams {
  Usernames = "u",
  ThreadId = "t",
  GeekListId = "l",
  Sort = "s",
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
  ShowIndividualUserRatings = "sir",
  IncludeOwned = "own",
  IncludeWishlisted = "wish",
  IncludeRated = "rated",
  IncludeBase = "base",
  IncludeExpansion = "exp",
  GameIdFilter = "fid",
  ScorePlayerCount = "spc",
  PlayerCount = "pc",
  PlayerCountRange = "pcr",
  IdealWieght = "iw",
  IdealTime = "it",
  BaseRating = "br",
  FallBackTo = "fb",
  GameIds = "g",
}

export const defaultQueryValues: { [key in QueryParams]: any } = {
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
  [QueryParams.ShowPlayerRating]: false,
  [QueryParams.ShowGeekRating]: false,
  [QueryParams.ShowPlayerCount]: true,
  [QueryParams.ShowWeight]: true,
  [QueryParams.ShowTime]: true,
  [QueryParams.ShowIndividualUserRatings]: false,
  [QueryParams.IncludeOwned]: true,
  [QueryParams.IncludeWishlisted]: false,
  [QueryParams.IncludeRated]: false,
  [QueryParams.IncludeBase]: true,
  [QueryParams.IncludeExpansion]: false,
  [QueryParams.GameIdFilter]: "all",
  [QueryParams.ScorePlayerCount]: true,
  [QueryParams.PlayerCount]: 2,
  [QueryParams.PlayerCountRange]: "2 4",
  [QueryParams.IdealWieght]: null,
  [QueryParams.IdealTime]: null,
  [QueryParams.BaseRating]: "user-rating",
  [QueryParams.FallBackTo]: "player-rating",
}

export const queryParams = new URLSearchParams(window.location.search);

export const getTypedStringQueryParam = <T>(queryParam: QueryParams): T => {
  const param = queryParams.get(queryParam) as T;
  return param === null ? defaultQueryValues[queryParam] as T : param;
}

export const getStringQueryParam = (queryParam: QueryParams): string => {
  const param = queryParams.get(queryParam);
  return param === null ? defaultQueryValues[queryParam] as string : param;
}

export const getNumberQueryParam = (queryParam: QueryParams): number => {
  const param = queryParams.get(queryParam);
  return !param ? defaultQueryValues[queryParam] as number : parseInt(param);
}

export const getNumberArrayQueryParam = (queryParam: QueryParams): number[] => {
  const param = queryParams.get(queryParam);
  var arrayString = !param ? defaultQueryValues[queryParam] : param;
  return [parseInt(arrayString.split(" ")[0]), parseInt(arrayString.split(" ")[1])];
}

export const getBoolQueryParam = (queryParam: QueryParams): boolean => {
  const param = queryParams.get(queryParam);
  return param === null ?
    defaultQueryValues[queryParam] as boolean :
    !(param.toLowerCase() === "false" || param.toLowerCase() === "f" || param === "0" || param === "no");
}

export const getApiUrl = (url: string): string =>
  (process.env.NODE_ENV === "production" ? "https://api.geekranker.com" : "") + url;
