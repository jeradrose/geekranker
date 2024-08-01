import xml2js from "xml2js";
import { BggCollection, BggCollectionResult } from "./BggApiCollection";
import { BggGame, BggGamesResult } from "./BggApiGames";
import { BggGeekList, BggGeekListResult } from "./BggApiGeekList";
import { BggThread, BggThreadResult } from "./BggApiThread";
import { ApiState } from "./Utilities";

export const getBggGames = async (gameIds: number[], apiState: ApiState, setApiState: (value: ApiState) => void): Promise<BggGame[]> => {
  const url = `https://boardgamegeek.com/xmlapi2/thing?id=${gameIds.join(',')}&stats=1`;

  const response = await fetchFromBgg<BggGamesResult>(url, apiState, setApiState);

  if (!response.items.item || !response.items.item.length) {
    setApiState({ isNotFound: true });
  }

  return response.items.item;
}

export const getBggCollection = async (username: string, apiState: ApiState, setApiState: (value: ApiState) => void): Promise<BggCollection> => {
  const url = `https://boardgamegeek.com/xmlapi2/collection?username=${username}&stats=1`;

  const response = await fetchFromBgg<BggCollectionResult>(url, apiState, setApiState);

  if (!response.items.item || !response.items.item.length) {
    setApiState({ isNotFound: true });
  }

  return response.items;
}

export const getBggThread = async (threadId: number, apiState: ApiState, setApiState: (value: ApiState) => void): Promise<BggThread> => {
  const url = `https://boardgamegeek.com/xmlapi2/thread?id=${threadId}`;

  return (await fetchFromBgg<BggThreadResult>(url, apiState, setApiState)).thread;
}

export const getBggGeekList = async (geekListId: number, apiState: ApiState, setApiState: (value: ApiState) => void): Promise<BggGeekList> => {
  const url = `https://boardgamegeek.com/xmlapi/geeklist/${geekListId}`;

  return (await fetchFromBgg<BggGeekListResult>(url, apiState, setApiState)).geeklist;
}

const fetchFromBgg = async <T>(url: string, apiState: ApiState, setApiState: (value: ApiState) => void): Promise<T> => {
  const response = await fetch(url);

  if (response.ok) {
    const responseText = await response.text();

    if (responseText.toLowerCase().indexOf("error message") >= 0 && responseText.toLowerCase().indexOf("not found")) {
      setApiState({
        ...apiState,
        isNotFound: true,
      });
    }

    const a = 1;

    if (a === 1) {
      // if (responseText.indexOf("Please try again later for access.") >= 0) {
      setApiState({
        ...apiState,
        isRequestPending: true,
      });
      throw new Error("retrying");
    }
    const parser = new xml2js.Parser();
    return await parser.parseStringPromise(responseText);
  }
  throw new Error(response.statusText);
}
