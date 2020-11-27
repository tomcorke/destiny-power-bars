import {
  DestinyInventoryItemDefinition,
  DestinyManifest,
  DestinyRecordDefinition,
  DestinyVendorDefinition,
  getDestinyManifest,
  getProfile,
  setItemLockState as setItemLockStateApi,
  DestinyItemStateRequest,
} from "bungie-api-ts/destiny2";
import { HttpClientConfig } from "bungie-api-ts/http";
import { get, set, del } from "idb-keyval";

import { getAccessToken } from "./bungie-auth";
import { BUNGIE_API_KEY } from "./config";
import { debug } from "./debug";
import eventEmitter, { EVENTS } from "./events";
import ga from "./ga";

export class BungieSystemDisabledError extends Error {
  constructor() {
    super("Bungie API disabled");
  }
}

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
    if (response.status === 503) {
      try {
        const messageData = await response.json();
        if (messageData && messageData.ErrorStatus === "SystemDisabled") {
          throw new BungieSystemDisabledError();
        }
      } catch (e) {
        /* Do nothing if unrecognised or un-parseable 503 */
      }
    }
    throw Error(response.status.toString());
  }
  return await response.json();
};

const MANIFEST_VERSION_KEY = "MANIFEST_VERSION";
const MANIFEST_IDB_KEY = "MANIFEST_DATA";
export interface ManifestData {
  [key: string]: any | undefined;
  DestinyInventoryItemDefinition: {
    [key: string]: DestinyInventoryItemDefinition | undefined;
  };
  DestinyVendorDefinition: {
    [key: string]: DestinyVendorDefinition | undefined;
  };
  DestinyRecordDefinition: {
    [key: string]: DestinyRecordDefinition | undefined;
  };
}
const manifestPropertyWhitelist = [
  "DestinyInventoryItemDefinition",
  "DestinyVendorDefinition",
  "DestinyRecordDefinition",
];

let getCachedManifestDataPromise: Promise<ManifestData> | undefined;
const getCachedManifestData = async () => {
  if (!getCachedManifestDataPromise) {
    getCachedManifestDataPromise = (async () => {
      debug("Loading manifest data from IDB");
      const manifestData = await get(MANIFEST_IDB_KEY);
      debug("Finished loading manifest data from IDB");
      return manifestData as ManifestData;
    })();
  }
  return getCachedManifestDataPromise;
};

const asBoolean = (value: string) => value && value.toLowerCase() === "true";

const getUserLanguage = () => {
  const LANG_PATTERN = /^[a-z]{2}$/;

  const queryParams = new URLSearchParams(window.location.search);
  const queryLang = queryParams.get("lang");

  if (queryLang && LANG_PATTERN.test(queryLang)) {
    return queryLang;
  }

  const queryUseUserLang = queryParams.get("useLang") || "";
  const useUserLang = asBoolean(queryUseUserLang);

  if (useUserLang && navigator && navigator.language) {
    const navLanguage = navigator.language.substr(0, 2);
    if (LANG_PATTERN.test(navLanguage)) {
      return navLanguage;
    }
  }

  return undefined;
};

const getRemoteManifestData = async (manifest: DestinyManifest) => {
  debug("getRemoteManifestData");
  if (!manifest) {
    throw Error("No manifest!");
  }
  const version = manifest.version;
  eventEmitter.emit(EVENTS.FETCH_MANIFEST_DATA);
  const language = getUserLanguage() || "en";
  const manifestUrls =
    manifest.jsonWorldComponentContentPaths[language] ||
    manifest.jsonWorldComponentContentPaths.en;
  const manifestDataArray = await Promise.all(
    manifestPropertyWhitelist.map((prop) =>
      fetch(`https://www.bungie.net${manifestUrls[prop]}`).then((response) =>
        response.json()
      )
    )
  );
  const manifestData: ManifestData = manifestPropertyWhitelist.reduce(
    (acc, prop, i) => ({ ...acc, [prop]: manifestDataArray[i] }),
    {} as any
  );
  console.log(manifestData);
  // const manifestData: ManifestData = await manifestDataResponse.json();
  eventEmitter.emit(EVENTS.PARSE_MANIFEST_DATA);
  Object.keys(manifestData).forEach((key) => {
    if (!manifestPropertyWhitelist.includes(key)) {
      delete manifestData[key];
    }
  });
  eventEmitter.emit(EVENTS.STORE_MANIFEST_DATA);
  await set(MANIFEST_IDB_KEY, manifestData);
  localStorage.setItem(MANIFEST_VERSION_KEY, version);
  return manifestData;
};

