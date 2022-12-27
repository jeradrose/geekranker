import React, { useEffect, useState } from 'react';
import { CollectionGame } from './models';
import "typeface-open-sans";
import { ArrowDownward, AddCircleOutline, RemoveCircleOutline, ExpandLess, ExpandMore } from '@mui/icons-material';
import { TextField, Button, Tooltip, Switch, FormControlLabel } from '@mui/material';

import styled, { createGlobalStyle } from "styled-components"

import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({
  typography: {
    fontFamily: 'Open Sans',
    // fontSize: 13,
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
  }
`;

const MainBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 15px 15px 0 15px;
  flex-wrap: wrap-reverse;
  gap: 10px;
`;

const Filters = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const FiltersInnerRow = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: 600px) {
    align-items: flex-start;
    flex-direction: column;
  }
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
  display: flex;
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

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  background-color: #fcfcfc;
  z-index: 20;
`;

const RowBase = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  box-sizing: border-box;
`;

const HeaderRow = styled(RowBase)`
  background-color: #348CE9;
  font-weight: bold;
  color: #fff;
  padding: 0 15px;
  margin: 10px 0 0 0;

  @media (max-width: 600px) {
    display: none;
  }
`;

const Row = styled(RowBase)`
  @media (min-width: 601px) {
    margin: 2px 0;
    padding: 5px 15px;
  background-color: #fcfcfc;
  :hover {
    background-color: #f4f4f4;
    }
  }

  @media (max-width: 600px) {
    flex-direction: column;
    height: auto;
  }
`;

const CellContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1px 0;
  flex-grow: 1;
  min-width: 200px;

  @media (max-width: 600px) {
    padding: 5px 3px;
    background-color: #fcfcfc;
  }
  @media (min-width: 601px) {
    flex-basis: 200px;
  }
`;

const GrScoreContainer = styled(CellContainer)`
  @media (max-width: 600px) {
    font-weight: bold;
  }
`

const CellLabel = styled.div`
  @media (min-width: 601px) {
    display: none;
  }
`;

const ImageAndNameHeader = styled.a`
  box-sizing: border-box;
  align-self: center;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  flex-grow: 1;
  min-width: 200px;
  text-decoration: none;
  cursor: pointer;
  @media (min-width: 601px) {
    flex-basis: 200px;
  }
`;

const ThumbnailContainer = styled.div`
  width: 30px;
  min-width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const RowCell = styled.div`
  align-self: center;
`;

const ImageAndName = styled(ImageAndNameHeader)`
  color: inherit;

  @media (max-width: 600px) {
    align-self: flex-start;
    background-color: #348CE9;
    font-weight: bold;
    color: #fff;
    padding: 5px;
    width: 100%;
  }
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

const PlayTime = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: 600px) {
    align-self: center;
    width: 200px;
  }
  @media (min-width: 601px) {
    flex-grow: 1;
    flex-basis: 200px;
    min-width: 200px;
  justify-content: center;
  }
`;

const PlayTimeHeader = styled(PlayTime)`
  cursor: pointer;
`

const BarHeader = styled(RowCell)`
  display: flex;
  align-items: center;
  justify-content: left;
  cursor: pointer;
  flex-grow: 1;
  flex-basis: 200px;
  min-width: 200px;
`;

const BarContainer = styled(RowCell)`
  height: 20px;
  display: flex;
  @media (max-width: 600px) {
    width: 200px;
  }
  @media (min-width: 601px) {
    flex-grow: 1;
    flex-basis: 200px;
    min-width: 200px;
  }
`;

const BarContainerFaded = styled(BarContainer)`
  opacity: 50%;
  filter: grayscale();
`;

const BarMask = styled.div`
  overflow: hidden;
  height: 20px;
`;

const Bar = styled.div`
  width: 150px;
  height: 20px;
  z-index: 0;
  display: flex;
  background-color: #F25D07;
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

type SortOptions = "name" | "geek-rating" | "player-rating" | "weight" | "player-count" | "playtime" | "grscore" | any;

type RankedScore = {
  score: number;
  rank: number;
}

type RankedScores = Record<number, RankedScore>;

function App() {
  const [allGames, setAllGames] = useState<CollectionGame[]>([]);
  const [usernamesString, setUsernamesString] = useState<string>("");
  const [usernames, setUsernames] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOptions>("grscore");
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [loadingGames, setLoadingGames] = useState<boolean>(false);
  const [showGeekRating, setShowGeekRating] = useState<boolean>(false);
  const [showPlayerRating, setShowPlayerRating] = useState<boolean>(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [includeOwned, setIncludeOwned] = useState<boolean>(true);
  const [includeWishlist, setIncludeWishlist] = useState<boolean>(false);
  const [showIndividualUserRatings, setShowIndividualUserRatings] = useState<boolean>(false);
  const [fallBackToGeekRating, setFallBackToGeekRating] = useState<boolean>(false);

  const getGrScore = (game: CollectionGame): number => {
    const playerCountStats = game.playerCountStats.filter(s => s.playerCount === playerCount);

    if (playerCountStats.length !== 1) {
      return 0;
    }

    const userRatings = usernames.map(username => gameUserRating(username, game, false)[0]);

    return playerCountStats[0].score * (userRatings.reduce((a, b) => a + b) / userRatings.length) / 10;
  }

  const getApiUrl = (url: string): string =>
    (process.env.NODE_ENV === "production" ? "https://api.geekranker.com" : "") + url;

  useEffect(() => {
  const getApiData = async () => {
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
    setUsernames(usernamesString.split(/[^a-zA-Z0-9_]/).filter(u => u.length));
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

  const innerBar = (value: number, maxValue: number, rank: number) =>
    <>
      <BarMask style={{ 'width': (value * (100 / maxValue)).toString() + 'px' }}>
        <Bar style={{ opacity: (value / maxValue) }} />
      </BarMask>
      <BarText>{value.toFixed(2)}{rank > 0 && <BarRank>#{rank}</BarRank>}</BarText>
    </>;

  const bar = (value: number, maxValue: number, rank: number) =>
    value === 0 ? <BarContainer /> :
      rank === 0 ?
        <Tooltip title={rank === 0 && "Not rated; Falling back to avg. player rating"}>
          <BarContainerFaded>
            {innerBar(value, maxValue, rank)}
          </BarContainerFaded>
        </Tooltip> :
        <BarContainer>
          {innerBar(value, maxValue, rank)}
        </BarContainer>;

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

    return [(hasUserRating && filteredPlayerRating[0].rating) || (fallBackToGeekRating ? game.geekRating : game.avgPlayerRating) - (unratedLast ? 10 : 0), hasUserRating];
  }

  const gamesSortedByUserRatings = (username: string): CollectionGame[] =>
    filteredGames.sort((a, b) => gameUserRating(username, b, true)[0] - gameUserRating(username, a, true)[0]);

  const getAvgUserRatings = (game: CollectionGame): number =>
    usernames.map(u => gameUserRating(u, game, false)[0]).reduce((a, b) => a + b) / usernames.length;

  const sortArrow = (thisSort: SortOptions) =>
    <ArrowDownward style={{ 'color': sort === thisSort ? '#fff' : '#0475BB', 'paddingLeft': 2 }} />;

  const barHeader = (thisSort: SortOptions, label: string) =>
    <BarHeader key={thisSort} onClick={() => setSort(thisSort)}>{label}{sortArrow(thisSort)}</BarHeader>;

  const playerCountBar = (count: number, game: CollectionGame) => {
    const filteredStats = game.playerCountStats.filter(s => s.playerCount === count);
    if (filteredStats.length === 1) {
      return bar(filteredStats[0].score, 10, filteredStats[0].rank);
    } else {
      return <BarContainer />;
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

  const filteredGames = allGames.filter(g => g.userStats.filter(us => (includeOwned && us.isOwned) || (includeWishlist && us.isWishlisted)).length > 0);

  const grScores = getScores(g => getGrScore(g));
  const avgUserRatings = getScores(g => getAvgUserRatings(g));

  const sortedGames =
    (sort === 'name') ? filteredGames.sort((a, b) => a.name.localeCompare(b.name)) :
      (sort === 'geek-rating') ? filteredGames.sort((a, b) => b.geekRating - a.geekRating) :
        (sort === 'player-rating') ? filteredGames.sort((a, b) => b.avgPlayerRating - a.avgPlayerRating) :
          (sort === 'weight') ? filteredGames.sort((a, b) => b.avgWeight - a.avgWeight) :
            (sort === 'player-count') ? gamesSortedByPlayerCount(playerCount) :
              (sort === 'playtime') ? filteredGames.sort((a, b) => b.maxPlayTime - a.maxPlayTime) :
                (sort === 'grscore') ? filteredGames.sort((a, b) => grScores[b.gameId].score - grScores[a.gameId].score) :
                  usernames.map(u => `user-${u}`).filter(s => s === sort).length === 1 ? gamesSortedByUserRatings(sort.substring(5)) :
                    filteredGames;

  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <MainBar>
          <Filters>
            <FiltersContainer>
              <PlayerFilter>
                <Input size='small' value={usernamesString} inputProps={{ autoCapitalize: "none" }} onKeyDown={e => usernameFilterKeyPress(e.keyCode)} onChange={e => setUsernamesString(e.target.value)} placeholder="BGG Username(s)" />
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
                  {toggle(fallBackToGeekRating, setFallBackToGeekRating, "Fall back to Geek Rating")}
                </FiltersInnerRow>
              </>
            }
          </Filters>
          <Logo src="/logo.png" alt="logo" />
        </MainBar>
        <HeaderContainer>
          <HeaderRow>
            <ImageAndNameHeader onClick={() => setSort("name")}>
              GAME{sortArrow("name")}
            </ImageAndNameHeader>
            <PlayTimeHeader onClick={() => setSort("playtime")}>
              <ArrowDownward style={{ opacity: 0 }} />TIME{sortArrow("playtime")}
            </PlayTimeHeader>
            {showPlayerRating && barHeader("player-rating", "PLAYER RATING")}
            {showGeekRating && barHeader("geek-rating", "GEEK RATING")}
            {barHeader("weight", "WEIGHT")}
            {barHeader("player-count", `${playerCount}-PLAYER`)}
            {showIndividualUserRatings || usernames.length < 2 ? usernames.map(u => barHeader(`user-${u}`, u.toUpperCase())) : barHeader(`users`, "Users")}
            {barHeader("grscore", "GR SCORE")}
          </HeaderRow>
        </HeaderContainer>
        {sortedGames.map(g => {
          // console.log(`g.name: ${g.name}, grScore?.score: ${grScore?.score}, grScore?.score ?? 0: ${grScore?.score ?? 0}`)

          return (
            <Row key={`game-${g.gameId}`}>
              <ImageAndName href={`https://www.boardgamegeek.com/boardgame/${g.gameId}`} target="_balnk">
                <ThumbnailContainer>
                  <Thumbnail src={g.imageUrl} />
                </ThumbnailContainer>
                <GameName>
                  {g.name}
                </GameName>
              </ImageAndName>

              <CellContainer>
                <CellLabel>
                  Play Time
                </CellLabel>
              <PlayTime>
                {g.minPlayTime}
                {g.minPlayTime !== g.maxPlayTime && (
                  <>  - {g.maxPlayTime}</>
                )}
              </PlayTime>
              </CellContainer>

              {showPlayerRating &&
                <CellContainer>
                  <CellLabel>
                    Player Rating
                  </CellLabel>
                  {bar(g.avgPlayerRating, 10, g.avgPlayerRatingRank)}
                </CellContainer>
              }

              {showGeekRating &&
                <CellContainer>
                  <CellLabel>
                    Geek Rating
                  </CellLabel>
                  {bar(g.geekRating, 10, g.geekRatingRank)}
                </CellContainer>
              }

              <CellContainer>
                <CellLabel>
                  Weight
                </CellLabel>
              {bar(g.avgWeight, 5, g.avgWeightRank)}
              </CellContainer>

              <CellContainer>
                <CellLabel>
                  {playerCount}-Player
                </CellLabel>
              {playerCountBar(playerCount, g)}
              </CellContainer>

              {showIndividualUserRatings || usernames.length < 2 ? usernames.map(u =>
                <CellContainer>
                  <CellLabel>
                    {u}
                  </CellLabel>
                  {userRatingBar(u, g)}
                </CellContainer>
              ) :
                <CellContainer>
                  <CellLabel>
                    User Rating
                  </CellLabel>
                  {userRatingBar("", g)}
                </CellContainer>
              }

              <GrScoreContainer>
                <CellLabel>
                  GR Score
                </CellLabel>
              {bar(grScores[g.gameId].score ?? 0, 10, grScores[g.gameId].rank ?? 0)}
              </GrScoreContainer>
            </Row>
          );
        })}
      </ThemeProvider>
    </>
  );
}

export default App;
