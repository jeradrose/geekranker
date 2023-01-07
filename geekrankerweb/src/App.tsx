import React, { useEffect, useState, useRef } from 'react';
import { CollectionGame } from './models';
import "typeface-open-sans";
import { ArrowDownward, AddCircleOutline, RemoveCircleOutline, ExpandLess, ExpandMore, Info } from '@mui/icons-material';
import { TextField, Button, Tooltip, Switch, FormControlLabel, Slider, RadioGroup, Radio } from '@mui/material';

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

const PageHeader = styled.div`
  display: inline-flex;
  justify-content: space-between;
  box-sizing: border-box;
  align-items: flex-end;
  padding: 15px 15px 0 15px;
  flex-wrap: wrap-reverse;
  gap: 10px;
  position: sticky;
  left: 0;
  flex-grow: 1;
`;

const Filters = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const FiltersInnerRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`

const FiltersContainer = styled(FiltersInnerRow)`
  margin: 0 0 10px 0;
  width: 100%;
`;

const FiltersHeader = styled(FiltersInnerRow)`
  font-weight: bold;
  margin-top: 10px;
`;

const PlayerFilter = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

const Input = styled(TextField)`
  box-sizing: border-box;
  width: 100%;
  background-color: #fff;
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

const PlayerCountFilter = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 120px;
  line-height: 24px;
`;

const DecreasePlayerCount = styled(RemoveCircleOutline)`
  color: #348CE9;
  cursor: pointer;
`;

const IncreasePlayerCount = styled(AddCircleOutline)`
  color: #348CE9;
  cursor: pointer;
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
  padding: 5px 3px;
  background-color: #fcfcfc;
`;

const VerticalLabel = styled.div`
  width: 100px;
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
  color: inherit;
  align-self: flex-start;
  background-color: #348CE9;
  font-weight: bold;
  color: #fff;
  padding: 5px;
  width: 100%;
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
  z-index: 0;
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
  z-index: 3;
`;

const BarRank = styled.span`
  color: #348CE9;
  opacity: 75%;
  padding-left: 6px;
