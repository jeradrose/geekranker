import React, { useRef } from 'react';
import { Game } from './models';
import "typeface-open-sans";
import { ArrowDownward } from '@mui/icons-material';
import { Tooltip, Switch, FormControlLabel, Pagination, Select, MenuItem } from '@mui/material';

import styled from "styled-components"
import { getSortLabel, DisplayMode, SortOptions, getGameUserRating, getBggGameUrl, getGamePlayerCountStats, getShowCondensedFooter } from './Utilities';

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
  align-items: center;
  height: 40px;
  box-sizing: border-box;
`;

const HeaderRow = styled(RowBase)`
  background-color: #348CE9;
  font-weight: bold;
  color: #fff;
  padding: 0 15px;
`;

const FooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: #eee;
  z-index: 20;
  height: 40px;
  gap: 40px;
  box-sizing: border-box;
  padding: 0 10px;
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
  display: flex;
  align-items: center;
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
  flex-grow: 1;
  flex-basis: 200px;
  min-width: 200px;
  white-space: nowrap;
`;

const BarHeaderSort = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
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

interface GameRankerProps {
  usernames: string[],
  gameIds: number[],
  setGameIds: (gameId: number[]) => void,
  games: Game[],
  scoreIdealTime: boolean,
  setScoreIdealTime: (value: boolean) => void,
  idealTime: number,
  scoreIdealWeight: boolean,
  setScoreIdealWeight: (value: boolean) => void,
  idealWeight: number,
  scoreIdealYear: boolean,
  setScoreIdealYear: (value: boolean) => void,
  scorePlayerCount: boolean,
  setScorePlayerCount: (value: boolean) => void,
  playerCountArray: number[],
  scoreUserRating: boolean,
  setScoreUserRating: (value: boolean) => void,
  scorePlayerRating: boolean,
  setScorePlayerRating: (value: boolean) => void,
  scoreGeekRating: boolean,
  setScoreGeekRating: (value: boolean) => void,
  sort: string,
  setSort: (value: string) => void,
  showGameId: boolean,
  showThreadSequence: boolean,
  showGeekListSequence: boolean,
  showGrIndex: boolean,
  showUserRating: boolean,
  showPlayerRating: boolean,
  showGeekRating: boolean,
  showPlayerCount: boolean,
  showWeight: boolean,
  showTime: boolean,
  showYear: boolean,
  showIndividualUserRatings: boolean,
  displayMode: DisplayMode,
  screenWidth: number,
  gamesPerPage: number,
  setGamesPerPage: (value: number) => void,
  page: number,
  setPage: (value: number) => void,
}

