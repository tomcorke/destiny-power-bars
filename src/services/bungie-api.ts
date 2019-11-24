import {
  DestinyInventoryItemDefinition,
  DestinyManifest,
  DestinyVendorDefinition,
  getDestinyManifest,
  getProfile
} from "bungie-api-ts/destiny2";
import { HttpClientConfig } from "bungie-api-ts/http";
import { get, set } from "idb-keyval";

import { BUNGIE_API_KEY, getAccessToken } from "./bungie-auth";
import eventEmitter, { EVENTS } from "./events";
import ga from "./ga";

export const bungieAuthedFetch = async (config: HttpClientConfig) => {
  try {
    const accessToken = getAccessToken();
    const headers: { [key: string]: string } = {
      "x-api-key": BUNGIE_API_KEY
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    const url = `${config.url}${
      config.params
        ? "?" +
          Object.entries(config.params).map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(
                value as string
              )}`
          )
        : ""
    }`;
    const response = await fetch(url, { headers, credentials: "include" });
    if (response.status !== 200) {
      if (response.status === 401) {
        console.log("401!");
        eventEmitter.emit(EVENTS.UNAUTHED_FETCH_ERROR);
      }
      throw Error(response.status.toString());
    }
    return await response.json();
  } catch (e) {
    console.error(e);
    return {};
  }
};

export class BungieSystemDisabledError extends Error {
  constructor() {
    super("Bungie API disabled");
  }
}

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
}
const manifestPropertyWhitelist = [
  "DestinyInventoryItemDefinition",
  "DestinyVendorDefinition"
];

let getCachedManifestDataPromise: Promise<ManifestData> | undefined;
const getCachedManifestData = async () => {
  if (!getCachedManifestDataPromise) {
    getCachedManifestDataPromise = (async () => {
      console.log("Loading manifest data from IDB");
      const manifestData = await get(MANIFEST_IDB_KEY);
      console.log("Finished loading manifest data from IDB");
      return manifestData as ManifestData;
    })();
  }
  return getCachedManifestDataPromise;
};

const getRemoteManifestData = async (manifest: DestinyManifest) => {
  if (!manifest) {
    throw Error("No manifest!");
  }
  const version = manifest.version;
  eventEmitter.emit(EVENTS.FETCH_MANIFEST_DATA);
  const manifestDataResponse = await fetch(
    `https://www.bungie.net${manifest.jsonWorldContentPaths.en}`
  );
  const manifestData: ManifestData = await manifestDataResponse.json();
  eventEmitter.emit(EVENTS.PARSE_MANIFEST_DATA);
  Object.keys(manifestData).forEach(key => {
    if (!manifestPropertyWhitelist.includes(key)) {
      delete manifestData[key];
    }
  });
  eventEmitter.emit(EVENTS.STORE_MANIFEST_DATA);
  await set(MANIFEST_IDB_KEY, manifestData);
  localStorage.setItem(MANIFEST_VERSION_KEY, version);
  return manifestData;
};

export type GetManifestResult =
  | {
      manifest: ManifestData;
      error?: null;
    }
  | { manifest: null; error: Error };

let cachedManifestData: ManifestData | undefined;
let getManifestPromise: Promise<GetManifestResult> | undefined;

export const getManifest = async (): Promise<GetManifestResult> => {
  if (!getManifestPromise) {
    getManifestPromise = Promise.resolve()
      .then(async () => {
        ga.event({
          category: "Data",
          action: "Attempt load manifest",
          nonInteraction: true
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
            cachedManifestData = await getCachedManifestData();
          }
          if (
            cachedManifestData &&
            manifestPropertyWhitelist.every(
              key => cachedManifestData && !!cachedManifestData[key]
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
            nonInteraction: true
          });
          if (manifest.ErrorStatus === "SystemDisabled") {
            return {
              manifest: null,
              error: new BungieSystemDisabledError()
            };
          }
          return {
            manifest: null,
            error: Error(
              `Error status "${manifest.ErrorStatus}" returned from manifest request`
            )
          };
        }
        if (!manifest || !manifest.Response) {
          throw Error("No manifest received!");
        }
        cachedManifestData = undefined;
        ga.event({
          category: "Data",
          action: "Fetch remote manifest",
          nonInteraction: true
        });
        const freshManifestData = await getRemoteManifestData(
          manifest.Response
        );
        cachedManifestData = freshManifestData;
        return { manifest: freshManifestData };
      })
      .then(result => {
        if (result.manifest && !result.error) {
          eventEmitter.emit(EVENTS.MANIFEST_DATA_READY);
          return result;
        } else {
          throw result.error;
        }
      })
      .catch(err => {
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
  ga.event({
    category: "Character Data",
    action: "Fetch minimal profile",
    nonInteraction: true
  });
  return getProfile(bungieAuthedFetch, {
    components: [
      200, // DestinyComponentType.Characters,
      205 // DestinyComponentType.CharacterEquipment,
    ],
    destinyMembershipId: membershipId,
    membershipType
  });
};

export const getFullProfile = (
  membershipType: number,
  membershipId: string
) => {
  ga.event({
    category: "Character Data",
    action: "Fetch full profile",
    nonInteraction: true
  });
  return getProfile(bungieAuthedFetch, {
    components: [
      200, // DestinyComponentType.Characters,
      201, // DestinyComponentType.CharacterInventories,
      205, // DestinyComponentType.CharacterEquipment,
      102, // DestinyComponentType.ProfileInventories,
      300, // DestinyComponentType.ItemInstances,
      104 // DestinyComponentType.ProfileProgression
    ],
    destinyMembershipId: membershipId,
    membershipType
  });
};
