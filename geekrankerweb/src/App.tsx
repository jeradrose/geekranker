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
  const renderCount = useRef<number>(0);

  const getUsernamesFromString = (usernamesString: string | undefined | null): string[] =>
    usernamesString?.split(/[^a-zA-Z0-9_]/).filter(u => u.length) ?? [];

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [loadingGames, setLoadingGames] = useState<boolean>(false);
  const [allGames, setAllGames] = useState<CollectionGame[]>([]);

  // Standard options
  const [usernames, setUsernames] = useState<string[]>(getUsernamesFromString(queryParams.get(QueryParams.Usernames)));

  const updateMedia = () => {
    setScreenWidth(document.documentElement.clientWidth || document.body.clientWidth);
  };

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

  useEffect(() => {
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });

  const lockInUsernames = () => {
    const newUsernames = getUsernamesFromString(usernamesRef.current?.value);

    if (newUsernames.length === 0) {
      // setAllGames([]);
    }
    setUsernames(newUsernames);
  };

  const usernameFilterKeyPress = (key: string) => {
    if (key === "Enter") {
      usernamesRef.current?.blur();
      lockInUsernames();
    }
  }

  const handleUsernamesClear = () => {
    if (usernamesRef.current) {
      usernamesRef.current.value = "";
    }
    lockInUsernames();
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
                onKeyDown={e => usernameFilterKeyPress(e.key)}
                defaultValue={queryParams.get(QueryParams.Usernames) ?? ""}
                inputRef={usernamesRef}
                placeholder="BGG Username(s)"
                InputProps={{
                  style: { paddingRight: 0 },
                  endAdornment: (
                    <IconButton disabled={!usernamesRef.current?.value} onClick={() => handleUsernamesClear()}>
                      <ClearIcon />
                    </IconButton>
                  )
                }}
              />
              <FilterButton size='small' variant='contained' onClick={() => lockInUsernames()} disabled={loadingGames}>
                {loadingGames ? "Loading Games..." : "Load Games"}
              </FilterButton>
            </InputContainer>
            <Logo src="/logo.png" alt="logo" />
          </PageHeader>
        </PageHeaderContainer>
        <GameRanker usernames={usernames} allGames={allGames} screenWidth={screenWidth} />
      </ThemeProvider>
    </>
  );
}

export default App;
