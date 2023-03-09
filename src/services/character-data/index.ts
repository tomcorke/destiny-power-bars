import { DestinyItemComponent } from "bungie-api-ts/destiny2";

import { CACHED_CHARACTER_DATA_STORAGE_KEY } from "../../constants";
import { ManifestData, setItemLockState } from "../bungie-api";
import { auth } from "../bungie-auth";
import { debug } from "../debug";
import eventEmitter, { EVENTS } from "../events";

import { getManifest } from "./manifest";
import { characterProcessors, globalProcessors } from "./processors";
import { getProfileData, ProfileData } from "./profile";

let lastCharacterData: PowerBarsCharacterData | undefined;
let lastResponseMinted: number | undefined;

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

export const getCachedCharacterData = async () => {
  debug("getCachedCharacterData");
  const dataString = localStorage.getItem(CACHED_CHARACTER_DATA_STORAGE_KEY);
  if (dataString) {
    try {
      const parsedData = JSON.parse(dataString) as PowerBarsCharacterData;
      return parsedData;
    } catch (e) {
      console.error(`Error parsing cached character data`, e);
    }
  }
};

const setCachedCharacterData = (data: PowerBarsCharacterData) => {
  localStorage.setItem(CACHED_CHARACTER_DATA_STORAGE_KEY, JSON.stringify(data));
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
        ...p,
      }),
      {} as GlobalProcessorData
    ),
    characters: characterProcessorData.reduce(
      (acc, c) => ({
        [c.characterId]: c.data.reduce(
          (acc, p) => ({
            ...acc,
            ...p,
          }),
          {} as CharacterProcessorData
        ),
      }),
      {} as Record<string, CharacterProcessorData>
    ),
  };

  return joinedData;
};

export const getCharacterData = async () => {
  const rawData = await getRequiredData();

  if (!rawData) {
    return undefined;
  }

  const { manifest, profileData } = rawData;

  const minted = Number(profileData.responseMintedTimestamp);
  if (minted && lastResponseMinted && minted <= lastResponseMinted) {
    debug(
      `Response is old (${minted} vs ${lastResponseMinted}), returning last calculated character data`
    );
    return lastCharacterData;
  }

  lastResponseMinted = minted;

  const characterData = buildCharacterData(manifest, profileData);

  lastCharacterData = characterData;
  setCachedCharacterData(characterData);

  return characterData;
};

export type PowerBarsCharacterData = Awaited<
  ReturnType<typeof buildCharacterData>
>;