export const clearStoredManifest = async () => {
  // Remove stored data
  localStorage.removeItem(MANIFEST_VERSION_KEY);
  await del(MANIFEST_IDB_KEY);
  // Clear cached manifest promise so it can re-fetch
  getManifestPromise = undefined;
  // Trigger re-fetch by emitting error
  eventEmitter.emit(EVENTS.MANIFEST_FETCH_ERROR);
};

window.clearDestinyManifest = () =>
  clearStoredManifest().then(() => console.log("Cleared Destiny manifest"));

export type GetManifestResult =
  | {
      manifest: ManifestData;
      error?: null;
    }
  | { manifest: null; error: Error };

let cachedManifestData: ManifestData | undefined;
let getManifestPromise: Promise<GetManifestResult> | undefined;

export const getManifest = async (): Promise<GetManifestResult> => {
  debug("getManifest");
  if (!getManifestPromise) {
    debug("getManifest", "create new getManifestPromise");
    getManifestPromise = Promise.resolve()
      .then(async () => {
        // Start loading cached manifest data early
        const pendingGetCachedManifestData = getCachedManifestData();

        ga.event({
          category: "Data",
          action: "Attempt load manifest",
          nonInteraction: true,
        });
        eventEmitter.emit(EVENTS.GET_MANIFEST);
        const manifest = await getDestinyManifest(bungieAuthedFetch);
        const localStorageManifestVersion = localStorage.getItem(
          MANIFEST_VERSION_KEY
        );
        if (
          manifest &&
          manifest.Response &&
          manifest.Response.version === localStorageManifestVersion &&
          !window.location.search.includes("updateManifest")
        ) {
          if (!cachedManifestData) {
            eventEmitter.emit(EVENTS.LOAD_MANIFEST_DATA);
            cachedManifestData = await pendingGetCachedManifestData;
          }
          if (
            cachedManifestData &&
            manifestPropertyWhitelist.every(
              (key) => cachedManifestData && !!cachedManifestData[key]
            )
          ) {
            return { manifest: cachedManifestData };
          }
        }
        if (
          manifest &&
          manifest.ErrorStatus &&
          manifest.ErrorStatus !== "Success"
        ) {
          ga.event({
            category: "Errors",
            action: `Error status "${manifest.ErrorStatus}" returned from manifest request`,
            nonInteraction: true,
          });
          if (manifest.ErrorStatus === "SystemDisabled") {
            return {
              manifest: null,
              error: new BungieSystemDisabledError(),
            };
          }
          return {
            manifest: null,
            error: Error(
              `Error status "${manifest.ErrorStatus}" returned from manifest request`
            ),
          };
        }
        if (!manifest || !manifest.Response) {
          throw Error("No manifest received!");
        }
        cachedManifestData = undefined;
        ga.event({
          category: "Data",
          action: "Fetch remote manifest",
          nonInteraction: true,
        });
        const freshManifestData = await getRemoteManifestData(
          manifest.Response
        );
        cachedManifestData = freshManifestData;
        return { manifest: freshManifestData };
      })
      .then((result) => {
        if (result.manifest && !result.error) {
          eventEmitter.emit(EVENTS.MANIFEST_DATA_READY);
          return result;
        } else {
          throw result.error;
        }
      })
      .catch((err) => {
        console.error(err);
        // Clear manifest promise so it can be re-fetched
        eventEmitter.emit(EVENTS.MANIFEST_FETCH_ERROR);
        getManifestPromise = undefined;
        return { manifest: null, error: err };
      });
  }
  return getManifestPromise;
};

export const getBasicProfile = (
  membershipType: number,
  membershipId: string
) => {
  debug("getBasicProfile");
  ga.event({
    category: "Character Data",
    action: "Fetch minimal profile",
    nonInteraction: true,
  });
  return getProfile(bungieAuthedFetch, {
    components: [
      200, // DestinyComponentType.Characters,
      205, // DestinyComponentType.CharacterEquipment,
    ],
    destinyMembershipId: membershipId,
    membershipType,
  });
};

export const getFullProfile = (
  membershipType: number,
  membershipId: string
) => {
  debug("getFullProfile");
  ga.event({
    category: "Character Data",
    action: "Fetch full profile",
    nonInteraction: true,
  });
  return getProfile(bungieAuthedFetch, {
    components: [
      200, // DestinyComponentType.Characters,
      201, // DestinyComponentType.CharacterInventories,
      205, // DestinyComponentType.CharacterEquipment,
      102, // DestinyComponentType.ProfileInventories,
      300, // DestinyComponentType.ItemInstances,
      104, // DestinyComponentType.ProfileProgression
    ],
    destinyMembershipId: membershipId,
    membershipType,
  });
};

export const setItemLockState = (payload: DestinyItemStateRequest) => {
  debug("setItemLockState");
  return setItemLockStateApi(bungieAuthedFetch, payload);
};
