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

const delay = (t: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, t));

// Build Authorization header if a token is configured. CRA exposes env vars prefixed with REACT_APP_.
const getAuthHeaders = (): HeadersInit | undefined => {
  const token = process.env.REACT_APP_BGG_TOKEN;
  if (token && token.trim().length > 0) {
    return { Authorization: `Bearer ${token}` };
  }
  return undefined;
}

// If a proxy URL is configured, send requests to the proxy instead of directly to BGG.
// The proxy is expected to accept a query param "url" that contains the full BGG URL to fetch.
// Example proxy endpoint: https://your-proxy.example.com/bgg?url=<encoded-bgg-url>
const rewriteUrlForProxy = (originalUrl: string): { url: string; useProxy: boolean } => {
  const proxyBase = process.env.REACT_APP_BGG_PROXY_URL;
  if (proxyBase && proxyBase.trim().length > 0) {
    const separator = proxyBase.includes("?") ? "&" : "?";
    return { url: `${proxyBase}${separator}url=${encodeURIComponent(originalUrl)}`, useProxy: true };
  }
  return { url: originalUrl, useProxy: false };
}

const fetchFromBgg = async <T>(url: string, apiState: ApiState, setApiState: (value: ApiState) => void, tries = 1): Promise<T> => {
  const maxRetries = 10;
  if (tries >= maxRetries) {
    setApiState({
      ...apiState,
      isTooManyRetries: true,
    })
  }

  try {
    const { url: finalUrl, useProxy } = rewriteUrlForProxy(url);
    // If using a proxy, do not send client-side Authorization; the proxy should attach it server-side.
    const headers = useProxy ? undefined : getAuthHeaders();
    const response = await fetch(finalUrl, headers ? { headers } : undefined);

    if (response.ok) {
      const responseText = await response.text();

      if (responseText.toLowerCase().indexOf("error message") >= 0 && responseText.toLowerCase().indexOf("not found")) {
        setApiState({
          ...apiState,
          isNotFound: true,
        });
      }

      if (responseText.indexOf("Please try again later for access.") >= 0 && tries < maxRetries) {
        setApiState({
          ...apiState,
          isRequestPending: true,
        });
        await delay(2000 * (tries + 1));
        return await fetchFromBgg(url, apiState, setApiState, tries + 1);
      }
      const parser = new xml2js.Parser();
      return await parser.parseStringPromise(responseText);
    }
    throw new Error(response.statusText);
  } catch (ex) {
    setApiState({ isTooManyRetries: true });
    throw ex;
  }
}
