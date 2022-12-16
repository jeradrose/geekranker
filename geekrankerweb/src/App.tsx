import React, { useState } from 'react';
import { CollectionGame } from './models';
import "typeface-open-sans";
import { ArrowDownward, AddCircleOutline, RemoveCircleOutline, ExpandLessOutlined, ExpandMoreOutlined, ExpandMoreRounded, ExpandLess, ExpandMore } from '@mui/icons-material';
import { TextField, Button, Tooltip, Switch, FormControl, FormControlLabel } from '@mui/material';

import styled, { createGlobalStyle } from "styled-components"
import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';

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
`;

const FiltersInnerRow = styled.div`
  display: flex;
  align-items: center;
`

const FiltersContainer = styled(FiltersInnerRow)`
  margin: 10px 0;
`;

const FiltersHeader = styled(FiltersInnerRow)`
  font-weight: bold;
  margin-top: 10px;
`;

const PlayerFilter = styled.div`
  display: flex;
  max-width: 575px;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

// const Input = styled.input`
const Input = styled(TextField)`
  width: 400px;
  background-color: #fff;
`;

const FilterButton = styled(Button)`
  width: 160px;
`;

const Logo = styled.img`
  width: 400px;
  object-fit: contain;
  padding-bottom: 15px;
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
`;

const Row = styled(RowBase)`
  // background-color: #f4f4f4;
  background-color: #fcfcfc;
  margin: 2px 0;
  :hover {
    // background-color: #e0e0e0;
    background-color: #f4f4f4;
  }
  padding: 5px 15px;
`;

const ImageAndNameHeader = styled.a`
  align-self: center;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  flex: 1 0 225px;
  text-decoration: none;
  cursor: pointer;
`;

const ThumbnailContainer = styled.div`
  width: 30px;
  min-width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Thumbnail = styled.img`
  max-width: 30px;
  max-height: 30px;
`;

const RowCell = styled.div`
  align-self: center;
`;

/*
const Number = styled(RowCell)`
  width: 40px;
  min-width: 40px;
  text-align: center;
  padding-right: 15px;
`
*/

const ImageAndName = styled(ImageAndNameHeader)`
  flex: 1 0 225px;
  color: inherit;
  :hover {
    //color: #0475BB;
  }
`;

const GameName = styled(RowCell)`
  margin-left: 5px;
`;

const PlayTime = styled.div`
  display: flex;
  flex: 1 0 150px;
  align-items: center;
  justify-content: center;
`;

const PlayTimeHeader = styled(PlayTime)`
  cursor: pointer;
`

const BarHeader = styled(RowCell)`
  display: flex;
  align-items: center;
  justify-content: left;
  flex: 1 0 175px;
  cursor: pointer;
`;

const BarContainer = styled(RowCell)`
  height: 20px;
  display: flex;
  flex: 1 0 175px;
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

interface GrScore {
  gameId: number;
  score: number;
  rank: number;
}

