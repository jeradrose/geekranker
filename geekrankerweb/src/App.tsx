import { useEffect, useState, useRef } from 'react';
import styled, { createGlobalStyle } from "styled-components"

import "typeface-open-sans";

import { Clear } from '@mui/icons-material';
import { TextField, Button, IconButton } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material';


import { CollectionGame } from './models';
import { getApiUrl, queryParams, QueryParams } from './Utilities';
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

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [loadingGames, setLoadingGames] = useState<boolean>(false);
  const [allGames, setAllGames] = useState<CollectionGame[]>([]);

  // Standard options
  const [usernames, setUsernames] = useState<string[]>(getUsernamesFromString(queryParams.get(QueryParams.Usernames)));
  const [gameIds, setGameIds] = useState<number[]>(getGameIdsFromString(queryParams.get(QueryParams.GameIds)));
  const [threadId, setThreadId] = useState<number | undefined>(getIdFromString(queryParams.get(QueryParams.ThreadId)));
  const [geekListId, setGeekListId] = useState<number | undefined>(getIdFromString(queryParams.get(QueryParams.GeekListId)));

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
  }, [usernames, threadId]);

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
    setUsernames(getUsernamesFromString(usernamesRef.current?.value));
    setGameIds(getGameIdsFromString(gameIdsRef.current?.value))
    setThreadId(getIdFromString(threadIdRef.current?.value ?? ""));
    setGeekListId(getIdFromString(geekListIdRef.current?.value ?? ""));
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

  renderCount.current++;

  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <PageHeaderContainer style={{ width: screenWidth }}>
          <PageHeader>
            <InputContainer>
              <Input
                size='small'
                inputProps={{ autoCapitalize: "none" }}
                onKeyDown={e => inputKeyPress(e.key)}
                defaultValue={queryParams.get(QueryParams.Usernames) ?? ""}
                inputRef={usernamesRef}
                placeholder="BGG Username(s)"
                InputProps={{
                  style: { paddingRight: 0 },
                  endAdornment: (
                    <IconButton disabled={!usernamesRef.current?.value} onClick={() => handleClear(usernamesRef)}>
                      <ClearIcon />
                    </IconButton>
                  )
                }}
              />
              <Input
                size='small'
                inputProps={{ autoCapitalize: "none" }}
                onKeyDown={e => inputKeyPress(e.key)}
                defaultValue={queryParams.get(QueryParams.GameIds) ?? ""}
                inputRef={gameIdsRef}
                placeholder="BGG Game ID(s)"
                InputProps={{
                  style: { paddingRight: 0 },
                  endAdornment: (
                    <IconButton disabled={!gameIdsRef.current?.value} onClick={() => handleClear(gameIdsRef)}>
                      <ClearIcon />
                    </IconButton>
                  )
                }}
              />
              <Input
                size='small'
                inputProps={{ autoCapitalize: "none" }}
                onKeyDown={e => inputKeyPress(e.key)}
                defaultValue={queryParams.get(QueryParams.ThreadId) ?? ""}
                inputRef={threadIdRef}
                placeholder="BGG Thread ID"
                InputProps={{
                  style: { paddingRight: 0 },
                  endAdornment: (
                    <IconButton disabled={!threadIdRef.current?.value} onClick={() => handleClear(threadIdRef)}>
                      <ClearIcon />
                    </IconButton>
                  )
                }}
              />
              <Input
                size='small'
                inputProps={{ autoCapitalize: "none" }}
                onKeyDown={e => inputKeyPress(e.key)}
                defaultValue={queryParams.get(QueryParams.GeekListId) ?? ""}
                inputRef={geekListIdRef}
                placeholder="BGG GeekList ID"
                InputProps={{
                  style: { paddingRight: 0 },
                  endAdornment: (
                    <IconButton disabled={!geekListIdRef.current?.value} onClick={() => handleClear(geekListIdRef)}>
                      <ClearIcon />
                    </IconButton>
                  )
                }}
              />
              <FilterButton size='small' variant='contained' onClick={() => loadGames()} disabled={loadingGames}>
                {loadingGames ? "Loading Games..." : "Load Games"}
              </FilterButton>
            </InputContainer>
            <Logo src="/logo.png" alt="logo" />
          </PageHeader>
        </PageHeaderContainer>
        <GameRanker usernames={usernames} gameIds={gameIds} threadId={threadId} geekListId={geekListId} setGameIds={setGameIds} allGames={allGames} screenWidth={screenWidth} />
      </ThemeProvider>
    </>
  );
}

export default App;
