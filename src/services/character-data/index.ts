import {
  DestinyCharacterComponent,
  DestinyInventoryComponent,
  DestinyItemComponent,
  DestinyItemInstanceComponent,
  DestinyProfileProgressionComponent,
  DestinyProfileRecordsComponent,
  DestinyProfileResponse,
  ServerResponse,
  DestinyInventoryItemDefinition,
  DestinyItemPlugObjectivesComponent,
  DestinyItemSocketsComponent,
} from "bungie-api-ts/destiny2";
import forIn from "lodash/forIn";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import maxBy from "lodash/maxBy";
import sumBy from "lodash/sumBy";

import {
  ARTIFACT_INVENTORY_BUCKET_HASH,
  CLASS_NAMES,
  CLASS_TYPE_ALL,
  ITEM_BUCKET_SLOTS,
  ITEM_POWER_SOFT_CAP,
  ITEM_SLOT_BUCKETS,
} from "../../constants";
import {
  BucketHashes,
  ItemCategoryHashes,
} from "../../data/d2ai-module/generated-enums";
import {
  ItemBySlot,
  OldJoinedItemDefinition,
  PowerBarsCharacterData,
  PowerBySlot,
  SeasonalArtifactData,
} from "../../types";
import {
  BungieSystemDisabledError,
  getFullProfile,
  getManifest as apiGetManifest,
  GetManifestResult,
  ManifestData,
} from "../bungie-api";
import { auth, getSelectedDestinyMembership } from "../bungie-auth";
import { debug } from "../debug";
import eventEmitter, { EVENTS } from "../events";

import { characterProcessors, globalProcessors } from "./processors";

const getManifest = async () => {
  let manifestResult: GetManifestResult | undefined;
  try {
    manifestResult = await apiGetManifest();

    if (!manifestResult || !manifestResult.manifest) {
      return;
    }

    const { manifest } = manifestResult;
    return manifest;
  } catch (e) {
    console.error(e);
    return;
  }
};

const extractProfileData = (
  fullProfile: ServerResponse<DestinyProfileResponse>
) => {
  try {
    const characters = fullProfile.Response.characters.data!;
    const characterEquipments = fullProfile.Response.characterEquipment.data!;
    const characterInventories =
      fullProfile.Response.characterInventories.data!;
    const profileInventories = fullProfile.Response.profileInventory.data!;
    const itemInstances = fullProfile.Response.itemComponents.instances.data!;
    const itemSockets = fullProfile.Response.itemComponents.sockets.data!;
    const itemPlugObjectives =
      fullProfile.Response.itemComponents.plugObjectives.data!;
    const profileProgression = fullProfile.Response.profileProgression.data!;
    const records = fullProfile.Response.profileRecords.data!;

    return {
      responseMintedTimestamp: fullProfile.Response.responseMintedTimestamp,
      characters,
      characterEquipments,
      characterInventories,
      profileInventories,
      itemInstances,
      itemSockets,
      itemPlugObjectives,
      profileProgression,
      records,
    };
  } catch (e) {
    // Something went wrong pulling data out of the profile response
    console.error(e);
    return undefined;
  }
};

const getProfileData = async () => {
  const destinyMembership = getSelectedDestinyMembership();
  if (!destinyMembership) {
    return;
  }

  let fullProfile: ServerResponse<DestinyProfileResponse> | undefined;
  try {
    fullProfile = await getFullProfile(
      destinyMembership.membershipType,
      destinyMembership.membershipId
    );
    if (fullProfile.ErrorStatus === "SystemDisabled") {
      throw new BungieSystemDisabledError();
    }
  } catch (e: any) {
    if (e.message === "401") {
      // On 401, re-auth and try again
      await auth();
      fullProfile = await getFullProfile(
        destinyMembership.membershipType,
        destinyMembership.membershipId
      );
    } else {
      throw e;
    }
  }

  const profileData = extractProfileData(fullProfile);
  if (!profileData) {
    return;
  }

  return profileData;
};

let lastCharacterData: PowerBarsCharacterData[] | undefined;
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
  profileData: NonNullable<ReturnType<typeof extractProfileData>>
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

export const getCharacterData = async () => {
  const data = await getRequiredData();

  if (!data) {
    return;
  }

  const { manifest, profileData } = data;

  const minted = Number(profileData.responseMintedTimestamp);
  if (minted && lastResponseMinted && minted <= lastResponseMinted) {
    debug(
      `Response is old (${minted} vs ${lastResponseMinted}), returning last calculated character data`
    );
    return lastCharacterData;
  }

  // Update new profile minted timestamp
  lastResponseMinted = minted;

  // join data together into joined items

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
