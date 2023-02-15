import React, { useEffect, useState, useRef, useMemo } from 'react';
import styled, { createGlobalStyle } from "styled-components"

import "typeface-open-sans";

import { Cached, Clear, Close, Download, Info, Link, Settings as SettingsIcon } from '@mui/icons-material';
import { TextField, Button, IconButton, Tabs, Tab, FormControl, Select, MenuItem, Drawer, Slider, InputLabel, FormControlLabel, Switch, RadioGroup, Radio, Tooltip, Snackbar } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material';

import { Game, PlayerCountStats, UserStats } from './models';
import { getStringQueryParam, getQueryParam, QueryParams, SelectedTab, getBoolQueryParam, getNumberArrayQueryParam, getTypedStringQueryParam, getNumberQueryParam, defaultQueryValues, sortOptions, getSortLabel, DisplayMode, FallBackTo, BaseRating, SortOptions, getUsernamesFromString, getGameIdsFromString, getIdFromString, updateRanks, getGameUserRating, getBggGameUrl, getGamePlayerCountStats, getIsMobileView } from './Utilities';
import GameRanker from './GameRanker';
import { getRankings } from './GrApi';

const theme = createTheme({
  typography: {
    fontFamily: 'Open Sans',
    fontWeightRegular: 600,
  },
  components: {
    MuiRadio: {
      styleOverrides: {
        root: {
          paddingLeft: 9,
          paddingRight: 9,
          paddingTop: 5,
          paddingBottom: 5,
        }
      }
    }
  }
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
    margin-bottom: 40px;
    overflow-y: scroll;
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

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  flex-grow: 1;
  max-width: 700px;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled(TextField)`
  box-sizing: border-box;
  width: 100%;
  // background-color: #fff;
`;

const SpinButtonCover = styled.div`
  height: 20px;
  width: 20px;
  background-color: #eee;
  position: absolute;
  z-index: 10;
  right: 40px;
`;

const ClearIcon = styled(Clear)`
  padding-right: -120px;
`;

const BggLink = styled.a`
  position: absolute;
  color: #348CE9;
  text-decoration: none;
  cursor: pointer;
  right: 45px;
  max-width: calc(100% - 150px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 20;
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 10px 0;
  padding-right: 8px;  
`;

const ButtonsList = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`

const Logo = styled.img`
  max-width: 100%;
  width: 400px;
  object-fit: contain;
  padding: 5px 0;
`;

const Settings = styled.div`
  max-width: 270px;
  display: flex;
  flex-direction: column;
  user-select: none;
`;

const SettingsHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: #348CE9;
`;

const SettingsHeader = styled.div`
  font-weight: bold;
  background-color: #348CE9;
  color: #fff;
  padding: 10px 15px;
`;

const SettingsContent = styled.div`
  margin: 15px;
  display: flex;
  flex-direction: column;
  font-weight: 400;
`;

const SettingsRow = styled.div`
  display: flex;
`;

const FilterLabel = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  font-weight: bold;
  padding-bottom: 5px;
  :not(:first-child) {
    padding-top: 15px;
  } 
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 30px;
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

const FallBackInfo = styled(Info)`
 size: 14px;
 color: #348CE9;
`;

type GameIdFilter = "all" | "only-selected" | "hide-selected";

function App() {
  const [usernamesInput, setUsernamesInput] = useState<string>(getQueryParam(QueryParams.Usernames) || "");
  const [gameIdsInput, setGameIdsInput] = useState<string>(getQueryParam(QueryParams.GameIds) || "");
  const [threadIdInput, setThreadIdInput] = useState<string>(getQueryParam(QueryParams.ThreadId) || "");
  const [geekListIdInput, setGeekListIdInput] = useState<string>(getQueryParam(QueryParams.GeekListId) || "");

  const usernamesRef = useRef<HTMLInputElement>(null);
  const gameIdsRef = useRef<HTMLInputElement>(null);
  const threadIdRef = useRef<HTMLInputElement>(null);
  const geekListIdRef = useRef<HTMLInputElement>(null);

  const renderCount = useRef<number>(0);

  // User option nullable defaults
  const idealTimeDefault = 60;
  const idealWeightDefault = 3;

  const [tab, setTab] = useState<SelectedTab>(getStringQueryParam(QueryParams.SelectedTab) as SelectedTab);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [loadingGames, setLoadingGames] = useState<boolean>(false);
  const [allGames, setAllGames] = useState<Game[]>([]);

  // Standard options
  const [usernames, setUsernames] = useState<string[]>(getUsernamesFromString(getQueryParam(QueryParams.Usernames)));
  const [gameIds, setGameIds] = useState<number[]>(getGameIdsFromString(getQueryParam(QueryParams.GameIds)));
  const [threadId, setThreadId] = useState<number | undefined>(getIdFromString(getQueryParam(QueryParams.ThreadId)));
  const [geekListId, setGeekListId] = useState<number | undefined>(getIdFromString(getQueryParam(QueryParams.GeekListId)));

  const [threadTitle, setThreadTitle] = useState<string>("");
  const [geekListTitle, setGeekListTitle] = useState<string>("");

  const [showDrawer, setShowDrawer] = useState<boolean>(false);

  // Standard options
  const [sort, setSort] = useState<string>(getStringQueryParam(QueryParams.Sort));

  // Column visibility
  const [showGameId, setShowGameId] = useState<boolean>(getBoolQueryParam(QueryParams.ShowGameId));
  const [showThreadSequence, setShowThreadSequence] = useState<boolean>(getBoolQueryParam(QueryParams.ShowThreadSequence));
  const [showGeekListSequence, setShowGeekListSequence] = useState<boolean>(getBoolQueryParam(QueryParams.ShowGeekListSequence));
  const [showGrIndex, setShowGrIndex] = useState<boolean>(getBoolQueryParam(QueryParams.ShowGrIndex));
  const [showGeekRating, setShowGeekRating] = useState<boolean>(getBoolQueryParam(QueryParams.ShowGeekRating));
  const [showPlayerRating, setShowPlayerRating] = useState<boolean>(getBoolQueryParam(QueryParams.ShowPlayerRating));
  const [showUserRating, setShowUserRating] = useState<boolean>(getBoolQueryParam(QueryParams.ShowUserRating));
  const [showTime, setShowTime] = useState<boolean>(getBoolQueryParam(QueryParams.ShowTime));
  const [showWeight, setShowWeight] = useState<boolean>(getBoolQueryParam(QueryParams.ShowWeight));
  const [showPlayerCount, setShowPlayerCount] = useState<boolean>(getBoolQueryParam(QueryParams.ShowPlayerCount));
  const [showIndividualUserRatings, setShowIndividualUserRatings] = useState<boolean>(getBoolQueryParam(QueryParams.ShowIndividualUserRatings));
  const [playerCountRange, setPlayerCountRange] = useState<number[]>(getNumberArrayQueryParam(QueryParams.PlayerCountRange));

  // Filter options
  const [includeOwned, setIncludeOwned] = useState<boolean>(getBoolQueryParam(QueryParams.IncludeOwned));
  const [includeWishlisted, setIncludeWishlisted] = useState<boolean>(getBoolQueryParam(QueryParams.IncludeWishlisted));
  const [includeRated, setIncludeRated] = useState<boolean>(getBoolQueryParam(QueryParams.IncludeRated));
  const [includeBase, setIncludeBase] = useState<boolean>(getBoolQueryParam(QueryParams.IncludeBase));
  const [includeExpansion, setIncludeExpansion] = useState<boolean>(getBoolQueryParam(QueryParams.IncludeExpansion));
  const [gameIdFilter, setGameIdFilter] = useState<GameIdFilter>(getTypedStringQueryParam<GameIdFilter>(QueryParams.GameIdFilter));

  // Scoring options
  const [scorePlayerCount, setScorePlayerCount] = useState<boolean>(getBoolQueryParam(QueryParams.ScorePlayerCount));
  const [scoreIdealWeight, setScoreIdealWeight] = useState<boolean>(getBoolQueryParam(QueryParams.IdealWieght));
  const [idealWeight, setIdealWeight] = useState<number>(getNumberQueryParam(QueryParams.IdealWieght) || idealWeightDefault);
  const [scoreIdealTime, setScoreIdealTime] = useState<boolean>(getBoolQueryParam(QueryParams.IdealTime));
  const [idealTime, setIdealTime] = useState<number>(getNumberQueryParam(QueryParams.IdealTime) || idealTimeDefault);
  const [baseRating, setBaseRating] = useState<BaseRating>(getTypedStringQueryParam<BaseRating>(QueryParams.BaseRating));
  const [fallBackTo, setFallBackTo] = useState<FallBackTo>(getTypedStringQueryParam<FallBackTo>(QueryParams.FallBackTo));


  // UI options
  const [singleColumnView, setSingleColumnView] = useState<boolean>(localStorage.getItem("singleColumnView") === "true");
  const [gamesPerPage, setGamesPerPage] = useState<number>(parseInt(localStorage.getItem("gamesPerPage") || "100"));
  const [page, setPage] = useState<number>(1);

  // Snackbar states
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const queryValues: { [key in QueryParams]: SelectedTab | string | number | string[] | boolean | undefined } = {
    [QueryParams.SelectedTab]: tab,
    [QueryParams.Usernames]: usernames.length ? usernames.join(' ') : undefined,
    [QueryParams.GameIds]: gameIds.length ? gameIds.join(' ') : undefined,
    [QueryParams.ThreadId]: threadId,
    [QueryParams.GeekListId]: geekListId,
    [QueryParams.Sort]: sort,
    [QueryParams.ShowGameId]: showGameId,
    [QueryParams.ShowThreadSequence]: showThreadSequence,
    [QueryParams.ShowGeekListSequence]: showGeekListSequence,
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
    [QueryParams.GameIdFilter]: gameIdFilter,
    [QueryParams.ScorePlayerCount]: scorePlayerCount,
    [QueryParams.PlayerCountRange]: `${playerCountRange[0]} ${playerCountRange[1]}`,
    [QueryParams.IdealWieght]: scoreIdealWeight ? idealWeight : undefined,
    [QueryParams.IdealTime]: scoreIdealTime ? idealTime : undefined,
    [QueryParams.BaseRating]: baseRating,
    [QueryParams.FallBackTo]: fallBackTo,
  }

  const getShowGameId = () => (tab === 'advanced' && showGameId);
  const getShowThreadSequence = () => ((tab === 'advanced' && showThreadSequence) || tab === 'thread');
  const getShowGeekListSequence = () => ((tab === 'advanced' && showGeekListSequence) || tab === 'geeklist');
  const getShowGrIndex = () => (tab !== 'advanced' || showGrIndex);
  const getShowUserRating = () => ((tab === 'advanced' && showUserRating) || tab === 'user');
  const getShowPlayerRating = () => ((tab === 'advanced' && showPlayerRating) || tab !== 'user');
  const getShowGeekRating = () => (tab === 'advanced' && showGeekRating);

  const getShouldIncludeQueryParam = (queryParam: QueryParams): boolean => {
    if (tab === 'advanced') return true;

    switch (queryParam) {
      case QueryParams.SelectedTab: return true;
      case QueryParams.Usernames: return tab === 'user';
      case QueryParams.GameIds: return tab === 'game';
      case QueryParams.ThreadId: return tab === 'thread';
      case QueryParams.GeekListId: return tab === 'geeklist';
      case QueryParams.Sort: return true;
      case QueryParams.ShowGameId: return false;
      case QueryParams.ShowThreadSequence: return false;
      case QueryParams.ShowGeekListSequence: return false;
      case QueryParams.ShowGrIndex: return false;
      case QueryParams.ShowUserRating: return false;
      case QueryParams.ShowPlayerRating: return false;
      case QueryParams.ShowGeekRating: return false;
      case QueryParams.ShowPlayerCount: return true;
      case QueryParams.ShowWeight: return true;
      case QueryParams.ShowTime: return true;
      case QueryParams.ShowIndividualUserRatings: return false;
      case QueryParams.IncludeOwned: return tab === 'user';
      case QueryParams.IncludeWishlisted: return tab === 'user';
      case QueryParams.IncludeRated: return tab === 'user';
      case QueryParams.IncludeBase: return tab === 'user';
      case QueryParams.IncludeExpansion: return tab === 'user';
      case QueryParams.GameIdFilter: return tab === 'game';
      case QueryParams.ScorePlayerCount: return true;
      case QueryParams.PlayerCountRange: return true;
      case QueryParams.IdealWieght: return true;
      case QueryParams.IdealTime: return true;
      case QueryParams.BaseRating: return false;
      case QueryParams.FallBackTo: return false;
    }
  }

  useEffect(() => {
    const params = new URLSearchParams();

    Object.values(QueryParams).forEach(queryParam => {
      if (JSON.stringify(queryValues[queryParam]) === JSON.stringify(defaultQueryValues[queryParam]) || queryValues[queryParam] === undefined || !getShouldIncludeQueryParam(queryParam)) {
        params.delete(queryParam);
      } else {
        if (typeof queryValues[queryParam] === "boolean") {
          params.set(queryParam, queryValues[queryParam] ? "1" : "0");
        } else {
          params.set(queryParam, queryValues[queryParam] as string);
        }
      }
    });

    let url = location.pathname;

    if (params.toString()) {
      url += `?${params}`;
    }

    window.history.replaceState({}, '', url);
  });

  const getFilteredGames = (games: Game[] = allGames) => games.filter(g =>
    (
      (
        (
          (tab === 'advanced' || tab === 'user') &&
          (
            g.userStats.filter(us => (includeOwned && us.isOwned) || (includeWishlisted && us.isWishlisted) || (includeRated && us.rating)).length &&
            ((includeBase && !g.isExpansion) || (includeExpansion && g.isExpansion))
          )
        ) ||
        ((tab === 'advanced' || tab === 'thread') && g.threadSequence) ||
        ((tab === 'advanced' || tab === 'geeklist') && g.geekListSequence) ||
        (tab === 'advanced' && gameIds.indexOf(g.gameId) > -1 && gameIdFilter !== "hide-selected")
      ) &&
      (
        (gameIdFilter === "all") ||
        (tab === 'user') ||
        (tab === 'thread') ||
        (gameIdFilter === "hide-selected" && gameIds.indexOf(g.gameId) === -1) ||
        (gameIdFilter === "only-selected" && gameIds.indexOf(g.gameId) > -1)
      )
    ) || (tab === 'game' && gameIds.indexOf(g.gameId) > -1)
  );

  const updateAllRanks = (games: Game[] = allGames) => {
    const filteredGames = getFilteredGames(games);

    usernames.map(u => {
      const userStatsList = filteredGames
        .map(g => g.userStats.find(s => s.username === u))
        .filter(s => s)
        .map(s => s as UserStats);

      updateRanks(userStatsList, (s) => s.rating, (s) => s.gameId, (s, r) => s.rank = r);
    })

    updateRanks(filteredGames, (g) => g.avgPlayerRating, (g) => g.gameId, (g, r) => g.avgPlayerRatingRank = r as number);
    updateRanks(filteredGames, (g) => g.avgWeight, (g) => g.gameId, (g, r) => g.avgWeightRank = r as number);
    updateRanks(filteredGames, (g) => g.geekRating, (g) => g.gameId, (g, r) => g.geekRatingRank = r as number);
    updateRanks(filteredGames, (g) => g.avgUserRating, (g) => g.gameId, (g, r) => g.avgUserRatingRank = r as number);

    updateRanks(filteredGames, (g) => g.grIndex, (g) => g.gameId, (g, r) => g.grIndexRank = r as number);

    const playerCounts = [...new Set(filteredGames.flatMap(g => g.playerCountStats.map(s => s.playerCount)))]
      .sort((a, b) => a - b);

    playerCounts.map(c => {
      const playerCountGames = filteredGames
        .filter(g => g.playerCountStats.find(s => s.playerCount === c));

      updateRanks(
        playerCountGames,
        (g) => g.playerCountStats.find(s => s.playerCount === c)?.score || 0,
        (g) => g.gameId,
        (g, r) => (g.playerCountStats.find(s => s.playerCount === c) as PlayerCountStats).rank = r as number
      );
    });
  };

  const getGrIndex = (game: Game): number => {
    let numerator = 1;
    let denominator = 1;

    if (baseRating === 'user-rating' && usernames.length) {
      console.log("scoring user-rating");
      const userRatings = usernames.map(username => getGameUserRating(username, game, fallBackTo, false)[0]);
      const avgUserRating = (userRatings.reduce((a, b) => a + b) / userRatings.length);

      numerator *= avgUserRating;
    } else if (baseRating !== 'geek-rating' && (baseRating !== 'user-rating' || fallBackTo === 'player-rating')) {
      console.log("scoring player-rating");
      numerator *= game.avgPlayerRating;
    } else {
      console.log("scoring geek-rating");
      numerator *= game.geekRating;
    }

    denominator *= 10;

    if (scorePlayerCount) {
      const playerCountStats = game.playerCountStats.filter(s => s.playerCount >= playerCountRange[0] && s.playerCount <= playerCountRange[1]);

      if (!playerCountStats.length) {
        return 0;
      }

      numerator *= playerCountStats.map(s => s.score).reduce((a, b) => a + b) / (playerCountRange[1] - playerCountRange[0] + 1);
      denominator *= 10;
    }

    if (scoreIdealWeight) {
      numerator *= 5 - Math.abs(game.avgWeight - idealWeight);
      denominator *= 5;
    }

    if (scoreIdealTime) {
      numerator *= Math.max(150 - Math.abs(game.maxPlayTime - idealTime), 0);
      denominator *= 150;
    }

    return 10 * numerator / denominator;
  }

  const getGamesSortedByPlayerCount = (playerCount: number): Game[] => {
    return getFilteredGames().sort((a, b) => {
      const filteredA = a.playerCountStats.filter(g => g.playerCount === playerCount);
      const filteredB = b.playerCountStats.filter(g => g.playerCount === playerCount);

      const aValue = filteredA.length !== 1 ? 0 : filteredA[0].score;
      const bValue = filteredB.length !== 1 ? 0 : filteredB[0].score;

      return bValue - aValue;
    });
  };

  const getGamesSortedByUserRatings = (username: string): Game[] =>
    getFilteredGames().sort((a, b) => getGameUserRating(username, b, fallBackTo, true)[0] - getGameUserRating(username, a, fallBackTo, true)[0]);

  const getAvgUserRatings = (game: Game): number =>
    (usernames.length && (usernames.map(u => getGameUserRating(u, game, fallBackTo, false)[0]).reduce((a, b) => a + b) / usernames.length)) ?? 0;

  const getSortedGames = () =>
    (sort === 'game') ? getFilteredGames().sort((a, b) => a.name.localeCompare(b.name)) :
      (sort === 'id') ? getFilteredGames().sort((a, b) => a.gameId - b.gameId) :
        (sort === 'thread') ? getFilteredGames().sort((a, b) => (a.threadSequence || Number.MAX_VALUE) - (b.threadSequence || Number.MAX_VALUE)) :
          (sort === 'geek-list') ? getFilteredGames().sort((a, b) => (a.geekListSequence || Number.MAX_VALUE) - (b.geekListSequence || Number.MAX_VALUE)) :
            (sort === 'geek-rating') ? getFilteredGames().sort((a, b) => b.geekRating - a.geekRating) :
              (sort === 'player-rating') ? getFilteredGames().sort((a, b) => b.avgPlayerRating - a.avgPlayerRating) :
                (sort === 'weight') ? getFilteredGames().sort((a, b) => b.avgWeight - a.avgWeight) :
                  ((sort as string).startsWith('playercount-')) ? getGamesSortedByPlayerCount(parseInt(sort.split("-")[1])) :
                    (sort === 'time') ? getFilteredGames().sort((a, b) => b.maxPlayTime - a.maxPlayTime) :
                      (sort === 'gr-index') ? getFilteredGames().sort((a, b) => b.grIndex - a.grIndex) :
                        (sort === 'user-rating') ? getFilteredGames().sort((a, b) => getAvgUserRatings(b) - getAvgUserRatings(a)) :
                          (sort as string).startsWith('user-') ? getGamesSortedByUserRatings(sort.split("-")[1]) :
                            getFilteredGames();

  const handleGameIdFilterChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setGameIdFilter((event.target as HTMLInputElement).value as GameIdFilter);

  const handleFallBackToChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setFallBackTo((event.target as HTMLInputElement).value as FallBackTo);

  const handleBaseRatingChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setBaseRating((event.target as HTMLInputElement).value as BaseRating);

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

  const updateMedia = () => {
    setScreenWidth(document.documentElement.clientWidth || document.body.clientWidth);
  };

  const handleSliderChange = (event: Event, callback: () => void) => {
    if (isIos() && event.type === 'mousedown') {
      return;
    }

    callback();
  }

  const getColumnWidth = (width: number, isShown: boolean) =>
    width * (isShown ? 1 : 0);

  const columnWidths =
    getColumnWidth(200, true) // name
    + getColumnWidth(200, showGameId)
    + getColumnWidth(200, showThreadSequence)
    + getColumnWidth(200, showGeekListSequence)
    + getColumnWidth(200, showGrIndex)
    + getColumnWidth(200 * (showIndividualUserRatings ? usernames.length : 1), showUserRating) // user rating(s)
    + getColumnWidth(200, showPlayerRating)
    + getColumnWidth(200, showGeekRating)
    + getColumnWidth(200 * (playerCountRange[1] - playerCountRange[0] + 1), showPlayerCount) // player count rating
    + getColumnWidth(200, showWeight)
    + getColumnWidth(200, showTime)
    ;

  const displayMode: DisplayMode = columnWidths + 35 > screenWidth && singleColumnView && getIsMobileView(screenWidth) ? "vertical" : "horizontal";

  const getApiData = async () => {
    if (!usernames.length && !gameIds.length && !threadId && !geekListId) {
      setAllGames([]);
      setGeekListTitle("");
      setThreadTitle("");
      return;
    }

    setLoadingGames(true);

    try {
      const rankings = await getRankings(usernames, gameIds, threadId, geekListId);

      updateAllCalculatedScores(rankings.games);
      updateAllRanks(rankings.games);
      setAllGames(rankings.games);
      setGeekListTitle(rankings.geekListTitle);
      setThreadTitle(rankings.threadTitle);
    } catch (ex) {
      console.log(ex);
    } finally {
      setLoadingGames(false);
    }
  };

  const updateAllCalculatedScores = (games: Game[] = allGames) => {
    games.map(g => {
      g.grIndex = getGrIndex(g);
      g.avgUserRating = getAvgUserRatings(g);
    });
  }

  const getPlayerCountArray = () => Array.from({ length: playerCountRange[1] - playerCountRange[0] + 1 }, (v, k) => k + playerCountRange[0]);

  const getCsvFromGames = (): string => {
    const rows: (string | null)[][] = [];

    const userRatingsHeader =
      showIndividualUserRatings || usernames.length < 2 ?
        [...usernames.map(u => u.toUpperCase())] : [getSortLabel("user-rating")]

    rows.push([
      getSortLabel("game"),
      "BGG Link",
      (getShowGameId() && getSortLabel("id")) || null,
      (getShowThreadSequence() && getSortLabel("thread")) || null,
      (getShowGeekListSequence() && getSortLabel("geek-list")) || null,
      (getShowGrIndex() && getSortLabel("gr-index")) || null,
      ...((getShowUserRating() && userRatingsHeader) || [null]),
      (getShowPlayerRating() && getSortLabel("player-rating")) || null,
      (getShowGeekRating() && getSortLabel("geek-rating")) || null,
      ...(showPlayerCount && getPlayerCountArray().map(pc => `${pc}-Player`) || [null]),
      (showWeight && getSortLabel("weight")) || null,
      (showTime && "Min Playtime") || null,
      (showTime && "Min Playtime") || null,
    ].filter(v => v));

    getFilteredGames().map(g => rows.push([
      `"${g.name.toString()}"`,
      getBggGameUrl(g.gameId),
      (getShowGameId() && g.gameId.toString()) || null,
      (getShowThreadSequence() && g.threadSequence.toString()) || null,
      (getShowGeekListSequence() && g.geekListSequence.toString()) || null,
      (getShowGrIndex() && g.grIndex.toString()) || null,
      ...(getShowUserRating() &&
        (showIndividualUserRatings || usernames.length < 2 ?
          usernames.map(u => getGameUserRating(u, g, fallBackTo, true)[0].toString()) :
          g.avgUserRating.toString()) || [null]),
      (getShowPlayerRating() && g.avgPlayerRating.toString()) || null,
      (getShowGeekRating() && g.geekRating.toString()) || null,
      ...((showPlayerCount &&
        getPlayerCountArray().map(pc => getGamePlayerCountStats(pc, g)?.score.toString() || " "))
        || [null]),
      (showWeight && g.avgWeight.toString()) || null,
      (showTime && g.minPlayTime.toString()) || null,
      (showTime && g.maxPlayTime.toString()) || null,
    ].filter(v => v)));

    const csv = rows.map(r => r.join(',')).join('\n');

    return csv;
  }

  const downloadCsv = () => {
    const blob = new Blob([getCsvFromGames()], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `GeekRankerGames.csv`
    document.body.appendChild(link);
    link.click();
  }

  const copyUrlToClipboard = () => {
    setSnackbarMessage("Link to your Geek Ranker view copied to clipboard");
    setOpenSnackbar(true);
    navigator.clipboard.writeText(window.location.toString());
  }

  const copyThingLinkListToClipboard = () => {
    setSnackbarMessage("BGG Thing links copied to clipboard");
    setOpenSnackbar(true);
    const bggThingLinks = getFilteredGames().map(g => `[thing=${g.gameId}]${g.name}[/thing]`).join('\n');
    navigator.clipboard.writeText(bggThingLinks);
  }

  const clearCache = () => {
    setSnackbarMessage(`${localStorage.length - 2} items have been removed from cache`);
    setOpenSnackbar(true);
    localStorage.clear();

    localStorage.setItem("singleColumnView", singleColumnView.toString());
    localStorage.setItem("gamesPerPage", gamesPerPage.toString());
  }

  useMemo(() => {
    updateAllCalculatedScores();
    updateAllRanks();
  }, [scorePlayerCount, scoreIdealWeight, scoreIdealTime, idealWeight, idealTime, playerCountRange, baseRating, fallBackTo])

  useMemo(() => {
    updateAllRanks();
  }, [tab, includeOwned, includeWishlisted, includeRated, includeBase, includeExpansion, gameIdFilter])

  useEffect(() => {
    setGameIdsInput(usernames.join(' '));
  }, [usernames]);

  useEffect(() => {
    setGameIdsInput(gameIds.join(' '));
  }, [gameIds]);

  useEffect(() => {
    setThreadIdInput(threadId?.toString() || "");
  }, [threadId]);

  useEffect(() => {
    setGeekListIdInput(geekListId?.toString() || "");
  }, [geekListId]);

  useEffect(() => {
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });

  useEffect(() => {
    getApiData();
  }, [usernames, gameIds, threadId, geekListId]);

  useEffect(() => {
    const maxPage = Math.trunc(getFilteredGames().length / gamesPerPage) + 1;
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [gamesPerPage]);

  useEffect(() => {
    localStorage.setItem("singleColumnView", singleColumnView.toString());
  }, [singleColumnView])

  useEffect(() => {
    localStorage.setItem("gamesPerPage", gamesPerPage.toString());
  }, [gamesPerPage])

  useEffect(() => {
    if (!usernamesInput && usernames.length) setUsernames([]);
    if (!gameIdsInput && gameIds.length) setGameIds([]);
    if (!threadIdInput && threadId) setThreadId(undefined);
    if (!geekListIdInput && geekListId) setGeekListId(undefined);
  }, [usernamesInput, gameIdsInput, threadIdInput, geekListIdInput])

  const setTextFieldStateValues = () => {
    setUsernames(getUsernamesFromString(usernamesInput));
    setGameIds(getGameIdsFromString(gameIdsInput))
    setThreadId(getIdFromString(threadIdInput));
    setGeekListId(getIdFromString(geekListIdInput));
  };

  const inputKeyPress = (e: React.KeyboardEvent, ref: React.RefObject<HTMLInputElement>) => {
    if (e.key === "Enter") {
      ref.current?.blur();
      setTextFieldStateValues();
    }
  }

  const filterPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('Text');

    const threadRegexp = /https:\/\/boardgamegeek.com\/thread\/([0-9]*)\//;
    const geeklistRegexp = /https:\/\/boardgamegeek.com\/geeklist\/([0-9]*)\//;

    if (text.match(threadRegexp) != null) {
      setThreadId(parseInt(text.match(threadRegexp)![1]));
      e.preventDefault();
    }

    if (text.match(geeklistRegexp)) {
      setGeekListId(parseInt(text.match(geeklistRegexp)![1]));
      e.preventDefault();
    }
  }

  const input = (
    inputTab: SelectedTab,
    placeholder: string,
    value: string | undefined,
    setValue: (value: any) => void,
    ref: React.RefObject<HTMLInputElement>,
    linkUrl?: string,
    linkText?: string,
    isNumber?: boolean,
  ) => {
    return (tab === inputTab || tab === 'advanced') && (
      <InputContainer>
        <Input
          type={isNumber ? "number" : "text"}
          size='small'
          variant='standard'
          label={tab === 'advanced' ? placeholder : undefined}
          placeholder={tab !== 'advanced' ? placeholder : undefined}
          inputProps={{ autoCapitalize: "none" }}
          onKeyDown={e => inputKeyPress(e, ref)}
          onChange={e => setValue(e.target.value)}
          value={value}
          inputRef={ref}
          onPaste={filterPaste}
          InputProps={{
            inputProps: {
              autoCapitalize: 'none',
              inputMode: isNumber ? 'numeric' : 'text'
            },
            style: { paddingRight: 0 },
            endAdornment: (
              <IconButton disabled={!value} onClick={() => setValue && setValue("")}>
                <ClearIcon />
              </IconButton>
            )
          }}
        />
        {linkText && <BggLink href={linkUrl} target="_blank" style={{ top: tab === 'advanced' ? 22.5 : 6.5 }}>{linkText}</BggLink>}
        {isNumber && <SpinButtonCover style={{ top: tab === 'advanced' ? 25 : 10 }} />}
      </InputContainer>
    );
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

  renderCount.current++;

  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <PageHeaderContainer style={{ width: screenWidth }}>
          <PageHeader>
            <Form>
              {getIsMobileView(screenWidth) ?
                <FormControl variant="standard">
                  <Select value={tab} onChange={e => setTab(e.target.value as SelectedTab)}>
                    <MenuItem value="user">By Username</MenuItem>
                    <MenuItem value="game">By Game ID</MenuItem>
                    <MenuItem value="thread">By Thread</MenuItem>
                    <MenuItem value="geeklist">By GeekList</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
                :
                <Tabs value={tab} onChange={(_, value) => setTab(value)} scrollButtons="auto">
                  <Tab value="user" label="By Username" />
                  <Tab value="game" label="By Game ID" />
                  <Tab value="thread" label="By Thread" />
                  <Tab value="geeklist" label="By GeekList" />
                  <Tab value="advanced" label="Advanced" />
                </Tabs>
              }
              {input('user', "BGG Username(s)", usernamesInput, setUsernamesInput, usernamesRef)}
              {input('game', "BGG Game ID(s)", gameIdsInput, setGameIdsInput, gameIdsRef)}
              {input(
                'thread',
                "BGG Thread - Enter the ID, or paste a link!",
                threadIdInput,
                setThreadIdInput,
                threadIdRef,
                `https://boardgamegeek.com/thread/${threadId}`,
                threadTitle,
                true,
              )}
              {input(
                'geeklist',
                "BGG GeekList - Enter the ID, or paste a link!",
                geekListIdInput,
                setGeekListIdInput,
                geekListIdRef,
                `https://boardgamegeek.com/geeklist/${geekListId}`,
                geekListTitle,
                true,
              )}
              <Buttons>
                <ButtonsList>
                  <Button
                    size='small'
                    variant='contained'
                    onClick={() => setTextFieldStateValues()}
                    disabled={loadingGames}
                    sx={{ width: 160 }}
                  >
                    {loadingGames ? "Loading Games..." : "Load Games"}
                  </Button>
                  <Tooltip title="Change column visibility, game filters, scoring options, and other settings">
                    <SettingsIcon onClick={() => setShowDrawer(true)} style={{ color: '#348CE9', cursor: 'pointer' }} />
                  </Tooltip>
                </ButtonsList>
                <ButtonsList>
                  <Tooltip title="Copy a list of thing links to the games below to share on BGG forums">
                    <pre onClick={() => copyThingLinkListToClipboard()} style={{ color: '#348CE9', cursor: 'pointer' }} >[thing]</pre>
                  </Tooltip>
                  <Tooltip title="Copy a link to this view to share with others">
                    <Link onClick={() => copyUrlToClipboard()} style={{ color: '#348CE9', cursor: 'pointer' }} />
                  </Tooltip>
                  <Tooltip title="Download a CSV of the current view">
                    <Download onClick={() => downloadCsv()} style={{ color: '#348CE9', cursor: 'pointer' }} />
                  </Tooltip>
                </ButtonsList>
              </Buttons>
            </Form>
            <Logo src="/logo.png" alt="logo" />
          </PageHeader>
        </PageHeaderContainer>
        <GameRanker
          usernames={usernames}
          gameIds={gameIds}
          setGameIds={setGameIds}
          displayMode={displayMode}
          screenWidth={screenWidth}
          fallBackTo={fallBackTo}
          games={getSortedGames()}
          scoreIdealTime={scoreIdealTime}
          setScoreIdealTime={setScoreIdealTime}
          idealTime={idealTime}
          scorePlayerCount={scorePlayerCount}
          setScorePlayerCount={setScorePlayerCount}
          baseRating={baseRating}
          setBaseRating={setBaseRating}
          sort={sort}
          setSort={setSort}
          showGameId={getShowGameId()}
          showThreadSequence={getShowThreadSequence()}
          showGeekListSequence={getShowGeekListSequence()}
          showGrIndex={getShowGrIndex()}
          showUserRating={getShowUserRating()}
          showPlayerRating={getShowPlayerRating()}
          showGeekRating={getShowGeekRating()}
          showPlayerCount={showPlayerCount}
          showWeight={showWeight}
          showTime={showTime}
          showIndividualUserRatings={showIndividualUserRatings}
          idealWeight={idealWeight}
          scoreIdealWeight={scoreIdealWeight}
          setScoreIdealWeight={setScoreIdealWeight}
          playerCountArray={getPlayerCountArray()}
          gamesPerPage={gamesPerPage}
          setGamesPerPage={setGamesPerPage}
          page={page}
          setPage={setPage}
        />
      </ThemeProvider>
      <Snackbar
        message={snackbarMessage}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        open={openSnackbar}
      />
      <React.Fragment>
        <Drawer
          anchor='right'
          open={showDrawer}
          onClose={() => setShowDrawer(false)}
        >
          <Settings>
            <SettingsHeaderContainer>
              <SettingsHeader>
                Columns
              </SettingsHeader>
              <SettingsHeader>
                <Close fontSize='small' style={{ cursor: "pointer" }} onClick={() => setShowDrawer(false)} />
              </SettingsHeader>
            </SettingsHeaderContainer>
            <SettingsContent>
              {(tab === 'advanced' || displayMode === 'vertical') &&
                <FormControl variant='standard' sx={{ mb: 2 }}>
                  <InputLabel>Sort</InputLabel>
                  <Select
                    value={sort}
                    onChange={event => setSort(event.target.value)}
                    size="small"
                  >
                    {sortOptions.map((sort: SortOptions) => <MenuItem key={`sort-select-${sort}`} value={sort}>{getSortLabel(sort)}</MenuItem>)}
                  </Select>
                </FormControl>
              }
              {tab === 'advanced' && <>
                {toggle(showGameId, setShowGameId, "Game ID")}
                {toggle(showThreadSequence, setShowThreadSequence, "Thread #")}
                {toggle(showGeekListSequence, setShowGeekListSequence, "GeekList #")}
                {toggle(showGrIndex, setShowGrIndex, "GR Index")}
                {toggle(showUserRating, setShowUserRating, "User Rating")}
                {toggle(showPlayerRating, setShowPlayerRating, "Average Rating")}
                {toggle(showGeekRating, setShowGeekRating, "Geek Rating")}
              </>}
              {toggle(showPlayerCount, setShowPlayerCount, `Player Count Rating(s)`)}
              <SliderContainer>
                <SliderValue style={{ color: (showPlayerCount ? "" : "#000"), opacity: (showPlayerCount ? 1 : .38) }}>{playerCountRange[0]}</SliderValue>
                <StyledSlider min={1} max={10} step={1} value={playerCountRange} onChange={(event, value) => handleSliderChange(event, () => setPlayerCountRange(value as number[]))} />
                <SliderValue style={{ color: (showPlayerCount ? "" : "#000"), opacity: (showPlayerCount ? 1 : .38) }}>{playerCountRange[1]}</SliderValue>
              </SliderContainer>
              {toggle(showWeight, setShowWeight, "Weight")}
              {toggle(showTime, setShowTime, "Time")}
              {(tab === 'advanced' || tab === 'user') && toggle(showIndividualUserRatings, setShowIndividualUserRatings, "Individual Users Ratings", usernames.length < 2)}
            </SettingsContent>
            {(tab === 'advanced' || tab === 'user') &&
              <>
                <SettingsHeader>
                  Filters
                </SettingsHeader>
                <SettingsContent>
                  <FilterLabel>Status:</FilterLabel>
                  {toggle(includeOwned, setIncludeOwned, "Owned")}
                  {toggle(includeWishlisted, setIncludeWishlisted, "Wishlisted")}
                  {toggle(includeRated, setIncludeRated, "Rated")}
                  {tab === 'advanced' &&
                    <>
                      <FilterLabel>Type:</FilterLabel>
                      {toggle(includeBase, setIncludeBase, "Base Games")}
                      {toggle(includeExpansion, setIncludeExpansion, "Expansions")}
                    </>
                  }
                  {(tab === 'advanced' &&
                    <>
                      <FilterLabel>Filter Game IDs:</FilterLabel>
                      <RadioGroup value={gameIdFilter} onChange={handleGameIdFilterChange}>
                        <FormControlLabel value="all" control={<Radio />} label="All" />
                        <FormControlLabel value="only-selected" control={<Radio />} label="Only Selected" />
                        <FormControlLabel value="hide-selected" control={<Radio />} label="Hide Selected" />
                      </RadioGroup>
                    </>
                  )}
                </SettingsContent>
              </>
            }
            <SettingsHeader>
              Scoring
            </SettingsHeader>
            <SettingsContent>
              {toggle(scorePlayerCount, setScorePlayerCount, "Player Count")}
              {toggle(scoreIdealWeight, setScoreIdealWeight, "Ideal Weight")}
              <SliderContainer>
                <SliderValue style={{ color: (scoreIdealWeight ? "" : "#000"), opacity: (scoreIdealWeight ? 1 : .38) }}>{idealWeight}</SliderValue>
                <StyledSlider disabled={!scoreIdealWeight} min={1} max={5} step={0.5} value={idealWeight} onChange={(event, value) => handleSliderChange(event, () => setIdealWeight(Number(value)))} />
              </SliderContainer>
              {toggle(scoreIdealTime, setScoreIdealTime, "Ideal Time")}
              <SliderContainer>
                <SliderValue style={{ color: (scoreIdealTime ? "" : "#000"), opacity: (scoreIdealTime ? 1 : .38) }}>{idealTime}</SliderValue>
                <StyledSlider disabled={!scoreIdealTime} min={30} max={240} step={30} value={idealTime} onChange={(event, value) => handleSliderChange(event, () => setIdealTime(Number(value)))} />
              </SliderContainer>
              {(tab === 'advanced') &&
                <>
                  <FilterLabel>Base Rating:</FilterLabel>
                  <RadioGroup value={baseRating} onChange={handleBaseRatingChange}>
                    <FormControlLabel value="user-rating" control={<Radio />} label="User" />
                    <FormControlLabel value="player-rating" control={<Radio />} label="Average" />
                    <FormControlLabel value="geek-rating" control={<Radio />} label="Geek" />
                  </RadioGroup>
                </>
              }
              {(tab === 'advanced') &&
                <>
                  <FilterLabel>Fallback Rating: <Tooltip title="When a user rating isn't set, use this instead."><FallBackInfo /></Tooltip></FilterLabel>
                  <RadioGroup value={fallBackTo} onChange={handleFallBackToChange}>
                    <FormControlLabel value="player-rating" control={<Radio />} label="Average" />
                    <FormControlLabel value="geek-rating" control={<Radio />} label="Geek" />
                  </RadioGroup>
                </>
              }
            </SettingsContent>
            {getIsMobileView(screenWidth) &&
              <>
                <SettingsHeader>
                  UI
                </SettingsHeader>
                <SettingsContent>
                  <SettingsRow>
                    <Select
                      variant='standard'
                      fullWidth={false}
                      value={gamesPerPage.toString()}
                      onChange={event => setGamesPerPage(parseInt(event.target.value))}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                      label="Games per page"
                      MenuProps={{ disableScrollLock: true }}
                    >
                      {["25", "50", "100", "200", "500", "1000"].map(x => <MenuItem key={`games-per-page-select-${x}`} value={x}>{x}</MenuItem>)}
                    </Select>
                    games per page
                  </SettingsRow>
                  {toggle(singleColumnView, setSingleColumnView, "Single column view")}
                </SettingsContent>
              </>
            }
            {(tab === 'advanced') &&
              <>
                <SettingsHeader>
                  Cache
                </SettingsHeader>
                <SettingsContent>
                  <SettingsRow style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 14 }}>Clearing cache can refresh out-of-date game & user data.</div>
                  </SettingsRow>
                  <SettingsRow>
                    <Button onClick={() => clearCache()}><Cached sx={{ mr: 1 }} /> Clear Cache</Button>
                  </SettingsRow>
                </SettingsContent>
              </>
            }
          </Settings>
        </Drawer>
      </React.Fragment>
    </>
  );
}

export default App;
