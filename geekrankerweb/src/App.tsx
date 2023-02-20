import React, { useEffect, useState, useRef, useMemo } from 'react';
import styled, { createGlobalStyle, keyframes } from "styled-components"

import "typeface-open-sans";

import { Cached, Clear, Close, Download, Link, Settings as SettingsIcon } from '@mui/icons-material';
import { TextField, Button, IconButton, Tabs, Tab, FormControl, Select, MenuItem, Drawer, Slider, InputLabel, FormControlLabel, Switch, RadioGroup, Radio, Tooltip, Snackbar } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material';

import { Game, PlayerCountStats, UserStats } from './models';
import { getStringQueryParam, getQueryParam, QueryParams, SelectedTab, getBoolQueryParam, getNumberArrayQueryParam, getTypedStringQueryParam, getNumberQueryParam, defaultQueryValues, sortOptions, getSortLabel, DisplayMode, SortOptions, getUsernamesFromString, getGameIdsFromString, getIdFromString, updateRanks, getGameUserRating, getBggGameUrl, getGamePlayerCountStats, getIsMobileView, ApiState } from './Utilities';
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
  margin-top: 3px;
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
`;

const Logo = styled.img`
  max-width: 100%;
  width: 400px;
  object-fit: contain;
  padding: 5px 0;
  cursor: pointer;
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
  font-weight: 400;
  max-width: 700px;
  margin: 15px;
`;

const IntroHeader = styled.div`
  background-color: #348CE9;
  color: #fff;
  font-weight: 400;
  border-color: #348CE9;
  border-style: solid;
  border-width: 3px;
  border-radius: 17px 17px 0 0;
  padding: 15px 15px 0 15px;
`;

const IntroHeaderParagraph = styled.div`
  font-weight: bold;
`;

const IntroParagraph = styled.div`
  margin-bottom: 10px;
`;

const IntroEmphasis = styled.div`
  display: inline;
  font-weight: bold;
`;

const IntroContentBase = styled.div`
  background-color: #fcfcfc;
  border-color: #348CE9;
  border-style: solid;
  border-width: 3px;
  padding: 15px;
`;

const IntroContent = styled(IntroContentBase)`
  border-radius: 0 0 20px 20px;
`;

const IntroContentOnly = styled(IntroContentBase)`
  border-radius: 20px;
`;

const IntroList = styled.ul`

`;

const IntroListItem = styled.li`
  margin: 10px 15px 10px 0;
`;

const IntroTip = styled.div`
  padding-top: 4px;
  color: #348CE9;
`;

const IntroTipLink = styled(IntroTip)`
  cursor: pointer;
`;

const LoadingState = styled.div`
  display: inline-flex;
  flex-direction: column;
  box-sizing: border-box;
  position: sticky;
  left: 0;
  align-items: center;
  width: 300px;
  height: 100px;

  border-radius: 20px;
  background-color: #fcfcfc;
  border-color: #348CE9;
  border-style: solid;
  border-width: 3px;
  padding: 15px;
  margin: 15px;
`;

const GameProgress = styled.div`
  display: inline-flex;
  align-items: center;
  width: 250px;
`;

const GameProgressLoaderAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const GameProgressLoaderContainer = styled.div`
  width: 30px;
  height: 30px;
  margin: 10px;
`;

const GameProgressMeeple = styled.div`
  position: absolute;
  padding: 6px 8px;
`;

const GameProgressLoader = styled.div`
  position: absolute;
  border: 3px solid #eee;
  border-top: 3px solid #348CE9;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  animation: ${GameProgressLoaderAnimation} 1s linear infinite;
`;

const GameProgressBar = styled.div`
  height: 20px;
  background-color: #F25D07;
  transition: width 0.25s;
`;

const GameProgressScore = styled.div`
  padding-right: 7px;
  padding-left: 2px;
`;

const GameProgressRank = styled.div`
  color: #348CE9;
