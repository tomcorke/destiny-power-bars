import { DestinyItemComponent } from "bungie-api-ts/destiny2";

import { CACHED_CHARACTER_DATA_STORAGE_KEY } from "../../constants";
import { ManifestData, setItemLockState } from "../bungie-api";
import { auth } from "../bungie-auth";
import { debug } from "../debug";
import eventEmitter, { EVENTS } from "../events";
import { hasPower, nonNullable } from "../items/filtering";
import { lockItems } from "../lock-items";

import { getManifest } from "./manifest";
import { characterProcessors, globalProcessors } from "./processors";
import { getProfileData, ProfileData } from "./profile";

const getRequiredData = async () => {
  try {
    const isAuthed = await auth();
    if (!isAuthed) {
      return;
    }

    eventEmitter.emit(EVENTS.FETCHING_CHARACTER_DATA_CHANGE, true);

    const [manifest, profileData] = await Promise.all([
      getManifest(),
      getProfileData(),
    ]);

    if (!manifest || !profileData) {
      return;
    }

    return { manifest, profileData };
  } catch (e) {
  } finally {
    eventEmitter.emit(EVENTS.FETCHING_CHARACTER_DATA_CHANGE, false);
  }
};

const mergeItems = <
  T extends { [key: string]: { items: DestinyItemComponent[] } }
>(
  characterItemMap: T
) => {
  return Object.entries(characterItemMap).reduce(
    (allItems, [characterId, characterItems]) =>
      allItems.concat(
        characterItems.items.map((item) => ({ ...item, characterId }))
      ),
    [] as DestinyItemComponent[]
  );
};

const buildGlobalProcessorContext = (
  manifest: ManifestData,
  profileData: NonNullable<ProfileData>
) => {
  const allCharacterItems = mergeItems(profileData.characterInventories)
    .concat(mergeItems(profileData.characterEquipments))
    .concat(profileData.profileInventories.items);

  return { manifest, ...profileData, allCharacterItems };
};

export type GlobalProcessorContext = ReturnType<
  typeof buildGlobalProcessorContext
>;

const buildCharacterProcessorContext = (
  globalContext: GlobalProcessorContext,
  characterId: string
) => {
  const character = globalContext.characters[characterId];
  const characterItems = globalContext.characterInventories[
    characterId
  ].items.concat(globalContext.characterEquipments[characterId].items);
  const equippedCharacterItems =
    globalContext.characterEquipments[characterId].items;
  return {
    ...globalContext,
    characterId,
    character,
    characterItems,
    equippedCharacterItems,
  };
};

export type CharacterProcessorContext = ReturnType<
  typeof buildCharacterProcessorContext
>;

const CHARACTER_DATA_CACHE_VERSION = 1;

export const getCachedCharacterData = async () => {
  debug("getCachedCharacterData");
  const dataString = localStorage.getItem(CACHED_CHARACTER_DATA_STORAGE_KEY);
  if (dataString) {
    try {
      const parsedData = JSON.parse(dataString);
      if (
        !parsedData ||
        parsedData.CHARACTER_DATA_CACHE_VERSION !== CHARACTER_DATA_CACHE_VERSION
      ) {
        throw Error("Mismatched cache version flag");
      }
      return parsedData.cachedData as PowerBarsCharacterData;
    } catch (e) {
      console.warn(`Error loading cached character data`, e);
      return undefined;
    }
  }
};

const setCachedCharacterData = (data: PowerBarsCharacterData) => {
  localStorage.setItem(
    CACHED_CHARACTER_DATA_STORAGE_KEY,
    JSON.stringify({ cachedData: data, CHARACTER_DATA_CACHE_VERSION })
  );
};

let isFetchingCharacterData = false;
export const getIsFetchingCharacterData = () => {
  return isFetchingCharacterData;
};

