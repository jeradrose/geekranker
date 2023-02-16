import xml2js from "xml2js";
import { BggCollection, BggCollectionResult } from "./BggApiCollection";
import { BggGame, BggGamesResult } from "./BggApiGames";
import { BggGeekList, BggGeekListResult } from "./BggApiGeekList";
import { BggThread, BggThreadResult } from "./BggApiThread";

export const getBggGames = async (gameIds: number[], setShowSlowNotice: (value: boolean) => void): Promise<BggGame[]> => {
  const url = `https://boardgamegeek.com/xmlapi2/thing?id=${gameIds.join(',')}&stats=1`;

  return (await fetchFromBgg<BggGamesResult>(url, setShowSlowNotice)).items.item;
}

export const getBggCollection = async (username: string, setShowSlowNotice: (value: boolean) => void): Promise<BggCollection> => {
  const url = `https://boardgamegeek.com/xmlapi2/collection?username=${username}&stats=1`;

  return (await fetchFromBgg<BggCollectionResult>(url, setShowSlowNotice)).items;
}

export const getBggThread = async (threadId: number, setShowSlowNotice: (value: boolean) => void): Promise<BggThread> => {
  const url = `https://boardgamegeek.com/xmlapi2/thread?id=${threadId}`;

  return (await fetchFromBgg<BggThreadResult>(url, setShowSlowNotice)).thread;
}

export const getBggGeekList = async (geekListId: number, setShowSlowNotice: (value: boolean) => void): Promise<BggGeekList> => {
  const url = `https://boardgamegeek.com/xmlapi/geeklist/${geekListId}`;

  return (await fetchFromBgg<BggGeekListResult>(url, setShowSlowNotice)).geeklist;
}

const delay = (t: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, t));

const fetchFromBgg = async <T>(url: string, setShowSlowNotice: (value: boolean) => void, tries = 1): Promise<T> => {
  const maxRetries = 10;
  if (tries >= maxRetries) {
    throw new Error("Too many attempts.");
  }

  const response = await fetch(url);

  if (response.ok) {
    const responseText = await response.text();

    if (responseText.indexOf("Please try again later for access.") !== -1 && tries < maxRetries) {
      setShowSlowNotice(true);
      await delay(1000 * (tries + 1));
      return await fetchFromBgg(url, setShowSlowNotice, tries + 1);
    }
    const parser = new xml2js.Parser();
    return await parser.parseStringPromise(responseText);
  }

  throw new Error(response.statusText);
}
