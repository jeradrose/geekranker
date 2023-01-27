import { useEffect, useState, useRef } from 'react';
import styled, { createGlobalStyle } from "styled-components"

import "typeface-open-sans";

import { Clear } from '@mui/icons-material';
import { TextField, Button, IconButton, Tabs, Tab, FormControl, Select, MenuItem } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material';


import { CollectionGame } from './models';
import { getApiUrl, getStringQueryParam, getQueryParam, QueryParams, SelectedTab } from './Utilities';
import GameRanker from './GameRanker';

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

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  flex-grow: 1;
`;

const Input = styled(TextField)`
  box-sizing: border-box;
  width: 100%;
  background-color: #fff;
`;

const ClearIcon = styled(Clear)`
  padding-right: -120px;
`;

const FilterButton = styled(Button)`
  margin-top: 10px;
  width: 160px;
`;

const Logo = styled.img`
  max-width: 100%;
  width: 400px;
  object-fit: contain;
  padding: 5px 0;
`;

function App() {
  const usernamesRef = useRef<HTMLInputElement>(null);
  const gameIdsRef = useRef<HTMLInputElement>(null);
  const threadIdRef = useRef<HTMLInputElement>(null);
  const geekListIdRef = useRef<HTMLInputElement>(null);
  const renderCount = useRef<number>(0);

  const getUsernamesFromString = (usernamesString: string | undefined | null): string[] =>
    usernamesString?.split(/[^a-zA-Z0-9_]/).filter(u => u.length) ?? [];

  const getGameIdsFromString = (gameIdsString: string | undefined | null): number[] =>
    gameIdsString?.split(/[^0-9]/).filter(id => id.length).map(id => parseInt(id)) ?? [];

  const getIdFromString = (idString: string | undefined | null): number | undefined => {
    const parsedId = parseInt(idString?.split(/[^0-9]/).find(id => id.length) || "");
    return isNaN(parsedId) ? undefined : parsedId;
  }

  const [tab, setTab] = useState<SelectedTab>(getStringQueryParam(QueryParams.SelectedTab) as SelectedTab);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [loadingGames, setLoadingGames] = useState<boolean>(false);
  const [allGames, setAllGames] = useState<CollectionGame[]>([]);

  const [loadCount, setLoadCount] = useState<number>(0);

  // Standard options
  const [usernames, setUsernames] = useState<string[]>(getUsernamesFromString(getQueryParam(QueryParams.Usernames)));
  const [gameIds, setGameIds] = useState<number[]>(getGameIdsFromString(getQueryParam(QueryParams.GameIds)));
  const [threadId, setThreadId] = useState<number | undefined>(getIdFromString(getQueryParam(QueryParams.ThreadId)));
  const [geekListId, setGeekListId] = useState<number | undefined>(getIdFromString(getQueryParam(QueryParams.GeekListId)));

  const updateMedia = () => {
    setScreenWidth(document.documentElement.clientWidth || document.body.clientWidth);
  };

  const getApiData = async () => {
    if (!usernames.length && !gameIds.length && !threadId && !geekListId) {
      setAllGames([]);
      return;
    }

    setLoadingGames(true);

    try {
      const response = await fetch(
        getApiUrl("/BoardGame/GetRankings"),
        {
          method: 'post',
          body: JSON.stringify({ usernames, gameIds, threadId, geekListId }),
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

  useEffect(() => {
    getApiData();
  }, [loadCount]);

  useEffect(() => {
    if (gameIdsRef.current) {
      gameIdsRef.current.value = gameIds.join(' ');
    }
  }, [gameIds]);

  useEffect(() => {
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });

  const loadGames = () => {
    let blockReload = false;

    if (tab === 'game') {
      // Don't reload if the IDs on the Game ID tab didn't impact the already loaded games
      const loadedGameIds = allGames.map(g => g.gameId).sort();
      const selectedGameIds = getGameIdsFromString(gameIdsRef.current?.value).sort();

      blockReload =
        selectedGameIds.filter(id => loadedGameIds.indexOf(id) > -1).length ===
        loadedGameIds.filter(id => selectedGameIds.indexOf(id) > -1).length
    }

    usernamesRef.current && setUsernames(getUsernamesFromString(usernamesRef.current.value));
    gameIdsRef.current && setGameIds(getGameIdsFromString(gameIdsRef.current.value))
    threadIdRef.current && setThreadId(getIdFromString(threadIdRef.current.value));
    geekListIdRef.current && setGeekListId(getIdFromString(geekListIdRef.current.value));

    if (!blockReload) {
      setLoadCount(loadCount + 1);
    }
  };

  const inputKeyPress = (key: string) => {
    if (key === "Enter") {
      usernamesRef.current?.blur();
      loadGames();
    }
  }

  const handleClear = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      ref.current.value = "";
    }
    loadGames();
  }

  const input = (inputTab: SelectedTab, placeholder: string, queryParam: QueryParams, ref: React.RefObject<HTMLInputElement>) => {
    return (tab === inputTab || tab === 'advanced') && (
      <Input
        size='small'
        inputProps={{ autoCapitalize: "none" }}
        onKeyDown={e => inputKeyPress(e.key)}
        defaultValue={getQueryParam(queryParam) ?? ""}
        inputRef={ref}
        placeholder={placeholder}
        InputProps={{
          style: { paddingRight: 0 },
          endAdornment: (
            <IconButton disabled={!ref.current?.value} onClick={() => handleClear(ref)}>
              <ClearIcon />
            </IconButton>
          )
        }}
      />
    );
  }

  const showMobileTabs = screenWidth < 600;

  renderCount.current++;

  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <PageHeaderContainer style={{ width: screenWidth }}>
          <PageHeader>
            <InputContainer>
              {showMobileTabs ?
                <FormControl variant="standard">
                  <Select
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    value={tab}
                    onChange={e => setTab(e.target.value as SelectedTab)}
                    label="Search"
                  >
                    <MenuItem value="user">By Username</MenuItem>
                    <MenuItem value="game">By Game ID</MenuItem>
                    <MenuItem value="thread">By Thread</MenuItem>
                    <MenuItem value="geeklist">By GeekList ID</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
                :
                <Tabs value={tab} onChange={(_, value) => setTab(value)} scrollButtons="auto">
                  <Tab value="user" label="By Username" />
                  <Tab value="game" label="By Game ID" />
                  <Tab value="thread" label="By Thread" />
                  <Tab value="geeklist" label="By GeekList ID" />
                  <Tab value="advanced" label="Advanced" />
                </Tabs>
              }
              {input('user', "BGG Username(s)", QueryParams.Usernames, usernamesRef)}
              {input('game', "BGG Game ID(s)", QueryParams.GameIds, gameIdsRef)}
              {input('thread', "BGG Thread ID", QueryParams.ThreadId, threadIdRef)}
              {input('geeklist', "BGG GeekList ID", QueryParams.GeekListId, geekListIdRef)}
              <FilterButton size='small' variant='contained' onClick={() => loadGames()} disabled={loadingGames}>
                {loadingGames ? "Loading Games..." : "Load Games"}
              </FilterButton>
            </InputContainer>
            <Logo src="/logo.png" alt="logo" />
          </PageHeader>
        </PageHeaderContainer>
        <GameRanker tab={tab} usernames={usernames} gameIds={gameIds} threadId={threadId} geekListId={geekListId} setGameIds={setGameIds} allGames={allGames} screenWidth={screenWidth} />
      </ThemeProvider>
    </>
  );
}

export default App;