`;

type SortOptions = "name" | "geek-rating" | "player-rating" | "weight" | "player-count" | "playtime" | "grindex" | any;

type RankedScore = {
  score: number;
  rank: number;
}

type RankedScores = Record<number, RankedScore>;

type FallBackTo = "player-rating" | "geek-rating";

function App() {
  let params = new URLSearchParams(window.location.search);

  const usernamesRef = useRef<HTMLInputElement>(null);
  const renderCount = useRef<number>(0);

  const getUsernamesFromString = (usernamesString: string | undefined | null): string[] =>
    usernamesString?.split(/[^a-zA-Z0-9_]/).filter(u => u.length) ?? [];

  const parseNumberOrDefault = (value: string | null, defaultValue: number) => !value ? defaultValue : parseInt(value);
  const parseBoolOrDefault = (value: string | null, defaultValue: boolean) => value === null ? defaultValue : !(value.toLowerCase() === "false" || value === "0" || value === "no");

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [allGames, setAllGames] = useState<CollectionGame[]>([]);
  const [loadingGames, setLoadingGames] = useState<boolean>(false);

  // User options
  const sortDefault: SortOptions = "grindex";
  const playerCountDefault = 2;
  const fallbackToDefault: FallBackTo = "player-rating";
  const idealTimeDefault = 60;
  const idealWeightDefault = 3;

  const [usernames, setUsernames] = useState<string[]>(getUsernamesFromString(params.get("u")));
  const [sort, setSort] = useState<SortOptions>(params.get("s") || sortDefault);
  const [playerCount, setPlayerCount] = useState<number>(parseNumberOrDefault(params.get("pc"), playerCountDefault));
  const [showGeekRating, setShowGeekRating] = useState<boolean>(parseBoolOrDefault(params.get("gr"), false));
  const [showPlayerRating, setShowPlayerRating] = useState<boolean>(parseBoolOrDefault(params.get("pr"), false));
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [includeOwned, setIncludeOwned] = useState<boolean>(parseBoolOrDefault(params.get("own"), true));
  const [includeWishlist, setIncludeWishlist] = useState<boolean>(parseBoolOrDefault(params.get("wish"), false));
  const [showIndividualUserRatings, setShowIndividualUserRatings] = useState<boolean>(parseBoolOrDefault(params.get("ir"), false));
  const [fallBackTo, setFallBackTo] = useState<FallBackTo>(params.get("fb") as FallBackTo | null || fallbackToDefault);
  const [includeIdealTime, setIncludeIdealTime] = useState<boolean>(parseBoolOrDefault(params.get("it"), false));
  const [idealTime, setIdealTime] = useState<number>(parseNumberOrDefault(params.get("it"), idealTimeDefault));
  const [includeIdealWeight, setIncludeIdealWeight] = useState<boolean>(parseBoolOrDefault(params.get("iw"), false));
  const [idealWeight, setIdealWeight] = useState<number>(parseNumberOrDefault(params.get("iw"), idealWeightDefault));
  const [preventHorizontalScroll,
    setPreventHorizontalScroll] = useState<boolean>(false);

  const updateMedia = () => {
    setScreenWidth(document.documentElement.clientWidth || document.body.clientWidth);
  };

  useEffect(() => {
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });

  const setOrDeleteParam = (name: string, value: any, defaultValue: any) => {
    if (value === defaultValue) {
      params.delete(name);
    } else {
      if (typeof value === "boolean") {
        params.set(name, value ? "1" : "0");
      } else {
        params.set(name, value);
      }
    }
  }

  useEffect(() => {
    params = new URLSearchParams();

    setOrDeleteParam("u", usernames.join(' '), "");
    setOrDeleteParam("s", sort, sortDefault);
    setOrDeleteParam("pc", playerCount, playerCountDefault);
    setOrDeleteParam("gr", showGeekRating, false);
    setOrDeleteParam("pr", showPlayerRating, false);
    setOrDeleteParam("own", includeOwned, true);
    setOrDeleteParam("wish", includeWishlist, false);
    setOrDeleteParam("pr", showIndividualUserRatings, false);
    setOrDeleteParam("fb", fallBackTo, fallbackToDefault);
    setOrDeleteParam("it", includeIdealTime && idealTime, false);
    setOrDeleteParam("iw", includeIdealWeight && idealWeight, false);

    let url = location.pathname;

    if (params.toString()) {
      url += `?${params}`;
    }

    window.history.replaceState({}, '', url);
  });

  const getGrIndex = (game: CollectionGame): number => {
    const playerCountStats = game.playerCountStats.filter(s => s.playerCount === playerCount);

    if (playerCountStats.length !== 1) {
      return 0;
    }

    const userRatings = usernames.map(username => gameUserRating(username, game, false)[0]);

    const avgUserRating = (userRatings.reduce((a, b) => a + b) / userRatings.length);

    let numerator = playerCountStats[0].score * avgUserRating
    let denominator = 10;

    if (includeIdealWeight) {
      numerator = numerator * (idealWeight - Math.abs(game.avgWeight - idealWeight));
      denominator = denominator * idealWeight;
    }

    if (includeIdealTime) {
      numerator = numerator * Math.max(idealTime - Math.abs(game.maxPlayTime - idealTime), 0);
      denominator = denominator * idealTime;
    }

    return numerator / denominator;
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

  const barHeader = (thisSort: SortOptions, label: string) =>
    <BarHeader key={`header-${thisSort}`} onClick={() => setSort(thisSort)}>{label}{sortArrow(thisSort)}</BarHeader>;

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

  const usernameFilterKeyPress = (keyCode: number) => {
    if (keyCode ===
      13) {
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

  const handleFallBackToChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setFallBackTo((event.target as HTMLInputElement).value as FallBackTo);

  const handleSliderChange = (event: Event, callback: () => void) => {
    if (isIos() && event.type === 'mousedown') {
      return;
    }

    callback();
  }

  const filteredGames = allGames.filter(g => g.userStats.filter(us => (includeOwned && us.isOwned) || (includeWishlist && us.isWishlisted)).length > 0);

  const grIndexes = getScores(g => getGrIndex(g));
  const avgUserRatings = getScores(g => getAvgUserRatings(g));

  const sortedGames =
    (sort === 'name') ? filteredGames.sort((a, b) => a.name.localeCompare(b.name)) :
      (sort === 'geek-rating') ? filteredGames.sort((a, b) => b.geekRating - a.geekRating) :
        (sort === 'player-rating') ? filteredGames.sort((a, b) => b.avgPlayerRating - a.avgPlayerRating) :
          (sort === 'weight') ? filteredGames.sort((a, b) => b.avgWeight - a.avgWeight) :
            (sort === 'player-count') ? gamesSortedByPlayerCount(playerCount) :
              (sort === 'playtime') ? filteredGames.sort((a, b) => b.maxPlayTime - a.maxPlayTime) :
                (sort === 'grindex') ? filteredGames.sort((a, b) => grIndexes[b.gameId].score - grIndexes[a.gameId].score) :
                  usernames.map(u => `user-${u}`).filter(s => s === sort).length === 1 ? gamesSortedByUserRatings(sort.substring(5)) :
                    filteredGames;

  const getColumnWidth = (width: number, isShown: boolean) =>
    width * (isShown ? 1 : 0);

  const columnWidths =
    getColumnWidth(200, true) // name
    + getColumnWidth(200, true) // time
    + getColumnWidth(200, showPlayerRating) // player rating
    + getColumnWidth(200, showGeekRating) // geek rating
    + getColumnWidth(200, true) // weight
    + getColumnWidth(200, true) // player count rating
    + getColumnWidth((showIndividualUserRatings ? usernames.length : 1) * 200, true) // user rating(s)
    + getColumnWidth(200, true) // GR index
    ;

  const displayMode: "horizontal" | "vertical" = columnWidths + 35 > screenWidth && preventHorizontalScroll ? "vertical" : "horizontal";

  renderCount.current++;

  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <PageHeader style={{ width: screenWidth }}>
          <Filters>
            <FiltersContainer>
              <PlayerFilter>
                <Input size='small' inputProps={{ autoCapitalize: "none" }} onKeyDown={e => usernameFilterKeyPress(e.keyCode)} defaultValue={params.get("u") ?? ""} inputRef={usernamesRef} placeholder="BGG Username(s)" />
                <FilterButton size='small' variant='contained' onClick={() => lockInUsernames()} disabled={loadingGames}>{loadingGames ? "Loading Games..." : "Load Games"}</FilterButton>
              </PlayerFilter>
            </FiltersContainer>
            <FiltersContainer>
              <PlayerCountFilter>
                <DecreasePlayerCount onClick={() => setPlayerCount(Math.max(playerCount - 1, 1))} style={{ color: playerCount === 1 ? "#ccc" : undefined }} />
                {playerCount} players
                <IncreasePlayerCount onClick={() => setPlayerCount(Math.max(playerCount + 1, 1))} />
              </PlayerCountFilter>
            </FiltersContainer>
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
                  {toggle(showPlayerRating, setShowPlayerRating, "Player Rating")}
                  {toggle(showGeekRating, setShowGeekRating, "Geek Rating")}
                  {toggle(showIndividualUserRatings, setShowIndividualUserRatings, "Individual Users Ratings", usernames.length < 2)}
                </FiltersInnerRow>
                <FiltersHeader>
                  Filters
                </FiltersHeader>
                <FiltersInnerRow>
                  {toggle(includeOwned, setIncludeOwned, "Owned Games")}
                  {toggle(includeWishlist, setIncludeWishlist, "Wishlisted Games")}
                </FiltersInnerRow>
                <FiltersHeader>
                  Scoring
                </FiltersHeader>
                <FiltersInnerRow>
                  <SliderContainer>
                    <SliderLabel>
                      {toggle(includeIdealWeight, setIncludeIdealWeight, "Ideal weight")}
                    </SliderLabel>
                    <SliderValue style={{ color: (includeIdealWeight ? "" : "#000"), opacity: (includeIdealWeight ? 1 : .38) }}>{idealWeight}</SliderValue>
                    <StyledSlider disabled={!includeIdealWeight} min={1} max={5} step={0.5} value={idealWeight} onChange={(event, value) => handleSliderChange(event, () => setIdealWeight(Number(value)))} />
                  </SliderContainer>
                </FiltersInnerRow>
                <FiltersInnerRow>
                  <SliderContainer>
                    <SliderLabel>
                      {toggle(includeIdealTime, setIncludeIdealTime, "Ideal time")}
                    </SliderLabel>
                    <SliderValue style={{ color: (includeIdealTime ? "" : "#000"), opacity: (includeIdealTime ? 1 : .38) }}>{idealTime}</SliderValue>
                    <StyledSlider disabled={!includeIdealTime} min={30} max={240} step={30} value={idealTime} onChange={(event, value) => handleSliderChange(event, () => setIdealTime(Number(value)))} />
                  </SliderContainer>
                </FiltersInnerRow>
                <FiltersInnerRow>
                  <FallBackContainer>
                    Fallback rating:
                    <RadioGroup value={fallBackTo} onChange={handleFallBackToChange} row>
                      <FormControlLabel value="player-rating" control={<Radio />} label="Player" />
                      <FormControlLabel value="geek-rating" control={<Radio />} label="Geek" />
                    </RadioGroup>
                    <Tooltip title="When a user rating isn't set, use this instead."><FallBackInfo /></Tooltip>
                  </FallBackContainer>
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
          <Logo src="/logo.png" alt="logo" />
        </PageHeader>
        {displayMode === "horizontal" &&
          <GamesHeader>
            <HeaderRow style={{ minWidth: screenWidth }}>
              <ImageAndNameHeader onClick={() => setSort("name")}>
                GAME{sortArrow("name")}
              </ImageAndNameHeader>
              {barHeader("grindex", "GR INDEX")}
              {barHeader("playtime", "TIME")}
              {showPlayerRating && barHeader("player-rating", "PLAYER RATING")}
              {showGeekRating && barHeader("geek-rating", "GEEK RATING")}
              {barHeader("weight", "WEIGHT")}
              {barHeader("player-count", `${playerCount}-PLAYER`)}
              {showIndividualUserRatings || usernames.length < 2 ? usernames.map(u => barHeader(`user-${u}`, u.toUpperCase())) : barHeader(`users`, "Users")}
            </HeaderRow>
          </GamesHeader>
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

                <HorizontalCell>{bar(grIndexes[g.gameId].score ?? 0, 10, grIndexes[g.gameId].rank ?? 0)}</HorizontalCell>
                <HorizontalCell>{timeBar(g.minPlayTime, g.maxPlayTime)}</HorizontalCell>
                {showPlayerRating && <HorizontalCell>{bar(g.avgPlayerRating, 10, g.avgPlayerRatingRank)}</HorizontalCell>}
                {showGeekRating && <HorizontalCell>{bar(g.geekRating, 10, g.geekRatingRank)}</HorizontalCell>}
                <HorizontalCell>{bar(g.avgWeight, 5, g.avgWeightRank, includeIdealWeight && idealWeight)}</HorizontalCell>
                <HorizontalCell>{playerCountBar(playerCount, g)}</HorizontalCell>
                {showIndividualUserRatings || usernames.length < 2 ?
                  usernames.map(u => <HorizontalCell key={`userRating-${g.gameId}-${u}`}>{userRatingBar(u, g)}</HorizontalCell>) :
                  <HorizontalCell>{userRatingBar("", g)}</HorizontalCell>
                }
              </GameHorizontally> :
              <GameVertically key={`game-vertical-${g.gameId}`} style={{ width: screenWidth }}>
                <ImageAndNameVertical href={`https://www.boardgamegeek.com/boardgame/${g.gameId}`} target="_balnk">
                  <ThumbnailContainer>
                    <Thumbnail src={g.imageUrl} />
                  </ThumbnailContainer>
                  <GameName>{g.name}</GameName>
                </ImageAndNameVertical>

                {verticalCell("GR Index", bar(grIndexes[g.gameId].score ?? 0, 10, grIndexes[g.gameId].rank ?? 0))}
                {verticalCell("Play Time", timeBar(g.minPlayTime, g.maxPlayTime))}
                {showPlayerRating && verticalCell("Player Rating", bar(g.avgPlayerRating, 10, g.avgPlayerRatingRank))}
                {showGeekRating && verticalCell("Geek Rating", bar(g.geekRating, 10, g.geekRatingRank))}
                {verticalCell("Weight", bar(g.avgWeight, 5, g.avgWeightRank, includeIdealWeight && idealWeight))}
                {verticalCell(`${playerCount}-Player`, bar(g.avgWeight, 5, g.avgWeightRank))}
                {showIndividualUserRatings || usernames.length < 2 ?
                  usernames.map(u => verticalCell(u, userRatingBar(u, g), g.gameId)) :
                  verticalCell("User Rating", userRatingBar("", g))
                }
              </GameVertically>
          );
        })}
      </ThemeProvider>
    </>
  );
}

export default App;
