import React, { useState, useRef } from 'react';
import { Game } from './models';
import "typeface-open-sans";
import { ArrowDownward } from '@mui/icons-material';
import { Tooltip, Switch, FormControlLabel } from '@mui/material';

import styled from "styled-components"
import { SelectedTab, getSortLabel, DisplayMode, FallBackTo, SortOptions, getGameUserRating } from './Utilities';

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

interface GameRankerProps {
  tab: SelectedTab,
  usernames: string[],
  gameIds: number[],
  setGameIds: (gameId: number[]) => void,
  games: Game[],
  fallBackTo: FallBackTo,
  includeIdealTime: boolean,
  idealTime: number,
  includeIdealWeight: boolean,
  idealWeight: number,
  playerCountRange: number[],
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
  showIndividualUserRatings: boolean,
  displayMode: DisplayMode,
  screenWidth: number,
}

function GameRanker({
  tab,
  usernames,
  gameIds,
  setGameIds,
  games,
  fallBackTo,
  includeIdealTime,
  idealTime,
  includeIdealWeight,
  idealWeight,
  playerCountRange,
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
  showIndividualUserRatings,
  displayMode,
  screenWidth,
}: GameRankerProps) {
  const renderCount = useRef<number>(0);
  const [showTips, setShowTips] = useState<boolean>(false);

  const playerCountArray = Array.from({ length: playerCountRange[1] - playerCountRange[0] + 1 }, (v, k) => k + playerCountRange[0]);

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
        <Tooltip title={rank === 0 && `Not rated; Falling back to ${fallBackTo === 'player-rating' ? "avg. player rating" : "Geek rating"}`}>
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
    displayMode === "horizontal" ?
      <BarContainerHorizontal>
        {innerTimeBar(min, max, includeIdealTime && idealTime)}
      </BarContainerHorizontal> :
      <BarContainerVertical>
        {innerTimeBar(min, max, includeIdealTime && idealTime)}
      </BarContainerVertical>

  const sortArrow = (thisSort: string) =>
    <ArrowDownward key={`arrow-${thisSort}`} style={{ 'color': sort === thisSort ? '#fff' : '#0475BB', 'paddingLeft': 2 }} />;

  const barHeader = (thisSort: SortOptions) => barHeaderDynamic(thisSort);

  const barHeaderDynamic = (thisSort: string, label?: string) =>
    <BarHeader key={`header-${thisSort}`} onClick={() => setSort(thisSort)}>{(label || getSortLabel(thisSort as SortOptions))}{sortArrow(thisSort)}</BarHeader>;

  const playerCountBar = (count: number, game: Game) => {
    const filteredStats = game.playerCountStats.filter(s => s.playerCount === count);

    if (filteredStats.length === 1) {
      return bar(filteredStats[0].score, 10, filteredStats[0].rank);
    } else {
      return displayMode === "horizontal" ? <BarContainerHorizontal /> : <BarContainerVertical />;
    }
  }

  const userRatingBar = (username: string, game: Game) => {
    if (!username) {
      return bar(game.avgUserRating, 10, game.avgUserRatingRank);
    }

    const [rating, hasUserRating] = getGameUserRating(username, game, fallBackTo, false);
    const ratings = game.userStats.filter(r => r.username === username);

    return bar(rating, 10, hasUserRating ? ratings[0].rank ?? 0 : 0);
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

  const getShowGameId = () => (tab === 'advanced' && showGameId);
  const getShowThreadSequence = () => ((tab === 'advanced' && showThreadSequence) || tab === 'thread');
  const getShowGeekListSequence = () => ((tab === 'advanced' && showGeekListSequence) || tab === 'geeklist');
  const getShowGrIndex = () => (tab !== 'advanced' || showGrIndex);
  const getShowUserRating = () => ((tab === 'advanced' && showUserRating) || tab === 'user');
  const getShowPlayerRating = () => ((tab === 'advanced' && showPlayerRating) || tab !== 'user');
  const getShowGeekRating = () => (tab === 'advanced' && showGeekRating);

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
                {getShowGameId() && barHeader("id")}
                {getShowThreadSequence() && barHeader("thread")}
                {getShowGeekListSequence() && barHeader("geek-list")}
                {getShowGrIndex() && barHeader("gr-index")}
                {getShowUserRating() && (showIndividualUserRatings || usernames.length < 2 ? usernames.map(u => barHeaderDynamic(`user-${u}`, u.toUpperCase())) : barHeader(`user-rating`))}
                {getShowPlayerRating() && barHeader("player-rating")}
                {getShowGeekRating() && barHeader("geek-rating")}
                {showPlayerCount && playerCountArray.map(pc => barHeaderDynamic(`playercount-${pc}`, `${pc}-Player`))}
                {showWeight && barHeader("weight")}
                {showTime && barHeader("time")}
              </>
            }
          </HeaderRow>
        </GamesHeader>
      }
      {games.length === 0 &&
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
      {games.map(g => {
        return (
          displayMode === "horizontal" ?
            <GameHorizontally key={`game-horizontal-${g.gameId}`} style={{ minWidth: screenWidth }}>
              <ImageAndNameHorizontal href={`https://www.boardgamegeek.com/boardgame/${g.gameId}`} target="_balnk">
                <ThumbnailContainer>
                  <Thumbnail src={g.imageUrl} />
                </ThumbnailContainer>
                <GameName>{g.name}</GameName>
              </ImageAndNameHorizontal>

              {getShowGameId() && <HorizontalCell>{toggleGameId(g.gameId)}</HorizontalCell>}
              {getShowThreadSequence() && <HorizontalCell>{g.threadSequence ? g.threadSequence : ""}</HorizontalCell>}
              {getShowGeekListSequence() && <HorizontalCell>{g.geekListSequence ? g.geekListSequence : ""
              }</HorizontalCell>}
              {getShowGrIndex() && <HorizontalCell>{bar(g.grIndex ?? 0, 10, g.grIndexRank ?? 0)}</HorizontalCell>}
              {getShowUserRating() && (showIndividualUserRatings || usernames.length < 2 ?
                usernames.map(u => <HorizontalCell key={`userRating-${g.gameId}-${u}`}>{userRatingBar(u, g)}</HorizontalCell>) :
                <HorizontalCell>{userRatingBar("", g)}</HorizontalCell>
              )}
              {getShowPlayerRating() && <HorizontalCell>{bar(g.avgPlayerRating, 10, g.avgPlayerRatingRank)}</HorizontalCell>}
              {getShowGeekRating() && <HorizontalCell>{bar(g.geekRating, 10, g.geekRatingRank)}</HorizontalCell>}
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
              {getShowGameId() && verticalCell(getSortLabel("game"), toggleGameId(g.gameId))}
              {getShowThreadSequence() && showThreadSequence && verticalCell(getSortLabel("thread"), g.threadSequence)}
              {getShowGeekListSequence() && showGeekListSequence && verticalCell(getSortLabel("geek-list"), g.geekListSequence)}
              {getShowGrIndex() && verticalCell(getSortLabel("gr-index"), bar(g.grIndex ?? 0, 10, g.grIndexRank ?? 0))}
              {getShowUserRating() && showUserRating && (showIndividualUserRatings || usernames.length < 2 ?
                usernames.map(u => verticalCell(u, userRatingBar(u, g), g.gameId)) :
                verticalCell(getSortLabel("user-rating"), userRatingBar("", g))
              )}
              {getShowPlayerRating() && verticalCell(getSortLabel("player-rating"), bar(g.avgPlayerRating, 10, g.avgPlayerRatingRank))}
              {getShowGeekRating() && verticalCell(getSortLabel("geek-rating"), bar(g.geekRating, 10, g.geekRatingRank))}
              {showPlayerCount && playerCountArray.map(pc => verticalCell(`${pc}-Player Rating`, playerCountBar(pc, g), pc))}
              {showWeight && verticalCell(getSortLabel("weight"), bar(g.avgWeight, 5, g.avgWeightRank, includeIdealWeight && idealWeight))}
              {showTime && verticalCell(getSortLabel("time"), timeBar(g.minPlayTime, g.maxPlayTime))}
            </GameVertically>
        );
      })}
    </>
  );
}

export default GameRanker;
