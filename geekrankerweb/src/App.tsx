import React, { useEffect, useState, useRef } from 'react';
import { CollectionGame } from './models';
import "typeface-open-sans";
import { ArrowDownward, ExpandLess, ExpandMore, Info, Clear } from '@mui/icons-material';
import { TextField, Button, Tooltip, Switch, FormControlLabel, Slider, RadioGroup, Radio, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';

import styled, { createGlobalStyle } from "styled-components"

import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({
  typography: {
    fontFamily: 'Open Sans',
    fontWeightRegular: 600,
  },
});

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Open Sans';
    font-size: '1.2rem';
    font-weight: 600;
    color: #333;
    margin: 0;
    padding: 0;
    background-color: #eee;
    display: inline-flex;
  }
`;

const PageHeaderContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 15px 15px 0 15px;
  position: sticky;
  left: 0;
`;

const PageHeader = styled.div`
  display: inline-flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-grow: 1;
  flex-wrap: wrap-reverse;
  gap: 10px;
`;

const Filters = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  user-select: none;
`;

const FilterLabel = styled.div`
  padding-right: 15px;
`;

const FiltersInnerRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`

const FiltersContainer = styled(FiltersInnerRow)`
  margin: 0 0 10px 0;
  flex-grow: 1;
`;

const FiltersHeader = styled(FiltersInnerRow)`
  font-weight: bold;
  margin-top: 10px;
`;

const PlayerFilter = styled.div`
  width: 100%;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const Input = styled(TextField)`
  box-sizing: border-box;
  width: 100%;
  background-color: #fff;
`;

const ClearIcon = styled(Clear)`
  padding-right: -120px;
`;

const SliderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 320px;
`;

const SliderLabel = styled.div`
  flex-basis: 170px;
  justify-items: center;
`;

const StyledSlider = styled(Slider)`
  flex-basis: 100px;
`;

const SliderValue = styled.div`
  text-align: center;
  flex-basis: 50px;
  padding-right: 5px;
  font-weight: bold;
  color: #348CE9;
`;

const FallBackContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const FallBackInfo = styled(Info)`
 size: 14px;
 color: #348CE9;
`;

const FilterButton = styled(Button)`
  width: 160px;
`;

const Logo = styled.img`
  max-width: 100%;
  width: 400px;
  object-fit: contain;
  padding: 5px 0;
`;

const AdvancedOptionsButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  user-select: none;
`;

const GamesHeader = styled.div`
  display: inline-block;
  position: sticky;
  top: 0;
  background-color: #fcfcfc;
  z-index: 20;
  height: 40px;
`;

const RowBase = styled.div`
  display: inline-flex;
  justify-content: space-between;
  height: 40px;
  box-sizing: border-box;
`;

const HeaderRow = styled(RowBase)`
  background-color: #348CE9;
  font-weight: bold;
  color: #fff;
  padding: 0 15px;
`;

const GameHorizontally = styled(RowBase)`
  margin: 2px 0;
  padding: 5px 15px;
  background-color: #fcfcfc;
  :hover {
    background-color: #f4f4f4;
  }
`;

const GameVertically = styled.div`
  display: inline-flex;
  box-sizing: border-box;
  flex-direction: column;
`;

const CellBase = styled.div`
  display: inline-flex;
  margin: 1px 0;
  flex-grow: 1;
  min-width: 200px;
`;

const HorizontalCell = styled(CellBase)`
  justify-content: space-between;
  flex-basis: 200px;
`;

const VerticalCell = styled(CellBase)`
  padding: 5px 15px;
  background-color: #fcfcfc;
`;

const VerticalLabel = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  max-width: 200px;
`;

const ImageAndNameHeader = styled.a`
  box-sizing: border-box;
  align-self: center;
  display: inline-flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  flex-grow: 1;
  width: 200px;
  min-width: 200px;
  text-decoration: none;
  cursor: pointer;
  padding-right: 5px;
`;

const ThumbnailContainer = styled.div`
  width: 30px;
  min-width: 30px;
  height: 30px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const RowCell = styled.div`
  align-self: center;
`;

const ImageAndNameHorizontal = styled(ImageAndNameHeader)`
  color: inherit;
`;

const ImageAndNameVertical = styled(ImageAndNameHeader)`
  position: sticky;
  top: 0;
  color: inherit;
  align-self: flex-start;
  background-color: #348CE9;
  font-weight: bold;
  color: #fff;
  padding: 5px 15px;
  width: 100%;
  z-index: 20;
`;

const Thumbnail = styled.img`
  max-width: 30px;
  max-height: 30px;
`;

const GameName = styled(RowCell)`
  margin-left: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BarHeader = styled(RowCell)`
  display: inline-flex;
  align-items: center;
  justify-content: left;
  cursor: pointer;
  flex-grow: 1;
  flex-basis: 200px;
  min-width: 200px;
`;

const BarContainerBase = styled(RowCell)`
  height: 20px;
  display: flex;
`;

const BarContainerHorizontal = styled(BarContainerBase)`
  flex-grow: 1;
  flex-basis: 200px;
  min-width: 200px;
`;

const BarContainerVertical = styled(BarContainerBase)`
  width: 200px;
`;

const BarContainerFadedHorizontal = styled(BarContainerHorizontal)`
  opacity: 50%;
  filter: grayscale();
`;