function App() {
  const [games, setGames] = useState<CollectionGame[]>([]);
  const [usernames, setUsernames] = useState<string>("");
  const [sort, setSort] = useState<SortOptions>("name");
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [grScores, setGrScores] = useState<GrScore[]>([]);
  const [loadingGames, setLoadingGames] = useState<boolean>(false);
  const [showGeekRating, setShowGeekRating] = useState<boolean>(false);
  const [showPlayerRating, setShowPlayerRating] = useState<boolean>(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [includeWishlist, setIncludeWishlist] = useState<boolean>(false);


  useEnhancedEffect(() => resetGrScores(), [playerCount, games]);

  const getUsernames = () => usernames.split(/[^a-zA-Z0-9_]/).filter(u => u.length);

  const getGrScore = (game: CollectionGame): number => {
    const playerCountStats = game.playerCountStats.filter(s => s.playerCount === playerCount);

    if (playerCountStats.length !== 1) {
      return 0;
    }

    const userRatings = getUsernames().map(u => {
      const ratings = game.playerRatings.filter(r => r.username === u);
      return (ratings.length === 1 && ratings[0].rating) || game.avgPlayerRating;
    })

    // console.log(`game.name: ${game.name}, playerCountStats[0].score: ${playerCountStats[0].score}, userRatings.reduce((a, b) => a + b) / userRatings.length: ${userRatings.reduce((a, b) => a + b) / userRatings.length}`);

    return playerCountStats[0].score * (userRatings.reduce((a, b) => a + b) / userRatings.length) / 10;
  }

  const getApiData = async () => {
    setLoadingGames(true);
    try {
      const response = await fetch(
        "https://192.168.1.6:7032/BoardGame/GetRankings",
        {
          method: 'post',
          body: JSON.stringify(getUsernames()),
          headers: {
            'Content-type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const json = await response.json();
        setGames(json);
      }
    } catch (ex) {
      console.log(ex);
    } finally {
      setLoadingGames(false);
    }
  };

  const resetGrScores = () => {
    const grScores = games.map(g => {
      return {
        gameId: g.gameId,
        score: getGrScore(g),
        rank: 1,
      }
    });

    const sorted = grScores.sort((a, b) => b.score - a.score);
    grScores.map(s => s.rank = sorted.indexOf(s) + 1);

    setGrScores(grScores);
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
    return games.sort((a, b) => {
      const filteredA = a.playerCountStats.filter(g => g.playerCount === playerCount);
      const filteredB = b.playerCountStats.filter(g => g.playerCount === playerCount);

      const aValue = filteredA.length !== 1 ? 0 : filteredA[0].score;
      const bValue = filteredB.length !== 1 ? 0 : filteredB[0].score;

      return bValue - aValue;
    });
  };

  const gameUserRating = (username: string, game: CollectionGame): number => {
    const filteredPlayerRating = game.playerRatings.filter(r => r.username == username);

    return (filteredPlayerRating.length === 1 && filteredPlayerRating[0].rating) || game.avgPlayerRating - 10;
  }

  const gamesSortedByUserRatings = (username: string): CollectionGame[] => {
    console.log(username);
    return games.sort((a, b) => gameUserRating(username, b) - gameUserRating(username, a))
  }

  const sortedGames =
    (sort === 'name') ? games.sort((a, b) => a.name.localeCompare(b.name)) :
      (sort === 'geek-rating') ? games.sort((a, b) => b.geekRating - a.geekRating) :
        (sort === 'player-rating') ? games.sort((a, b) => b.avgPlayerRating - a.avgPlayerRating) :
          (sort === 'weight') ? games.sort((a, b) => b.avgWeight - a.avgWeight) :
            (sort === 'player-count') ? gamesSortedByPlayerCount(playerCount) :
              (sort === 'playtime') ? games.sort((a, b) => b.maxPlayTime - a.maxPlayTime) :
                (sort === 'grscore') ? games.sort((a, b) => grScores.filter(s => s.gameId === b.gameId)[0].score - grScores.filter(s => s.gameId === a.gameId)[0].score) :
                  getUsernames().map(u => `user-${u}`).filter(s => s === sort).length === 1 ? gamesSortedByUserRatings(sort.substring(5)) :
                    games;

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
    const ratings = game.playerRatings.filter(r => r.username === username);

    if (ratings.length === 1 && ratings[0].rating && ratings[0].rank) {
      return bar(ratings[0].rating, 10, ratings[0].rank)
    }

    return bar(game.avgPlayerRating, 10, 0);
  }

  const usernameFilterKeyPress = (keyCode: number) => {
    if (keyCode ===
      13) {
      getApiData();
    }
  }

  const toggle = (value: boolean, setter: (value: React.SetStateAction<boolean>) => void, label: string) =>
    <FormControlLabel
      style={{ userSelect: 'none', font: 'inherit' }}
      control={
        <Switch
          checked={value}
          onChange={() => setter(!value)} />
      }
      label={label} />


  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <MainBar>
          <Filters>
            <FiltersContainer>
              <PlayerFilter>
                <Input size='small' value={usernames} inputProps={{ autoCapitalize: "none" }} onKeyDown={e => usernameFilterKeyPress(e.keyCode)} onChange={e => setUsernames(e.target.value)} placeholder="BGG Username(s)" />
                <FilterButton size='small' variant='contained' onClick={() => getApiData()} disabled={loadingGames}>{loadingGames ? "Loading Games..." : "Load Games"}</FilterButton>
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
                </FiltersInnerRow>
                <FiltersHeader>
                  Filters
                </FiltersHeader>
                <FiltersInnerRow>
                  {toggle(includeWishlist, setIncludeWishlist, "Wishlisted Games")}
                </FiltersInnerRow>
              </>
            }
          </Filters>
          <Logo src="/Logo.png" alt="logo" />
        </MainBar>
        <HeaderContainer>
          <HeaderRow>
            <ImageAndNameHeader onClick={() => setSort("name")}>
              GAME{sortArrow("name")}
            </ImageAndNameHeader>
            <PlayTimeHeader onClick={() => setSort("playtime")}>
              <ArrowDownward style={{ opacity: 0 }} />PLAY TIME{sortArrow("playtime")}
            </PlayTimeHeader>
            {showPlayerRating && barHeader("player-rating", "PLAYER RATING")}
            {showGeekRating && barHeader("geek-rating", "GEEK RATING")}
            {barHeader("weight", "WEIGHT")}
            {barHeader("player-count", `${playerCount}-PLAYER`)}
            {getUsernames().map(u => barHeader(`user-${u}`, u.toUpperCase()))}
            {barHeader("grscore", "GR SCORE")}
          </HeaderRow>
        </HeaderContainer>
        {sortedGames.map(g => {
          const grScore = grScores.filter(s => s.gameId === g.gameId)[0];

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
              <PlayTime>
                {g.minPlayTime}
                {g.minPlayTime !== g.maxPlayTime && (
                  <>  - {g.maxPlayTime}</>
                )}
              </PlayTime>
              {showPlayerRating &&
                bar(g.avgPlayerRating, 10, g.avgPlayerRatingRank)
              }
              {showGeekRating &&
                bar(g.geekRating, 10, g.geekRatingRank)
              }
              {bar(g.avgWeight, 5, g.avgWeightRank)}
              {playerCountBar(playerCount, g)}
              {getUsernames().map(u => userRatingBar(u, g))}
              {bar(grScore?.score ?? 0, 10, grScore?.rank ?? 0)}
            </Row>
          );
        })}
      </ThemeProvider>
    </>
  );
}

export default App;
