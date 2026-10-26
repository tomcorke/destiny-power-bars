import { HttpClientConfig } from "bungie-api-ts/http";

import { getAccessToken } from "./bungie-auth";
import { BUNGIE_API_KEY } from "./config";
import eventEmitter, { EVENTS } from "./events";

export class BungieSystemDisabledError extends Error {
  constructor() {
    super("Bungie API disabled");
  }
}

const isSystemDisabledResponse = async (response: Response) => {
  try {
    const messageData = await response.json();
    return messageData?.ErrorStatus === "SystemDisabled";
  } catch (e) {
    /* Unrecognised or un-parseable 503 */
    return false;
  }
};

export const bungieAuthedFetch = async (config: HttpClientConfig) => {
  const accessToken = getAccessToken();
  const headers: { [key: string]: string } = {
    "x-api-key": BUNGIE_API_KEY,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const url = `${config.url}${
    config.params
      ? "?" +
        Object.entries(config.params).map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`
        )
      : ""
  }`;

  const requestConfig: RequestInit = {
    method: config.method,
    headers,
    credentials: "include" as const,
  };

  if (config.body) {
    requestConfig.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, requestConfig);
  if (response.status !== 200) {
    if (response.status === 401) {
      eventEmitter.emit(EVENTS.UNAUTHED_FETCH_ERROR);
    }
    if (response.status === 503 && (await isSystemDisabledResponse(response))) {
      throw new BungieSystemDisabledError();
    }
    throw Error(response.status.toString());
  }
  return await response.json();
};