const BarContainerFadedVertical = styled(BarContainerVertical)`
  opacity: 50%;
  filter: grayscale();
`;

const Bar = styled.div`
  width: 150px;
  height: 20px;
  display: inline-flex;
  background-color: #F25D07;
`;

const BarPlus = styled.div`
  width: 0; 
  height: 0; 
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  
  border-left: 10px solid #F25D07;
`;

const BarText = styled.div`
  padding-left: 2px;
  line-height: 20px;
`;

const BarRank = styled.span`
  color: #348CE9;
  opacity: 75%;
  padding-left: 6px;
`;

const EmptyState = styled.div`
  display: inline-flex;
  flex-direction: column;
  box-sizing: border-box;
  position: sticky;
  left: 0;
  justify-content: center;
  align-items: center;
  margin: -5px;
`;

const Intro = styled.div`
  background-color: #fcfcfc;
  padding: 15px;
  margin: 15px;
  border: 2px solid #F25D07;
  border-radius: 20px;
  max-width: 700px;
`;

const IntroHeader = styled.div`
  font-weight: bold;
`;

const IntroList = styled.ul`

`;

const IntroListItem = styled.li`
  margin: 10px 0;
`;

const IntroTip = styled.div`
  padding-top: 4px;
  color: #348CE9;
`

const IntroTipLink = styled(IntroTip)`
  cursor: pointer;
`

const sortOptions = ["game", "gr-index", "user-rating", "player-rating", "geek-rating", "weight", "time"] as const;
type SortOptions = typeof sortOptions[number] | any;

type RankedScore = {
  score: number;
  rank: number;
}

type RankedScores = Record<number, RankedScore>;

type FallBackTo = "player-rating" | "geek-rating";
type BaseRating = FallBackTo | "user-rating";

enum QueryParams {
  Usernames = "u",
  Sort = "s",
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
  ScorePlayerCount = "spc",
  PlayerCount = "pc",
  PlayerCountRange = "pcr",
  IdealWieght = "iw",
  IdealTime = "it",
  BaseRating = "br",
  FallBackTo = "fb",
}

const defaultQueryValues: { [key in QueryParams]: any } = {
  [QueryParams.Usernames]: "",
  [QueryParams.Sort]: "gr-index",
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
  [QueryParams.ScorePlayerCount]: true,
  [QueryParams.PlayerCount]: 2,
  [QueryParams.PlayerCountRange]: "2 4",
  [QueryParams.IdealWieght]: null,
  [QueryParams.IdealTime]: null,
  [QueryParams.BaseRating]: "user-rating",
  [QueryParams.FallBackTo]: "player-rating",
}