`;

const ErrorState = styled.div`
  color: #F25D07;
  display: inline-flex;
  flex-direction: column;
  box-sizing: border-box;
  position: sticky;
  left: 0;
  align-items: center;
  max-width: 500px;

  border-radius: 20px;
  background-color: #fcfcfc;
  border-color: #348CE9;
  border-style: solid;
  border-width: 3px;
  padding: 15px;
  margin: 15px;
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
  const [scoreUserRating, setScoreUserRating] = useState<boolean>(getBoolQueryParam(QueryParams.ScoreUserRating));
  const [scorePlayerRating, setScorePlayerRating] = useState<boolean>(getBoolQueryParam(QueryParams.ScorePlayerRating));
  const [scoreGeekRating, setScoreGeekRating] = useState<boolean>(getBoolQueryParam(QueryParams.ScoreGeekRating));

  // UI options
  const [singleColumnView, setSingleColumnView] = useState<boolean>(localStorage.getItem("singleColumnView") === "true");
  const [gamesPerPage, setGamesPerPage] = useState<number>(parseInt(localStorage.getItem("gamesPerPage") || "100"));
  const [page, setPage] = useState<number>(1);
  const [showTips, setShowTips] = useState<boolean>(false);

  // Loading state
  const [apiState, setApiState] = useState<ApiState>({});

  // Snackbar states
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const queryValues: { [key in QueryParams]: SelectedTab | string | number | string[] | boolean | undefined } = {
    [QueryParams.SelectedTab]: tab,
    [QueryParams.Usernames]: usernames.length ? usernames.map(u => u.indexOf(' ') >= 0 ? `"${u}"` : u).join(' ') : undefined,
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
    [QueryParams.ScoreUserRating]: scoreUserRating,
    [QueryParams.ScorePlayerRating]: scorePlayerRating,
    [QueryParams.ScoreGeekRating]: scoreGeekRating,
  }

  const getShowGameId = () => (tab === 'advanced' && showGameId);
  const getShowThreadSequence = () => ((tab === 'advanced' && showThreadSequence) || tab === 'thread');
  const getShowGeekListSequence = () => ((tab === 'advanced' && showGeekListSequence) || tab === 'geeklist');
  const getShowGrIndex = () => (tab !== 'advanced' || showGrIndex);

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
      case QueryParams.ScoreUserRating: return true;
      case QueryParams.ScorePlayerRating: return true;
      case QueryParams.ScoreGeekRating: return false;
    }
  }

  // Update URL query params
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

    if (scoreUserRating && usernames.length) {
      const userRatings = usernames
        .filter(u => game.userStats.find(us => us.username === u && us.rating))
        .map(username => getGameUserRating(username, game) || 0);

      if (userRatings.length) {
        const avgUserRating = userRatings.reduce((a, b) => a + b) / userRatings.length;

        numerator *= avgUserRating;
      } else {
        numerator *= 0;
      }
      denominator *= 10;
    }

    if (scorePlayerRating) {
      numerator *= game.avgPlayerRating;
      denominator *= 10;
    }

    if (scoreGeekRating) {
      numerator *= game.geekRating;
      denominator *= 10;
    }

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
    getFilteredGames().sort((a, b) => (getGameUserRating(username, b) || 10) - (getGameUserRating(username, a) || 10));

  const getAvgUserRatings = (game: Game): number | undefined => {
    const totalRatings = game.userStats.filter(us => us.rating).length;
    return totalRatings && (
      usernames
        .filter(u => game.userStats.find(us => us.username === u))
        .map(u => getGameUserRating(u, game) || 0)
        .reduce((a, b) => a + b) / totalRatings
    );
  }

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
                        (sort === 'user-rating') ? getFilteredGames().sort((a, b) => (getAvgUserRatings(b) || 10) - (getAvgUserRatings(a) || 10)) :
                          (sort as string).startsWith('user-') ? getGamesSortedByUserRatings(sort.split("-")[1]) :
                            getFilteredGames();

  const handleGameIdFilterChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setGameIdFilter((event.target as HTMLInputElement).value as GameIdFilter);

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
    setAllGames([]);
    setGeekListTitle("");
    setThreadTitle("");

    if (!usernames.length && !gameIds.length && !threadId && !geekListId) {
      return;
    }

    const rankings = await getRankings(usernames, gameIds, threadId, geekListId, apiState, setApiState);

    updateAllCalculatedScores(rankings.games);
    updateAllRanks(rankings.games);
    setAllGames(rankings.games);
    setGeekListTitle(rankings.geekListTitle);
    setThreadTitle(rankings.threadTitle);
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
      ...((showUserRating && userRatingsHeader) || [null]),
      (showPlayerRating && getSortLabel("player-rating")) || null,
      (showGeekRating && getSortLabel("geek-rating")) || null,
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
      ...(showUserRating &&
        (showIndividualUserRatings || usernames.length < 2 ?
          usernames.map(u => (getGameUserRating(u, g) || "").toString()) :
          (g.avgUserRating || "").toString()) || [null]),
      (showPlayerRating && g.avgPlayerRating.toString()) || null,
      (showGeekRating && g.geekRating.toString()) || null,
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
  }, [
    scorePlayerCount,
    scoreIdealWeight,
    scoreIdealTime,
    idealWeight,
    idealTime,
    playerCountRange,
    scoreUserRating,
    scorePlayerRating,
    scoreGeekRating
  ])

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

  useEffect(() => {
    if (apiState.usernamesNotFound) {
      setSnackbarMessage(`Could not find user${apiState.usernamesNotFound.length > 1 ? "s" : ""} ${apiState.usernamesNotFound.map(u => `"${u}"`).join(', ')}, or no games were found.`);
      setOpenSnackbar(true);
      setApiState({ ...apiState, usernamesNotFound: undefined });
    }
  }, [apiState])

  const setTextFieldStateValues = () => {
    setUsernames(getUsernamesFromString(usernamesInput));
    setGameIds(getGameIdsFromString(gameIdsInput));
    setThreadId(getIdFromString(threadIdInput));
    setGeekListId(getIdFromString(geekListIdInput));
  };

  const resetInputs = () => {
    setTab('user');
    setUsernamesInput("");
    setGameIdsInput("");
    setThreadIdInput("");
    setGeekListIdInput("");
  }

  const inputKeyPress = (e: React.KeyboardEvent, ref: React.RefObject<HTMLInputElement>) => {
    if (e.key === "Enter") {
      ref.current?.blur();
      setTextFieldStateValues();
    }
  }

  const filterPaste = (e: React.ClipboardEvent, ref: React.RefObject<HTMLInputElement>) => {
    const text = e.clipboardData.getData('Text');

    const threadRegexp = /https:\/\/boardgamegeek.com\/thread\/([0-9]*)\//;
    const geeklistRegexp = /https:\/\/boardgamegeek.com\/geeklist\/([0-9]*)\//;
    const gameIdRegexp = /[0-9]*/g;

    if (ref === threadIdRef && text.match(threadRegexp) != null) {
      setThreadIdInput(text.match(threadRegexp)![1]);
      e.preventDefault();
    }

    if (ref === geekListIdRef && text.match(geeklistRegexp)) {
      setGeekListIdInput(text.match(geeklistRegexp)![1]);
      e.preventDefault();
    }

    if (ref === gameIdsRef && text.match(gameIdRegexp)) {
      setGameIdsInput(text.match(gameIdRegexp)!.filter(m => m).join(' '));
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
          onPaste={e => filterPaste(e, ref)}
          multiline
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

  const tipIconStyle: React.CSSProperties = {
    marginBottom: -6
  }

  const inlineMeeple = <img src="/gr-meeple.png" height="15px" style={{ marginBottom: -1, marginRight: 2, marginLeft: 2 }} />;

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
                    <MenuItem value="thread">By Thread</MenuItem>
                    <MenuItem value="geeklist">By GeekList</MenuItem>
                    <MenuItem value="game">By Game ID</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
                :
                <Tabs value={tab} onChange={(_, value) => setTab(value)} scrollButtons="auto">
                  <Tab value="user" label="By Username" />
                  <Tab value="thread" label="By Thread" />
                  <Tab value="geeklist" label="By GeekList" />
                  <Tab value="game" label="By Game ID" />
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
                    disabled={!!apiState.currentlyLoading}
                    sx={{ width: 160 }}
                  >
                    {apiState.currentlyLoading ? "Loading Games..." : "Load Games"}
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
            <Logo src="/logo.png" alt="logo" onClick={() => resetInputs()} />
          </PageHeader>
        </PageHeaderContainer>
        <GameRanker
          usernames={usernames}
          gameIds={gameIds}
          setGameIds={setGameIds}
          displayMode={displayMode}
          screenWidth={screenWidth}
          games={getSortedGames()}
          scoreIdealTime={scoreIdealTime}
          setScoreIdealTime={setScoreIdealTime}
          idealTime={idealTime}
          scorePlayerCount={scorePlayerCount}
          setScorePlayerCount={setScorePlayerCount}
          scoreUserRating={scoreUserRating}
          setScoreUserRating={setScoreUserRating}
          scorePlayerRating={scorePlayerRating}
          setScorePlayerRating={setScorePlayerRating}
          scoreGeekRating={scoreGeekRating}
          setScoreGeekRating={setScoreGeekRating}
          sort={sort}
          setSort={setSort}
          showGameId={getShowGameId()}
          showThreadSequence={getShowThreadSequence()}
          showGeekListSequence={getShowGeekListSequence()}
          showGrIndex={getShowGrIndex()}
          showUserRating={showUserRating}
          showPlayerRating={showPlayerRating}
          showGeekRating={showGeekRating}
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
        {apiState.isTooManyRetries &&
          <EmptyState style={{ width: screenWidth }}>
            <ErrorState>
              The BGG API responded with "too many requests". Please wait a minute or two and try again.
            </ErrorState>
          </EmptyState>
        }
        {apiState.currentlyLoading &&
          <EmptyState style={{ width: screenWidth }}>
            <LoadingState>
              Loading {apiState.currentlyLoading === "geeklist" ? "GeekList" : apiState.currentlyLoading}...
              <GameProgress>
                <GameProgressLoaderContainer>
                  <GameProgressLoader />
                  <GameProgressMeeple>
                    <img src="/gr-meeple.png" style={{ height: 16 }} />
                  </GameProgressMeeple>
                </GameProgressLoaderContainer>
                {(apiState.maxItem || 0) > 1 &&
                  <>
                    <GameProgressBar style={{ width: (((apiState.currentItem || 0) / (apiState.maxItem || 1)) * 140) }} />
                    <GameProgressScore>{(((apiState.currentItem || 0) / (apiState.maxItem || 1)) * 10).toFixed(2)}</GameProgressScore>
                    <GameProgressRank>#{(apiState.maxItem || 1) - (apiState.currentItem || 0)}</GameProgressRank>
                  </>
                }
              </GameProgress>
            </LoadingState>
          </EmptyState>
        }
        {getSortedGames().length === 0 && !apiState.currentlyLoading && !apiState.isTooManyRetries &&
          <EmptyState style={{ width: screenWidth }}>
            {tab === 'user' &&
              <Intro>
                <IntroHeader>
                  <IntroHeaderParagraph>Welcome to Geek Ranker --</IntroHeaderParagraph>
                  <IntroParagraph>A new way to view, filter, sort -- and rank! -- collections and lists of BGG board games.</IntroParagraph>
                </IntroHeader>
                <IntroContent>
                  <IntroParagraph>This is the <IntroEmphasis>Username tab</IntroEmphasis>, where you can load games from your collection -- or any other user's collection.</IntroParagraph>
                  <IntroList>
                    <IntroListItem>
                      Easily load games from <IntroEmphasis>your own collection</IntroEmphasis>.
                      {showTips && <IntroTip>Just type your BGG username above and click "Load Games". You can sort by any column simply by clicking the column header.</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      View your collection merged with <IntroEmphasis>other BGG users' collections</IntroEmphasis> -- see how your games stack against others that share your interests.
                      {showTips && <IntroTip>Enter yours and others' BGG usernames (separated by space, or anything really) and click "Load Games".</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      <IntroEmphasis>Rank your games using the Geek Ranker Index</IntroEmphasis> ({inlineMeeple}GR Index) that combines many stats into one score.
                      {showTips && <IntroTip>After loading your games, click the <SettingsIcon style={tipIconStyle} />Settings button to toggle columns, and play around with different filters and scoring options.</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      Use the {inlineMeeple}GR Index to <IntroEmphasis>rank your wishlist</IntroEmphasis> and figure out which games are best in different scenarios (e.g. 2 player, mid-light weight, 30 minutes), to help narrow down the next game to add to your collection.
                      {showTips && <IntroTip>Under <SettingsIcon style={tipIconStyle} />Settings, toggle "Wishlisted Games" and try different scenarios to find the best fit for the games you have your eye on.</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      <IntroEmphasis>Share your list</IntroEmphasis> with others on BGG or social media.
                      {showTips && <IntroTip>Click the <Link style={tipIconStyle} />Link button to copy the URL, then simply paste it to any platform to share with others.</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      <IntroTipLink onClick={() => setShowTips(!showTips)}><IntroEmphasis>Click here to toggle tips for each of the above!</IntroEmphasis></IntroTipLink>
                    </IntroListItem>
                  </IntroList>
                </IntroContent>
              </Intro>
            }
            {tab === 'thread' &&
              <Intro>
                <IntroContentOnly>
                  <IntroParagraph>This is the <IntroEmphasis>Thread tab</IntroEmphasis>, a great place to compare games mentioned in a BGG thread.</IntroParagraph>
                  <IntroList>
                    <IntroListItem>
                      <IntroEmphasis>Load all games mentioned in a thread</IntroEmphasis>, as long as they are linked in the thread (sorry, games mentioned by name without a link won't be loaded).
                      {showTips && <IntroTip>Enter the thread ID above -- or just copy and paste the URL of the thread -- and click "Load Games".</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      A great way to <IntroEmphasis>compare games in a Recommendations thread</IntroEmphasis>. Especially if someone has provided specific criteria, such as player count, weight, time.
                      {showTips && <IntroTip>After you've loaded games, click the <SettingsIcon style={tipIconStyle} />Settings button, and tweak any of the various settings. The {inlineMeeple}GR Index will calculate the best games based on the scoring settings entered.</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      <IntroEmphasis>Share a link in a recommendations thread!</IntroEmphasis> BGG users can click the BGG link, and instantly see all the games and the various stats to see which games fit their playstyle the best.
                      {showTips && <IntroTip>After tweaking the settings for the recommendation, click the <Link style={tipIconStyle} />Link button to copy the URL, then paste it into the BGG thread.</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      <IntroEmphasis>Also great for looking for recommendations.</IntroEmphasis> Just figure out what type of game you're lookign for, by player count, weight, and time, and share the link when you start a recommendation thread.
                      {showTips && <IntroTip>After tweaking the settings for what you're looking for, click the <Link style={tipIconStyle} />Link button to copy the URL, then paste it into the BGG thread.</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      <IntroTipLink onClick={() => setShowTips(!showTips)}><IntroEmphasis>Click here to toggle tips for each of the above!</IntroEmphasis></IntroTipLink>
                    </IntroListItem>
                  </IntroList>
                </IntroContentOnly>
              </Intro>
            }
            {tab === 'geeklist' &&
              <Intro>
                <IntroContentOnly>
                  <IntroParagraph>This is the <IntroEmphasis>GeekList tab</IntroEmphasis>, where you can finally view all games in a GeekList alongside data like ratings, weight, and player count recommendations.</IntroParagraph>
                  <IntroList>
                    <IntroListItem>
                      <IntroEmphasis>Load all games from a GeekList</IntroEmphasis> just by knowing the ID or URL.
                      {showTips && <IntroTip>Enter the thread ID above -- or just copy and paste the URL of the GeekList -- and click "Load Games".</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      A great way to <IntroEmphasis>compare games in a GeekList</IntroEmphasis>. Some GeekLists are even taylored to certain playstyles, so you can now see exactly how they score across the various scoring criterie.
                      {showTips && <IntroTip>After you've loaded games, click the <SettingsIcon style={tipIconStyle} />Settings button, and tweak any of the various settings. The {inlineMeeple}GR Index will calculate the best games based on the scoring settings entered.</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      <IntroEmphasis>Provide the GR link when creating a GeekList</IntroEmphasis> to give viewers a great way to view and score the games on your GeekList.
                      {showTips && <IntroTip>Use the <SettingsIcon style={tipIconStyle} />Settings to enable any specific stats, filters, or scoring criteria you want to highlight in your GeekList, then click the <pre onClick={() => copyThingLinkListToClipboard()} style={{ color: '#348CE9', cursor: 'pointer' }} >[thing]</pre> button which will copy Thing links into the clipboard. Then just paste these in the recommendation thread, and they'll automatically show up when others load the Geek Ranker list for the thread.</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      <IntroTipLink onClick={() => setShowTips(!showTips)}><IntroEmphasis>Click here to toggle tips for each of the above!</IntroEmphasis></IntroTipLink>
                    </IntroListItem>
                  </IntroList>
                </IntroContentOnly>
              </Intro>
            }
            {tab === 'game' &&
              <Intro>
                <IntroContentOnly>
                  <IntroParagraph>This is the <IntroEmphasis>Game ID tab</IntroEmphasis>, where you can load any BGG simply by entering its ID.</IntroParagraph>
                  <IntroList>
                    <IntroListItem>
                      <IntroEmphasis>Load any game</IntroEmphasis>, it doesn't have to be in your collection or a list.
                      {showTips && <IntroTip>Grab any number of Game IDs from BGG, and enter them above and click "Load Games".</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      Useful if you're looking at a <IntroEmphasis>list of game IDs that someone has shared</IntroEmphasis> (e.g. in a spreadsheet), and want to compare them on Geek Ranker.
                      {showTips && <IntroTip>Just copy the list of IDs, and past them above -- Geek Ranker will parse the list for you, and enter them separated by spaces (other characters work, too).</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      <IntroEmphasis>Rank games using the {inlineMeeple}GR Index</IntroEmphasis>, just like you can with any other list.
                      {showTips && <IntroTip>After loading your games, click the <SettingsIcon style={tipIconStyle} />Settings button to toggle columns, and play around with different filters and scoring options.</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      <IntroTipLink onClick={() => setShowTips(!showTips)}><IntroEmphasis>Click here to toggle tips for each of the above!</IntroEmphasis></IntroTipLink>
                    </IntroListItem>
                  </IntroList>
                </IntroContentOnly>
              </Intro>
            }
            {tab === 'advanced' &&
              <Intro>
                <IntroContentOnly>
                  <IntroParagraph>This is the <IntroEmphasis>Advanced tab</IntroEmphasis>: basically everything you can do on Geek Ranker can be done here</IntroParagraph>
                  <IntroParagraph><IntroEmphasis>Warning:</IntroEmphasis> this tab may be a bit overwhelming for new members -- play around with the other tabs until you get more familiar with how Geek Ranker works before exploring the Advanced tab.</IntroParagraph>
                  <IntroList>
                    <IntroListItem>
                      <IntroEmphasis>Combine multiple lists</IntroEmphasis> to see games from many lists merged into one big Geek Ranker list.
                      {showTips && <IntroTip>Enter any combindation of username(s), a thread, a GeekList, and/or any game IDs, then click "Load Games". Warning: Geek Ranker has to load data from BGG, so be aware that loading too many games at once may take a while and/or cause other issues.</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      <IntroEmphasis>Experiment with the many settings</IntroEmphasis> that are all unlocked on the advanced tab.
                      {showTips && <IntroTip>Click the <SettingsIcon style={tipIconStyle} />Settings button and you'll see all of the columns you can enable, and the various filters and scoring criteria you can use.</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      Use Geek Ranker to look for games and <IntroEmphasis>share them in recommendation threads</IntroEmphasis>.
                      {showTips && <IntroTip>Click the <SettingsIcon style={tipIconStyle} />Settings button to make sure the "Game ID" column is visible. Use the toggle on the Game ID column to select any games you'd like to share. Then click the <Link style={tipIconStyle} />Link button to copy the URL, then paste it into the BGG thread.</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      <IntroEmphasis>Download a CSV of your Geek Ranker list!</IntroEmphasis>
                      {showTips && <IntroTip>Click the <Download style={tipIconStyle} />Download button to download all games in the current Geek Ranker list. Great for playing with all the different bits of data, or even sharing with friends (e.g. import it as a Google Sheets doc).</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      <IntroEmphasis>Having trouble?</IntroEmphasis> Try clearing the cache.
                      {showTips && <IntroTip>If you run into any issues, the first thing to try is clearning the cache. Click the <SettingsIcon style={tipIconStyle} />Settings button from the Advanced tab (this is not available on the other tabs), and scroll all the way to the bottom of the list, and click the <IntroEmphasis>"Clear Cache" button</IntroEmphasis>. Cache is used to make Geek Ranker super speedy, but if it gets out of sorts, you may experience issues. Clearning it should get you going again.</IntroTip>}
                    </IntroListItem>
                    <IntroListItem>
                      <IntroTipLink onClick={() => setShowTips(!showTips)}><IntroEmphasis>Click here to toggle tips for each of the above!</IntroEmphasis></IntroTipLink>
                    </IntroListItem>
                  </IntroList>
                </IntroContentOnly>
              </Intro>
            }
          </EmptyState>
        }
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
              </>}
              {toggle(showUserRating, setShowUserRating, "User Rating")}
              {toggle(showPlayerRating, setShowPlayerRating, "Average Rating")}
              {toggle(showGeekRating, setShowGeekRating, "Geek Rating")}
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
              {toggle(scoreUserRating, setScoreUserRating, "User Rating")}
              {toggle(scorePlayerRating, setScorePlayerRating, "Avg. Player Rating")}
              {toggle(scoreGeekRating, setScoreGeekRating, "Geek Rating")}
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