export const bustProfileCache = async (
  characterData: PowerBarsCharacterData
) => {
  // find a character with a valid item somewhere (just to be safe)
  const character = Object.values(characterData?.characters || {}).find(
    (char) =>
      Object.values(char.topItems.topItemsBySlot).find((v) => v?.itemInstanceId)
  );

  // find a valid item on our character
  const item = Object.values(character?.topItems.topItemsBySlot ?? {}).find(
    (v) => v?.itemInstanceId
  );

  if (!item?.itemInstanceId || !character) return;

  // to bust the profile cache, we set the locked state on an item to its *current lock state*.
  // This might be weird and confusing but it works and it busts the profile cache without
  // actually changing anything on the user's inventory

  const isLocked = (item.state && item.state & 1) === 1; // ItemState.Locked
  const payload = {
    state: isLocked,
    itemId: item.itemInstanceId,
    characterId: character?.characterId,
    membershipType: character?.membershipType,
  };

  eventEmitter.emit(EVENTS.FETCHING_CHARACTER_DATA_CHANGE, true);

  try {
    await setItemLockState(payload);
  } catch (err) {
    throw err;
  } finally {
    eventEmitter.emit(EVENTS.FETCHING_CHARACTER_DATA_CHANGE, false);
  }
};

const buildCharacterData = (
  manifest: ManifestData,
  profileData: NonNullable<ProfileData>
) => {
  const globalProcessorContext = buildGlobalProcessorContext(
    manifest,
    profileData
  );

  const characterIds = Object.keys(profileData.characters);
  const characterProcessorContexts = characterIds.map((characterId) =>
    buildCharacterProcessorContext(globalProcessorContext, characterId)
  );

  // feed raw data into data processors
  const globalProcessorData = globalProcessors.map((p) =>
    p(globalProcessorContext)
  );

  const characterProcessorData = characterProcessorContexts.map((context) => {
    return {
      characterId: context.characterId,
      data: characterProcessors.map((p) => p(context)),
    };
  });

  type UnionToIntersection<U> = (
    U extends any ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never;

  type GlobalProcessorData = UnionToIntersection<
    typeof globalProcessorData[number]["data"]
  >;
  type CharacterProcessorData = UnionToIntersection<
    typeof characterProcessorData[number]["data"][number]["data"]
  >;

  const joinedData = {
    global: globalProcessorData.reduce(
      (acc, p) => ({
        ...acc,
        ...p.data,
      }),
      {} as GlobalProcessorData
    ),
    characters: characterProcessorData.reduce(
      (accAll, c) => ({
        ...accAll,
        [c.characterId]: c.data.reduce(
          (accChar, p) => ({
            ...accChar,
            ...p.data,
          }),
          {} as CharacterProcessorData
        ),
      }),
      {} as Record<string, CharacterProcessorData>
    ),
  };

  return joinedData;
};

let lastCharacterData: PowerBarsCharacterData | undefined;
let lastResponseMinted: Date | undefined;

export const getCharacterData = async () => {
  const rawData = await getRequiredData();

  if (!rawData) {
    return undefined;
  }

  const { manifest, profileData } = rawData;

  const minted = new Date(profileData.responseMintedTimestamp);
  if (minted && lastResponseMinted && minted <= lastResponseMinted) {
    const howOld = minted < lastResponseMinted ? "old" : "unchanged";
    debug(
      `Response is ${howOld} (Current (${
        minted.toLocaleTimeString
      }) vs  Previous (${lastResponseMinted.toLocaleTimeString()})), returning last calculated character data`
    );
    return lastCharacterData;
  }

  lastResponseMinted = minted;

  const characterData = buildCharacterData(manifest, profileData);

  lastCharacterData = characterData;
  setCachedCharacterData(characterData);

  // After successful character data fetching, trigger locking items
  Object.entries(characterData.characters).forEach(([characterId, data]) => {
    lockItems(
      { characterId, membershipType: data.membershipType },
      Object.values(data.topItems.topItemsBySlot)
        .filter(nonNullable)
        .filter(hasPower)
    );
  });

  return characterData;
};

export type PowerBarsCharacterData = Awaited<
  ReturnType<typeof buildCharacterData>
>;