function App() {
  let params = new URLSearchParams(window.location.search);

  const usernamesRef = useRef<HTMLInputElement>(null);
  const renderCount = useRef<number>(0);

  const getUsernamesFromString = (usernamesString: string | undefined | null): string[] =>
    usernamesString?.split(/[^a-zA-Z0-9_]/).filter(u => u.length) ?? [];

  const getStringQueryParam = (queryParam: QueryParams): string => {
    const param = params.get(queryParam);
    return param === null ? defaultQueryValues[queryParam] as string : param;
  }

  const getNumberQueryParam = (queryParam: QueryParams): number => {
    const param = params.get(queryParam);
    return !param ? defaultQueryValues[queryParam] as number : parseInt(param);
  }

  const getNumberArrayQueryParam = (queryParam: QueryParams): number[] => {
    const param = params.get(queryParam);
    var arrayString = !param ? defaultQueryValues[queryParam] : param;
    return [parseInt(arrayString.split(" ")[0]), parseInt(arrayString.split(" ")[1])];
  }

  const getBoolQueryParam = (queryParam: QueryParams): boolean => {
    const param = params.get(queryParam);
    return param === null ?
      defaultQueryValues[queryParam] as boolean :
      !(param.toLowerCase() === "false" || param.toLowerCase() === "f" || param === "0" || param === "no");
  }

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [allGames, setAllGames] = useState<CollectionGame[]>([]);
  const [loadingGames, setLoadingGames] = useState<boolean>(false);

  // User option nullable defaults
  const idealTimeDefault = 60;
  const idealWeightDefault = 3;

  // Standard options
  const [usernames, setUsernames] = useState<string[]>(getUsernamesFromString(params.get("u")));
  const [sort, setSort] = useState<SortOptions>(getStringQueryParam(QueryParams.Sort));

  // Column visibility
  const [showGrIndex, setShowGrIndex] = useState<boolean>(getBoolQueryParam(QueryParams.ShowGrIndex));
  const [showGeekRating, setShowGeekRating] = useState<boolean>(getBoolQueryParam(QueryParams.ShowGeekRating));
  const [showPlayerRating, setShowPlayerRating] = useState<boolean>(getBoolQueryParam(QueryParams.ShowPlayerRating));
  const [showUserRating, setShowUserRating] = useState<boolean>(getBoolQueryParam(QueryParams.ShowUserRating));
  const [showTime, setShowTime] = useState<boolean>(getBoolQueryParam(QueryParams.ShowTime));
  const [showWeight, setShowWeight] = useState<boolean>(getBoolQueryParam(QueryParams.ShowWeight));
  const [showPlayerCount, setShowPlayerCount] = useState<boolean>(getBoolQueryParam(QueryParams.ShowPlayerCount));
  const [showIndividualUserRatings, setShowIndividualUserRatings] = useState<boolean>(getBoolQueryParam(QueryParams.ShowIndividualUserRatings));
  const [playerCountRange, setPlayerCountRange] = useState<number[]>(getNumberArrayQueryParam(QueryParams.PlayerCountRange));

  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);

  // Filter options
  const [includeOwned, setIncludeOwned] = useState<boolean>(getBoolQueryParam(QueryParams.IncludeOwned));
  const [includeWishlisted, setIncludeWishlisted] = useState<boolean>(getBoolQueryParam(QueryParams.IncludeWishlisted));
  const [includeRated, setIncludeRated] = useState<boolean>(getBoolQueryParam(QueryParams.IncludeRated));
  const [includeBase, setIncludeBase] = useState<boolean>(getBoolQueryParam(QueryParams.IncludeRated));
  const [includeExpansion, setIncludeExpansion] = useState<boolean>(getBoolQueryParam(QueryParams.IncludeRated));

  // Scoring options
  const [scorePlayerCount, setScorePlayerCount] = useState<boolean>(getBoolQueryParam(QueryParams.ScorePlayerCount));
  const [playerCount, setPlayerCount] = useState<number>(getNumberQueryParam(QueryParams.PlayerCount));
  const [includeIdealWeight, setIncludeIdealWeight] = useState<boolean>(getBoolQueryParam(QueryParams.IdealWieght));
  const [idealWeight, setIdealWeight] = useState<number>(getNumberQueryParam(QueryParams.IdealWieght) || idealWeightDefault);
  const [includeIdealTime, setIncludeIdealTime] = useState<boolean>(getBoolQueryParam(QueryParams.IdealTime));
  const [idealTime, setIdealTime] = useState<number>(getNumberQueryParam(QueryParams.IdealTime) || idealTimeDefault);
  const [baseRating, setBaseRating] = useState<BaseRating>(getStringQueryParam(QueryParams.BaseRating) as BaseRating);
  const [fallBackTo, setFallBackTo] = useState<FallBackTo>(getStringQueryParam(QueryParams.FallBackTo) as FallBackTo);

  // UI options
  const [preventHorizontalScroll,
    setPreventHorizontalScroll] = useState<boolean>(false);

  const [showTips, setShowTips] = useState<boolean>(false);

  const queryValues: { [key in QueryParams]: any } = {
    [QueryParams.Usernames]: usernames.join(' '),
    [QueryParams.Sort]: sort,
    [QueryParams.ShowGrIndex]: showGrIndex,
    [QueryParams.ShowUserRating]: showUserRating,
    [QueryParams.ShowPlayerRating]: showPlayerRating,
    [QueryParams.ShowGeekRating]: showGeekRating,
    [QueryParams.ShowPlayerCount]: showPlayerCount,
    [QueryParams.ShowWeight]: showWeight,
    [QueryParams.ShowTime]: showTime,
    [QueryParams.ShowIndividualUserRatings]: showIndividualUserRatings,
    [QueryParams.IncludeOwned]: includeOwned,
    [QueryParams.IncludeWishlisted]: includeWishlisted,
    [QueryParams.IncludeRated]: includeRated,
    [QueryParams.IncludeBase]: includeBase,
    [QueryParams.IncludeExpansion]: includeExpansion,
    [QueryParams.ScorePlayerCount]: scorePlayerCount,
    [QueryParams.PlayerCount]: playerCount,
    [QueryParams.PlayerCountRange]: `${playerCountRange[0]} ${playerCountRange[1]}`,
    [QueryParams.IdealWieght]: includeIdealWeight ? idealWeight : null,
    [QueryParams.IdealTime]: includeIdealTime ? idealTime : null,
    [QueryParams.BaseRating]: baseRating,
    [QueryParams.FallBackTo]: fallBackTo,
  }

  const updateMedia = () => {
    setScreenWidth(document.documentElement.clientWidth || document.body.clientWidth);
  };

  useEffect(() => {
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });

  const setOrDeleteParam = (queryParam: QueryParams) => {
    if (queryValues[queryParam] === defaultQueryValues[queryParam]) {
      params.delete(queryParam);
    } else {
      if (typeof queryValues[queryParam] === "boolean") {
        params.set(queryParam, queryValues[queryParam] ? "1" : "0");
      } else {
        params.set(queryParam, queryValues[queryParam]);
      }
    }
  }

  useEffect(() => {
    params = new URLSearchParams();

    Object.values(QueryParams).forEach(queryParam => {
      setOrDeleteParam(queryParam);
    });

    let url = location.pathname;

    if (params.toString()) {
      url += `?${params}`;
    }

    window.history.replaceState({}, '', url);
  });

  const getGrIndex = (game: CollectionGame): number => {
    let numerator = 1;
    let denominator = 1;

    switch (baseRating) {
      case "user-rating": {
        const userRatings = usernames.map(username => gameUserRating(username, game, false)[0]);
        const avgUserRating = (userRatings.reduce((a, b) => a + b) / userRatings.length);

        numerator *= avgUserRating;
        break;
      }
      case "player-rating": {
        numerator *= game.avgPlayerRating;
        break;
      }
      case "geek-rating": {
        numerator *= game.geekRating;
      }
    }

    denominator *= 10;

    if (scorePlayerCount) {
      const playerCountStats = game.playerCountStats.filter(s => s.playerCount === playerCount);

      if (playerCountStats.length !== 1) {
        return 0;
      }

      numerator *= playerCountStats[0].score;
      denominator *= 10;
    }

    if (includeIdealWeight) {
      numerator *= 5 - Math.abs(game.avgWeight - idealWeight);
      denominator *= 5;
    }

    if (includeIdealTime) {
      numerator *= Math.max(150 - Math.abs(game.maxPlayTime - idealTime), 0);
      denominator *= 150;
    }

    return 10 * numerator / denominator;
  }

  const getApiUrl = (url: string): string =>
    (process.env.NODE_ENV === "production" ? "https://api.geekranker.com" : "") + url;

  useEffect(() => {
    const getApiData = async () => {
      if (!usernames.length) {
        setAllGames([]);
        return;
      }

      setLoadingGames(true);

      try {
        const response = await fetch(
          getApiUrl("/BoardGame/GetRankings"),
          {
            method: 'post',
            body: JSON.stringify(usernames),
            headers: {
              'Content-type': 'application/json'
            }
          }
        );

        if (response.ok) {
          setAllGames(await response.json());
        }
      } catch (ex) {
        console.log(ex);
      } finally {
        setLoadingGames(false);
      }
    };

    getApiData();
  }, [usernames]);

  const lockInUsernames = () => {
    const newUsernames = getUsernamesFromString(usernamesRef.current?.value);

    if (newUsernames.length === 0) {
      setAllGames([]);
    }
    setUsernames(newUsernames);
  };

  const getScores = (scoreGetter: (game: CollectionGame) => number): RankedScores => {
    const scores: RankedScores = {};

    filteredGames.map(g => {
      scores[g.gameId] = {
        score: scoreGetter(g),
        rank: 1,
      };
    });

    const sorted = Object.entries(scores).sort(([, a], [, b]) => b.score - a.score).map(([gameId,]) => gameId);
    Object.entries(scores).map(s => scores[parseInt(s[0])].rank = sorted.indexOf(s[0]) + 1);

    return scores;
  }

  const innerBar = (value: number, maxValue: number, rank: number, idealValue?: number | false) =>
    value > 0 &&
    <>
      {idealValue &&
        <>
          <Bar style={{ width: (Math.min(value, idealValue) * (100 / maxValue)), opacity: (value / maxValue) }} />
          <Bar style={{ width: (Math.abs(idealValue - value) * (100 / maxValue)), opacity: (value / maxValue), backgroundColor: idealValue < value ? "#f00" : "#aaa" }} />
        </>
      }
      {!idealValue &&
        <Bar style={{ width: (value * (100 / maxValue)), opacity: (value / maxValue) }} />
      }
      <BarText>{value.toFixed(2)}{rank > 0 && <BarRank>#{rank}</BarRank>}</BarText>
    </>

  const bar = (value: number, maxValue: number, rank: number, idealValue?: number | false) =>
    value === 0 ? displayMode === "horizontal" ? <BarContainerHorizontal /> : <BarContainerVertical /> :
      rank === 0 ?
        <Tooltip title={rank === 0 && "Not rated; Falling back to avg. player rating"}>
          {displayMode === "horizontal" ?
            <BarContainerFadedHorizontal>
              {innerBar(value, maxValue, rank, idealValue)}
            </BarContainerFadedHorizontal> :
            <BarContainerFadedVertical>
              {innerBar(value, maxValue, rank, idealValue)}
            </BarContainerFadedVertical>
          }
        </Tooltip> :
        (displayMode === "horizontal" ?
          <BarContainerHorizontal>
            {innerBar(value, maxValue, rank, idealValue)}
          </BarContainerHorizontal> :
          <BarContainerVertical>
            {innerBar(value, maxValue, rank, idealValue)}
          </BarContainerVertical>
        )

  const timeBarMax = 240;
  const innerTimeBar = (min: number, max: number, idealValue: number | false) => {
    const minOpacity = 0.2 + ((Math.min(min, timeBarMax) / timeBarMax) * 0.8);
    const maxOpacity = 0.2 + ((Math.min(max, timeBarMax) / timeBarMax) * 0.8);
    const scale = 100 / timeBarMax;
    const hasIdealValue = !!idealValue;
    idealValue = idealValue || timeBarMax;

    return (
      <>
        <Bar style={{ opacity: minOpacity, width: Math.min(min, idealValue) * scale }} />
        <Bar style={{ opacity: minOpacity, width: Math.max(min - idealValue, 0) * scale, backgroundColor: "#f00" }} />
        <Bar style={{ opacity: maxOpacity, width: Math.max(Math.min(idealValue, max, timeBarMax) - min, 0) * scale }} />
        <Bar style={{ opacity: maxOpacity, width: Math.max(Math.min(max, timeBarMax) - Math.max(min, idealValue), 0) * scale, backgroundColor: "#f00" }} />
        <Bar style={{ opacity: maxOpacity, width: Math.max((hasIdealValue ? idealValue : 0) - Math.min(max, timeBarMax), 0) * scale, backgroundColor: "#aaa" }} />
        {max > timeBarMax && <BarPlus style={{ borderLeftColor: hasIdealValue && idealValue < max ? "#f00" : undefined }} />}
        <BarText>
          {min}
          {min !== max && (
            <> - {max}</>
          )}
        </BarText>
      </>);
  }

  const timeBar = (min: number, max: number) =>
  (displayMode === "horizontal" ?
    <BarContainerHorizontal>
      {innerTimeBar(min, max, includeIdealTime && idealTime)}
    </BarContainerHorizontal> :
    <BarContainerVertical>
      {innerTimeBar(min, max, includeIdealTime && idealTime)}
    </BarContainerVertical>
  )

  const gamesSortedByPlayerCount = (playerCount: number): CollectionGame[] => {
    return filteredGames.sort((a, b) => {
      const filteredA = a.playerCountStats.filter(g => g.playerCount === playerCount);
      const filteredB = b.playerCountStats.filter(g => g.playerCount === playerCount);

      const aValue = filteredA.length !== 1 ? 0 : filteredA[0].score;
      const bValue = filteredB.length !== 1 ? 0 : filteredB[0].score;

      return bValue - aValue;
    });
  };

  const getSortLabel = (sortOption: SortOptions) => {
    switch (sortOption) {
      case "game": return "Game";
      case "gr-index": return "GR Index";
      case "user-rating": return "User Rating";
      case "player-rating": return "Player Rating";
      case "geek-rating": return "Geek Rating";
      case "weight": return "Weight";
      case "time": return "Time";
    }
  }

  const gameUserRating = (username: string, game: CollectionGame, unratedLast: boolean): [number, boolean] => {
    const filteredPlayerRating = game.userStats.filter(r => r.username === username);

    const hasUserRating = filteredPlayerRating.length === 1;

    return [(hasUserRating && filteredPlayerRating[0].rating) || (fallBackTo === "geek-rating" ? game.geekRating : game.avgPlayerRating) - (unratedLast ? 10 : 0), hasUserRating];
  }

  const gamesSortedByUserRatings = (username: string): CollectionGame[] =>
    filteredGames.sort((a, b) => gameUserRating(username, b, true)[0] - gameUserRating(username, a, true)[0]);

  const getAvgUserRatings = (game: CollectionGame): number =>
    usernames.map(u => gameUserRating(u, game, false)[0]).reduce((a, b) => a + b) / usernames.length;

  const sortArrow = (thisSort: SortOptions) =>
    <ArrowDownward key={`arrow-${thisSort}`} style={{ 'color': sort === thisSort ? '#fff' : '#0475BB', 'paddingLeft': 2 }} />;

  const barHeader = (thisSort: SortOptions, label?: string) =>
    <BarHeader key={`header-${thisSort}`} onClick={() => setSort(thisSort)}>{(label || getSortLabel(thisSort))}{sortArrow(thisSort)}</BarHeader>;

  const playerCountBar = (count: number, game: CollectionGame) => {
    const filteredStats = game.playerCountStats.filter(s => s.playerCount === count);
    if (filteredStats.length === 1) {
      return bar(filteredStats[0].score, 10, filteredStats[0].rank);
    } else {
      return displayMode === "horizontal" ? <BarContainerHorizontal /> : <BarContainerVertical />;
    }
  }

  const userRatingBar = (username: string, game: CollectionGame) => {
    if (!username) {
      return bar(avgUserRatings[game.gameId].score, 10, avgUserRatings[game.gameId].rank);
    }

    const [rating, hasUserRating] = gameUserRating(username, game, false);
    const ratings = game.userStats.filter(r => r.username === username);

    return bar(rating, 10, hasUserRating ? ratings[0].rank ?? 0 : 0);
  }

  const usernameFilterKeyPress = (key: string) => {
    if (key === "Enter") {
      usernamesRef.current?.blur();
      lockInUsernames();
    }
  }

  const toggle = (value: boolean, setter: (value: React.SetStateAction<boolean>) => void, label: string, disabled?: boolean) =>
    <FormControlLabel
      style={{ userSelect: 'none', font: 'inherit' }}
      control={
        <Switch
          checked={value}
          disabled={disabled}
          onChange={() => setter(!value)} />
      }
      label={label} />

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const verticalCell = (label: string, component: React.ReactNode, id?: number) =>
    <VerticalCell key={`${slugify(label)}-${id ?? 0}`}>
      <VerticalLabel>{label}</VerticalLabel>
      {component}
    </VerticalCell>

  const isIos = () => {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
      // iPad on iOS 13 detection
      || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  }

  const handleUsernamesClear = () => {
    if (usernamesRef.current) {
      usernamesRef.current.value = "";
    }
    lockInUsernames();
  }

  const handleFallBackToChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setFallBackTo((event.target as HTMLInputElement).value as FallBackTo);

  const handleBaseRatingChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setBaseRating((event.target as HTMLInputElement).value as BaseRating);

  const handleSliderChange = (event: Event, callback: () => void) => {
    if (isIos() && event.type === 'mousedown') {
      return;
    }

    callback();
  }

  const filteredGames = allGames.filter(g => g.userStats.filter(us =>
    (
      (includeOwned && us.isOwned) ||
      (includeWishlisted && us.isWishlisted) ||
      (includeRated && us.rating)
    ) && (
      (includeBase && !g.isExpansion) ||
      (includeExpansion && g.isExpansion)
    )
  ).length > 0);

  const grIndexes = getScores(g => getGrIndex(g));
  const avgUserRatings = getScores(g => getAvgUserRatings(g));

  const sortedGames =
    (sort === 'name') ? filteredGames.sort((a, b) => a.name.localeCompare(b.name)) :
      (sort === 'geek-rating') ? filteredGames.sort((a, b) => b.geekRating - a.geekRating) :
        (sort === 'player-rating') ? filteredGames.sort((a, b) => b.avgPlayerRating - a.avgPlayerRating) :
          (sort === 'weight') ? filteredGames.sort((a, b) => b.avgWeight - a.avgWeight) :
            ((sort as string).startsWith('playercount')) ? gamesSortedByPlayerCount(parseInt(sort.split("-")[1])) :
              (sort === 'time') ? filteredGames.sort((a, b) => b.maxPlayTime - a.maxPlayTime) :
                (sort === 'gr-index') ? filteredGames.sort((a, b) => grIndexes[b.gameId].score - grIndexes[a.gameId].score) :
                  (sort === 'user-rating') ? filteredGames.sort((a, b) => getAvgUserRatings(b) - getAvgUserRatings(a)) :
                    usernames.map(u => `user-${u}`).filter(s => s === sort).length === 1 ? gamesSortedByUserRatings(sort.substring(5)) :
                      filteredGames;

  const getColumnWidth = (width: number, isShown: boolean) =>
    width * (isShown ? 1 : 0);

  const columnWidths =
    getColumnWidth(200, true) // name
    + getColumnWidth(200, showGrIndex) // GR index
    + getColumnWidth(200 * (showIndividualUserRatings ? usernames.length : 1), showPlayerRating) // user rating(s)
    + getColumnWidth(200, showPlayerRating) // player rating
    + getColumnWidth(200, showGeekRating) // geek rating
    + getColumnWidth(200 * (playerCountRange[1] - playerCountRange[0] + 1), showPlayerCount) // player count rating
    + getColumnWidth(200, showWeight) // weight
    + getColumnWidth(200, showTime) // time
    ;

  const displayMode: "horizontal" | "vertical" = columnWidths + 35 > screenWidth && preventHorizontalScroll ? "vertical" : "horizontal";
  const playerCountArray = Array.from({ length: playerCountRange[1] - playerCountRange[0] + 1 }, (v, k) => k + playerCountRange[0]);

  renderCount.current++;

  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <PageHeaderContainer style={{ width: screenWidth }}>
          <PageHeader>
            <FiltersContainer>
              <Input
                size='small'
                inputProps={{ autoCapitalize: "none" }}
                onKeyDown={e => usernameFilterKeyPress(e.key)}
                defaultValue={params.get("u") ?? ""}
                inputRef={usernamesRef}
                placeholder="BGG Username(s)"
                InputProps={{
                  style: { paddingRight: 0 },
                  endAdornment: (
                    <IconButton
                      disabled={!usernamesRef.current?.value}
                      onClick={() => handleUsernamesClear()}
                    >
                      <ClearIcon />
                    </IconButton>
                  )
                }}
              />
              <PlayerFilter>
                <FilterButton size='small' variant='contained' onClick={() => lockInUsernames()} disabled={loadingGames}>{loadingGames ? "Loading Games..." : "Load Games"}</FilterButton>
              </PlayerFilter>
            </FiltersContainer>
            <Logo src="/logo.png" alt="logo" />
          </PageHeader>
          <Filters>
            <FiltersContainer>
              <AdvancedOptionsButton onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
                {showAdvancedOptions ? <ExpandLess style={{ color: '#348CE9' }} /> : <ExpandMore style={{ color: '#348CE9' }} />}Advanced Options
              </AdvancedOptionsButton>
            </FiltersContainer>
            {showAdvancedOptions &&
              <>
                <FiltersHeader>
                  Columns
                </FiltersHeader>
                <FiltersInnerRow>
                  {toggle(showGrIndex, setShowGrIndex, "GR Index")}
                  {toggle(showUserRating, setShowUserRating, "User Rating")}
                  {toggle(showPlayerRating, setShowPlayerRating, "Average Rating")}
                  {toggle(showGeekRating, setShowGeekRating, "Geek Rating")}
                  {toggle(showPlayerCount, setShowPlayerCount, `Player Count Rating(s)`)}
                  {toggle(showWeight, setShowWeight, "Weight")}
                  {toggle(showTime, setShowTime, "Time")}
                  {toggle(showIndividualUserRatings, setShowIndividualUserRatings, "Individual Users Ratings", usernames.length < 2)}
                </FiltersInnerRow>
                <FiltersInnerRow>
                  <FormControl>
                    <InputLabel>Sort</InputLabel>
                    <Select
                      value={sort}
                      label="Sort"
                      onChange={event => setSort(event.target.value)}
                      size="small"
                    >
                      {sortOptions.map(sort => <MenuItem key={`sort-select-${sort}`} value={sort}>{getSortLabel(sort)}</MenuItem>)}
                    </Select>
                  </FormControl>
                </FiltersInnerRow>
                <FiltersInnerRow>
                  <SliderContainer>
                    <SliderLabel>Player Counts
                    </SliderLabel>
                    <SliderValue style={{ color: (showPlayerCount ? "" : "#000"), opacity: (showPlayerCount ? 1 : .38) }}>{playerCountRange[0]}</SliderValue>
                    <StyledSlider min={1} max={10} step={1} value={playerCountRange} onChange={(event, value) => handleSliderChange(event, () => setPlayerCountRange(value as number[]))} />
                    <SliderValue style={{ color: (showPlayerCount ? "" : "#000"), opacity: (showPlayerCount ? 1 : .38) }}>{playerCountRange[1]}</SliderValue>
                  </SliderContainer>
                </FiltersInnerRow>
                <FiltersHeader>
                  Filters
                </FiltersHeader>
                <FiltersInnerRow>
                  <FilterLabel>Status:</FilterLabel>
                  {toggle(includeOwned, setIncludeOwned, "Owned Games")}
                  {toggle(includeWishlisted, setIncludeWishlisted, "Wishlisted Games")}
                  {toggle(includeRated, setIncludeRated, "Rated Games")}
                </FiltersInnerRow>
                <FiltersInnerRow>
                  <FilterLabel>Type:</FilterLabel>
                  {toggle(includeBase, setIncludeBase, "Base Games")}
                  {toggle(includeExpansion, setIncludeExpansion, "Expansions")}
                </FiltersInnerRow>
                <FiltersHeader>
                  Scoring
                </FiltersHeader>
                <FiltersInnerRow>
                  <FallBackContainer>
                    Base Rating:
                    <RadioGroup value={baseRating} onChange={handleBaseRatingChange} row>
                      <FormControlLabel value="user-rating" control={<Radio />} label="User" />
                      <FormControlLabel value="player-rating" control={<Radio />} label="Average" />
                      <FormControlLabel value="geek-rating" control={<Radio />} label="Geek" />
                    </RadioGroup>
                  </FallBackContainer>
                </FiltersInnerRow>
                <FiltersInnerRow>
                  <FallBackContainer>
                    Fallback Rating:
                    <RadioGroup value={fallBackTo} onChange={handleFallBackToChange} row>
                      <FormControlLabel value="player-rating" control={<Radio />} label="Average" />
                      <FormControlLabel value="geek-rating" control={<Radio />} label="Geek" />
                    </RadioGroup>
                    <Tooltip title="When a user rating isn't set, use this instead."><FallBackInfo /></Tooltip>
                  </FallBackContainer>
                </FiltersInnerRow>
                <FiltersInnerRow>
                  <SliderContainer>
                    <SliderLabel>
                      {toggle(scorePlayerCount, setScorePlayerCount, "Player Count")}
                    </SliderLabel>
                    <SliderValue>{playerCount}</SliderValue>
                    <StyledSlider min={1} max={8} step={1} value={playerCount} onChange={(event, value) => handleSliderChange(event, () => setPlayerCount(Number(value)))} />
                  </SliderContainer>
                </FiltersInnerRow>
                <FiltersInnerRow>
                  <SliderContainer>
                    <SliderLabel>
                      {toggle(includeIdealWeight, setIncludeIdealWeight, "Ideal Weight")}
                    </SliderLabel>
                    <SliderValue style={{ color: (includeIdealWeight ? "" : "#000"), opacity: (includeIdealWeight ? 1 : .38) }}>{idealWeight}</SliderValue>
                    <StyledSlider disabled={!includeIdealWeight} min={1} max={5} step={0.5} value={idealWeight} onChange={(event, value) => handleSliderChange(event, () => setIdealWeight(Number(value)))} />
                  </SliderContainer>
                </FiltersInnerRow>
                <FiltersInnerRow>
                  <SliderContainer>
                    <SliderLabel>
                      {toggle(includeIdealTime, setIncludeIdealTime, "Ideal Time")}
                    </SliderLabel>
                    <SliderValue style={{ color: (includeIdealTime ? "" : "#000"), opacity: (includeIdealTime ? 1 : .38) }}>{idealTime}</SliderValue>
                    <StyledSlider disabled={!includeIdealTime} min={30} max={240} step={30} value={idealTime} onChange={(event, value) => handleSliderChange(event, () => setIdealTime(Number(value)))} />
                  </SliderContainer>
                </FiltersInnerRow>
                <FiltersHeader>
                  UI Options
                </FiltersHeader>
                <FiltersInnerRow>
                  {toggle(preventHorizontalScroll, setPreventHorizontalScroll, "Prevent Horizontal Scrolling")}
                </FiltersInnerRow>
                {location.href.startsWith("http://localhost") || (usernames.length === 1 && usernames[0] === "jader201") &&
                  <>
                    <FiltersHeader>
                      Diagnostics
                    </FiltersHeader>
                    <FiltersInnerRow>
                      renderCount: {renderCount.current}
                    </FiltersInnerRow>
                  </>
                }
              </>
            }
          </Filters>
        </PageHeaderContainer>
        {displayMode === "horizontal" &&
          <GamesHeader>
            <HeaderRow style={{ minWidth: screenWidth }}>
              {sortedGames.length > 0 &&
                <>
                  <ImageAndNameHeader onClick={() => setSort("game")}>
                    Game{sortArrow("game")}
                  </ImageAndNameHeader>
                  {showGrIndex && barHeader("gr-index")}
                  {showUserRating && (showIndividualUserRatings || usernames.length < 2 ? usernames.map(u => barHeader(`user-${u}`, u.toUpperCase())) : barHeader(`user-rating`))}
                  {showPlayerRating && barHeader("player-rating")}
                  {showGeekRating && barHeader("geek-rating")}
                  {showPlayerCount && playerCountArray.map(pc => barHeader(`playercount-${pc}`, `${pc}-Player`))}
                  {showWeight && barHeader("weight")}
                  {showTime && barHeader("time")}
                </>
              }
            </HeaderRow>
          </GamesHeader>
        }
        {sortedGames.length === 0 &&
          <EmptyState style={{ width: screenWidth }}>
            <Intro>
              <IntroHeader>Geek Ranker can be used to:</IntroHeader>
              <IntroList>
                <IntroListItem>
                  View your BGG collection alongside data like Player Count Ratings, Geek Ratings, and many more.
                  {showTips && <IntroTip>Just type your BGG username above and click "Load Games".</IntroTip>}
                </IntroListItem>
                <IntroListItem>
                  View your collection with other BGG users' collections -- see how your games stack against others that share your interests.
                  {showTips && <IntroTip>Enter yours and others' BGG usernames (separated by space) and click "Load Games".</IntroTip>}
                </IntroListItem>
                <IntroListItem>
                  Rank your games using the Geek Ranker Index (GR Index) that combines many stats into one score.
                  {showTips && <IntroTip>After loading your games, click "Advanced Options" to toggle columns, and play around with different filters and scoring options.</IntroTip>}
                </IntroListItem>
                <IntroListItem>
                  Use the GR Index with your wishlist to figure out which games are best in different scenarios (e.g. 2 player, mid-light weight, 30 minutes), to help narrow down the next game to add to your collection.
                  {showTips && <IntroTip>Under "Advanced Options", toggle "Wishlisted Games" and try different scenarios to find the best fit for the games you have your eye on.</IntroTip>}
                </IntroListItem>
                <IntroListItem>
                  Share your list with others on BGG or social media.
                  {showTips && <IntroTip>Just copy the URL -- it is updated as you make changes, so they'll see what you see just by visiting the URL you share.</IntroTip>}
                </IntroListItem>
                <IntroListItem>
                  <IntroTipLink onClick={() => setShowTips(!showTips)}>Click here to toggle tips!</IntroTipLink>
                </IntroListItem>
              </IntroList>
            </Intro>
          </EmptyState>
        }
        {sortedGames.map(g => {
          return (
            displayMode === "horizontal" ?
              <GameHorizontally key={`game-horizontal-${g.gameId}`} style={{ minWidth: screenWidth }}>
                <ImageAndNameHorizontal href={`https://www.boardgamegeek.com/boardgame/${g.gameId}`} target="_balnk">
                  <ThumbnailContainer>
                    <Thumbnail src={g.imageUrl} />
                  </ThumbnailContainer>
                  <GameName>{g.name}</GameName>
                </ImageAndNameHorizontal>

                {showGrIndex && <HorizontalCell>{bar(grIndexes[g.gameId].score ?? 0, 10, grIndexes[g.gameId].rank ?? 0)}</HorizontalCell>}
                {showUserRating && (showIndividualUserRatings || usernames.length < 2 ?
                  usernames.map(u => <HorizontalCell key={`userRating-${g.gameId}-${u}`}>{userRatingBar(u, g)}</HorizontalCell>) :
                  <HorizontalCell>{userRatingBar("", g)}</HorizontalCell>
                )}
                {showPlayerRating && <HorizontalCell>{bar(g.avgPlayerRating, 10, g.avgPlayerRatingRank)}</HorizontalCell>}
                {showGeekRating && <HorizontalCell>{bar(g.geekRating, 10, g.geekRatingRank)}</HorizontalCell>}
                {showPlayerCount && playerCountArray.map(pc => <HorizontalCell key={`h-pc-${pc}`}>{playerCountBar(pc, g)}</HorizontalCell>)}
                {showWeight && <HorizontalCell>{bar(g.avgWeight, 5, g.avgWeightRank, includeIdealWeight && idealWeight)}</HorizontalCell>}
                {showTime && <HorizontalCell>{timeBar(g.minPlayTime, g.maxPlayTime)}</HorizontalCell>}
              </GameHorizontally> :
              <GameVertically key={`game-vertical-${g.gameId}`} style={{ width: screenWidth }}>
                <ImageAndNameVertical href={`https://www.boardgamegeek.com/boardgame/${g.gameId}`} target="_balnk">
                  <ThumbnailContainer>
                    <Thumbnail src={g.imageUrl} />
                  </ThumbnailContainer>
                  <GameName>{g.name}</GameName>
                </ImageAndNameVertical>

                {showGrIndex && verticalCell("GR Index", bar(grIndexes[g.gameId].score ?? 0, 10, grIndexes[g.gameId].rank ?? 0))}
                {showUserRating && (showIndividualUserRatings || usernames.length < 2 ?
                  usernames.map(u => verticalCell(u, userRatingBar(u, g), g.gameId)) :
                  verticalCell("User Rating", userRatingBar("", g))
                )}
                {showPlayerRating && verticalCell("Average Rating", bar(g.avgPlayerRating, 10, g.avgPlayerRatingRank))}
                {showGeekRating && verticalCell("Geek Rating", bar(g.geekRating, 10, g.geekRatingRank))}
                {showPlayerCount && playerCountArray.map(pc => verticalCell(`${pc}-Player Rating`, playerCountBar(pc, g), pc))}
                {showWeight && verticalCell("Weight", bar(g.avgWeight, 5, g.avgWeightRank, includeIdealWeight && idealWeight))}
                {showTime && verticalCell("Play Time", timeBar(g.minPlayTime, g.maxPlayTime))}
              </GameVertically>
          );
        })}
      </ThemeProvider>
    </>
  );
}

export default App;