function GameRanker({
  usernames,
  gameIds,
  setGameIds,
  games,
  scoreIdealTime,
  setScoreIdealTime,
  idealTime,
  scoreIdealWeight,
  setScoreIdealWeight,
  idealWeight,
  scorePlayerCount,
  scoreIdealYear,
  setScoreIdealYear,
  setScorePlayerCount,
  playerCountArray,
  scoreUserRating,
  setScoreUserRating,
  scorePlayerRating,
  setScorePlayerRating,
  scoreGeekRating,
  setScoreGeekRating,
  sort,
  setSort,
  showGameId,
  showThreadSequence,
  showGeekListSequence,
  showGrIndex,
  showUserRating,
  showPlayerRating,
  showGeekRating,
  showPlayerCount,
  showWeight,
  showTime,
  showYear,
  showIndividualUserRatings,
  displayMode,
  screenWidth,
  gamesPerPage,
  setGamesPerPage,
  page,
  setPage,
}: GameRankerProps) {
  const renderCount = useRef<number>(0);

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
    displayMode === "horizontal" ?
      <BarContainerHorizontal>
        {innerTimeBar(min, max, scoreIdealTime && idealTime)}
      </BarContainerHorizontal> :
      <BarContainerVertical>
        {innerTimeBar(min, max, scoreIdealTime && idealTime)}
      </BarContainerVertical>

  const sortArrow = (thisSort: string) =>
    <ArrowDownward key={`arrow-${thisSort}`} style={{ 'color': sort === thisSort ? '#fff' : '#0475BB', 'paddingLeft': 2 }} />;

  const barHeader = (thisSort: SortOptions) => barHeaderDynamic(thisSort);

  const meeple = (isScored: boolean, setScore?: () => void) =>
    <Tooltip title={setScore && `${isScored ? "Included in" : "Excluded from"} the GR Index`}>
      <img
        src={`/gr-meeple${isScored ? "" : "-inactive"}.png`}
        style={{
          height: 16,
          paddingRight: 5,
          cursor: setScore ? "pointer" : undefined,
        }}
        onClick={setScore && (() => setScore())}
      />
    </Tooltip>

  const barHeaderDynamic = (thisSort: string, label?: string) =>
    <BarHeader key={`header-${thisSort}`}>
      <BarHeaderSort onClick={() => setSort(thisSort)}>
        {thisSort === 'gr-index' && meeple(true)}
        {(label || getSortLabel(thisSort as SortOptions))}{sortArrow(thisSort)}
      </BarHeaderSort>
      {thisSort.startsWith('playercount-') && meeple(scorePlayerCount, () => setScorePlayerCount(!scorePlayerCount))}
      {thisSort === 'time' && meeple(scoreIdealTime, () => setScoreIdealTime(!scoreIdealTime))}
      {thisSort === 'weight' && meeple(scoreIdealWeight, () => setScoreIdealWeight(!scoreIdealWeight))}
      {thisSort === 'year' && meeple(scoreIdealYear, () => setScoreIdealYear(!scoreIdealYear))}
      {thisSort.startsWith('user-') && meeple(scoreUserRating, () => setScoreUserRating(!scoreUserRating))}
      {thisSort === 'geek-rating' && meeple(scoreGeekRating, () => setScoreGeekRating(!scoreGeekRating))}
      {thisSort === 'player-rating' && meeple(scorePlayerRating, () => setScorePlayerRating(!scorePlayerRating))}
    </BarHeader>;

  const playerCountBar = (count: number, game: Game) => {
    const pcStats = getGamePlayerCountStats(count, game);
    if (pcStats) {
      return bar(pcStats.score, 10, pcStats.rank);
    } else {
      return displayMode === "horizontal" ? <BarContainerHorizontal /> : <BarContainerVertical />;
    }
  }

  const userRatingBar = (username: string, game: Game) => {
    if (!username) {
      return bar(game.avgUserRating || 0, 10, game.avgUserRatingRank);
    }

    const rating = getGameUserRating(username, game);
    const ratings = game.userStats.filter(r => r.username === username);

    return bar(rating || 0, 10, rating ? ratings[0].rank ?? 0 : 0);
  }

  const toggleGameId = (gameId: number) => {
    const isSelected = gameIds.filter(id => id === gameId).length > 0;
    return (
      <FormControlLabel
        style={{ userSelect: 'none', font: 'inherit' }}
        control={
          <Switch
            checked={isSelected}
            onChange={() => isSelected ? setGameIds(gameIds.filter(id => id !== gameId)) : setGameIds(gameIds.concat([gameId]))} />
        }
        label={gameId} />
    );
  }

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

  renderCount.current++;

  const startGame = ((page - 1) * gamesPerPage) + 1;
  const endGame = Math.min(page * gamesPerPage, games.length);

  return (
    <>
      {displayMode === "horizontal" &&
        <GamesHeader>
          <HeaderRow style={{ minWidth: screenWidth }}>
            {games.length > 0 &&
              <>
                <ImageAndNameHeader onClick={() => setSort("game")}>
                  Game{sortArrow("game")}
                </ImageAndNameHeader>
                {showGameId && barHeader("id")}
                {showThreadSequence && barHeader("thread")}
                {showGeekListSequence && barHeader("geek-list")}
                {showGrIndex && <Tooltip title="The score of all columns with orange meeples">{barHeader("gr-index")}</Tooltip>}
                {showUserRating && (showIndividualUserRatings || usernames.length < 2 ? usernames.map(u => barHeaderDynamic(`user-${u}`, u.toUpperCase())) : barHeader(`user-rating`))}
                {showPlayerRating && barHeader("player-rating")}
                {showGeekRating && barHeader("geek-rating")}
                {showPlayerCount && playerCountArray.map(pc => barHeaderDynamic(`playercount-${pc}`, `${pc}-Player`))}
                {showWeight && barHeader("weight")}
                {showTime && barHeader("time")}
                {showYear && barHeader("year")}
              </>
            }
          </HeaderRow>
        </GamesHeader>
      }
      {games.slice(startGame - 1, endGame).map(g =>
        displayMode === "horizontal" ?
          <GameHorizontally key={`game-horizontal-${g.gameId}`} style={{ minWidth: screenWidth }}>
            <ImageAndNameHorizontal href={getBggGameUrl(g.gameId)} target="_balnk">
              <ThumbnailContainer>
                <Thumbnail src={g.imageUrl} />
              </ThumbnailContainer>
              <GameName>{g.name}</GameName>
            </ImageAndNameHorizontal>

            {showGameId && <HorizontalCell>{toggleGameId(g.gameId)}</HorizontalCell>}
            {showThreadSequence && <HorizontalCell>{g.threadSequence ? g.threadSequence : ""}</HorizontalCell>}
            {showGeekListSequence && <HorizontalCell>{g.geekListSequence ? g.geekListSequence : ""
            }</HorizontalCell>}
            {showGrIndex && <HorizontalCell>{bar(g.grIndex ?? 0, 10, g.grIndexRank ?? 0)}</HorizontalCell>}
            {showUserRating && (showIndividualUserRatings || usernames.length < 2 ?
              usernames.map(u => <HorizontalCell key={`userRating-${g.gameId}-${u}`}>{userRatingBar(u, g)}</HorizontalCell>) :
              <HorizontalCell>{userRatingBar("", g)}</HorizontalCell>
            )}
            {showPlayerRating && <HorizontalCell>{bar(g.avgPlayerRating, 10, g.avgPlayerRatingRank)}</HorizontalCell>}
            {showGeekRating && <HorizontalCell>{bar(g.geekRating, 10, g.geekRatingRank)}</HorizontalCell>}
            {showPlayerCount && playerCountArray.map(pc => <HorizontalCell key={`h-pc-${pc}`}>{playerCountBar(pc, g)}</HorizontalCell>)}
            {showWeight && <HorizontalCell>{bar(g.avgWeight, 5, g.avgWeightRank, scoreIdealWeight && idealWeight)}</HorizontalCell>}
            {showTime && <HorizontalCell>{timeBar(g.minPlayTime, g.maxPlayTime)}</HorizontalCell>}
            {showYear && <HorizontalCell>{g.yearPublished}</HorizontalCell>}
          </GameHorizontally> :
          <GameVertically key={`game-vertical-${g.gameId}`} style={{ width: screenWidth }}>
            <ImageAndNameVertical href={getBggGameUrl(g.gameId)} target="_balnk">
              <ThumbnailContainer>
                <Thumbnail src={g.imageUrl} />
              </ThumbnailContainer>
              <GameName>{g.name}</GameName>
            </ImageAndNameVertical>
            {showGameId && verticalCell(getSortLabel("game"), toggleGameId(g.gameId))}
            {showThreadSequence && showThreadSequence && verticalCell(getSortLabel("thread"), g.threadSequence)}
            {showGeekListSequence && showGeekListSequence && verticalCell(getSortLabel("geek-list"), g.geekListSequence)}
            {showGrIndex && verticalCell(getSortLabel("gr-index"), bar(g.grIndex ?? 0, 10, g.grIndexRank ?? 0))}
            {showUserRating && showUserRating && (showIndividualUserRatings || usernames.length < 2 ?
              usernames.map(u => verticalCell(u, userRatingBar(u, g), g.gameId)) :
              verticalCell(getSortLabel("user-rating"), userRatingBar("", g))
            )}
            {showPlayerRating && verticalCell(getSortLabel("player-rating"), bar(g.avgPlayerRating, 10, g.avgPlayerRatingRank))}
            {showGeekRating && verticalCell(getSortLabel("geek-rating"), bar(g.geekRating, 10, g.geekRatingRank))}
            {showPlayerCount && playerCountArray.map(pc => verticalCell(`${pc}-Player Rating`, playerCountBar(pc, g), pc))}
            {showWeight && verticalCell(getSortLabel("weight"), bar(g.avgWeight, 5, g.avgWeightRank, scoreIdealWeight && idealWeight))}
            {showTime && verticalCell(getSortLabel("time"), timeBar(g.minPlayTime, g.maxPlayTime))}
            {showYear && verticalCell(getSortLabel("year"), g.yearPublished)}
          </GameVertically>
      )}
      <FooterRow style={{ width: screenWidth, fontSize: 13 }}>
        <div style={{ width: !getShowCondensedFooter(screenWidth) ? 200 : undefined, textAlign: "left" }}>
          {!games.length ?
            <>No games</> :
            !getShowCondensedFooter(screenWidth) ?
              <>{startGame} - {endGame} (of {games.length})</>
              :
              <>{games.length} games</>
          }
        </div>
        {games.length > 0 &&
          <Pagination
            count={Math.trunc(games.length / gamesPerPage) + 1}
            color="primary"
            page={page}
            onChange={(_, value) => setPage(value)}
            size="small"
          />
        }
        {!getShowCondensedFooter(screenWidth) &&
          <div style={{ width: 200, textAlign: "right" }}>
            <Select
              variant='standard'
              value={gamesPerPage.toString()}
              onChange={event => setGamesPerPage(parseInt(event.target.value))}
              size="small"
              sx={{ mr: 1 }}
            >
              {["25", "50", "100", "200", "500", "1000"].map(x => <MenuItem key={`games-per-page-select-${x}`} value={x}>{x}</MenuItem>)}
            </Select>
            per page
          </div>
        }
      </FooterRow>
    </>
  );
}

export default GameRanker;
