import {
  DestinyCharacterComponent,
  DestinyInventoryComponent,
  DestinyItemComponent,
  DestinyItemInstanceComponent,
  DestinyProfileProgressionComponent,
  DestinyProfileResponse,
  ServerResponse,
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
  ITEM_TYPE_ARMOR,
  ITEM_TYPE_WEAPON,
} from "../constants";
import {
  ItemBySlot,
  JoinedItemDefinition,
  PowerBarsCharacterData,
  PowerBySlot,
  SeasonalArtifactData,
} from "../types";
import {
  BungieSystemDisabledError,
  getFullProfile,
  getManifest,
  GetManifestResult,
  ManifestData,
  setItemLockState,
} from "./bungie-api";
import { auth, getSelectedDestinyMembership } from "./bungie-auth";
import { debug } from "./debug";
import eventEmitter, { EVENTS } from "./events";
import { isMasterwork } from "./masterwork";

const CHARACTER_DISPLAY_ORDER_STORAGE_KEY = "characterDisplayOrder";
const CACHED_CHARACTER_DATA_STORAGE_KEY = "cachedCharacterData";

export const loadCharacterDisplayOrder = () => {
  debug("loadCharacterDisplayOrder");
  const storedValue = localStorage.getItem(CHARACTER_DISPLAY_ORDER_STORAGE_KEY);
  try {
    return storedValue ? JSON.parse(storedValue) : undefined;
  } catch (e) {
    return undefined;
  }
};

export const saveCharacterDisplayOrder = (characterOrder: string[]) => {
  debug("saveCharacterDisplayOrder");
  localStorage.setItem(
    CHARACTER_DISPLAY_ORDER_STORAGE_KEY,
    JSON.stringify(characterOrder)
  );
};

const getPowerBySlot = (itemsBySlot: ItemBySlot): PowerBySlot =>
  mapValues(itemsBySlot, (item) => item?.instanceData?.primaryStat?.value || 0);

const getAveragePower = (powerBySlot: PowerBySlot) =>
  Object.values(powerBySlot).reduce((sum, power) => sum + power, 0) /
  Object.keys(ITEM_SLOT_BUCKETS).length;
const getOverallPower = (powerBySlot: PowerBySlot) =>
  Math.floor(getAveragePower(powerBySlot));

const mergeItems = <
  T extends { [key: string]: { items: DestinyItemComponent[] } }
>(
  characterItemMap: T
) => {
  return Object.values(characterItemMap).reduce(
    (allItems, characterItems) => allItems.concat(characterItems.items),
    [] as DestinyItemComponent[]
  );
};

const isItemEquippableByCharacter = (
  item: JoinedItemDefinition,
  character: DestinyCharacterComponent
) => {
  if (!item.instanceData) {
    return false;
  }
  if (item.instanceData.equipRequiredLevel > character.baseCharacterLevel) {
    return false;
  }
  if (
    item.itemDefinition.classType !== CLASS_TYPE_ALL &&
    item.itemDefinition.classType !== character.classType
  ) {
    return false;
  }
  if (item.instanceData.cannotEquipReason === 16) {
    return true;
  } // Only reason is that it's in your vault
  if (item.instanceData.canEquip) {
    return true;
  } // If the game says we can equip it, let's believe it
  // Let's ignore the rest for now
  return true;
};

interface ObjectOf<T> {
  [key: string]: T;
}

const mapAndFilterItems = (
  items: DestinyItemComponent[],
  manifest: ManifestData,
  itemInstances: ObjectOf<DestinyItemInstanceComponent>,
  character: DestinyCharacterComponent
): JoinedItemDefinition[] =>
  items
    .map((item) => {
      const instanceData = item.itemInstanceId
        ? itemInstances[item.itemInstanceId]
        : undefined;
      const itemDefinition =
        manifest.DestinyInventoryItemDefinition[item.itemHash];
      return {
        ...item,
        instanceData,
        itemDefinition,
      };
    })
    .filter(
      (i) =>
        i.instanceData &&
        i.itemDefinition &&
        [ITEM_TYPE_ARMOR, ITEM_TYPE_WEAPON].includes(i.itemDefinition.itemType)
    )
    .map((i) => ({
      ...i,
      instanceData: i.instanceData!,
      itemDefinition: i.itemDefinition!,
    }))
    .map((i) => ({
      ...i,
      slotName: ITEM_BUCKET_SLOTS[i.itemDefinition.inventory.bucketTypeHash],
    }))
    .filter(
      (i) => i.instanceData.primaryStat && i.instanceData.primaryStat.value
    )
    .filter((i) => isItemEquippableByCharacter(i, character));

const getItemScore = (
  item?: JoinedItemDefinition,
  priorityItems?: DestinyItemComponent[]
) => {
  if (!item || !item.instanceData || !item.instanceData.primaryStat) {
    return 0;
  }
  let score = item.instanceData.primaryStat.value;
  if (
    priorityItems &&
    priorityItems.some((pi) => pi.itemInstanceId === item.itemInstanceId)
  ) {
    // Prefer items currently equipped on character over items of equal level elsewhere
    score += 0.5;
  }
  if (isMasterwork(item)) {
    score += 0.25;
  }
  if (item.location === 1) {
    // In inventory
    score += 0.125;
  }
  return score;
};

const getEquipLabel = (item?: JoinedItemDefinition) =>
  item?.itemDefinition.equippingBlock.uniqueLabel;

// const getEmblemData = (
//   character: DestinyCharacterComponent,
//   manifest: ManifestData
// ) => {
//   if (!manifest) {
//     return;
//   }
//   return manifest.DestinyInventoryItemDefinition[character.emblemHash];
// };

const getDataForCharacterId = (
  characterId: string,
  characters: ObjectOf<DestinyCharacterComponent>,
  itemInstances: ObjectOf<DestinyItemInstanceComponent>,
  manifest: ManifestData,
  equippedCharacterItems: DestinyItemComponent[],
  allCharacterItems: DestinyItemComponent[],
  profileInventories: DestinyInventoryComponent,
  profileProgression: DestinyProfileProgressionComponent
): PowerBarsCharacterData => {
  debug("getDataForCharacterId", characterId);
  const character = characters[characterId];
  const className = CLASS_NAMES[character.classType];

  const characterItems = mapAndFilterItems(
    allCharacterItems,
    manifest,
    itemInstances,
    character
  );
  const relevantProfileItems = mapAndFilterItems(
    profileInventories.items,
    manifest,
    itemInstances,
    character
  ).filter(
    (i) =>
      i.itemDefinition.classType === CLASS_TYPE_ALL ||
      i.itemDefinition.classType === character.classType
  );

  const allItems = characterItems.concat(relevantProfileItems);

  // Group by slot
  const itemsBySlot = groupBy(allItems, (i) => i.slotName);
  // Get max power items per slot
  let topItemBySlot: ItemBySlot = mapValues(
    itemsBySlot,
    (items) =>
      maxBy(items, (item) => getItemScore(item, equippedCharacterItems))!
  );
  // Get overlaps by equip label
  const uniqueEquippedGroups = groupBy(
    Object.values(topItemBySlot).filter(getEquipLabel),
    getEquipLabel
  );
  // For overlaps with more than one item, generate valid options where all-but-one item is swapped for the next best non-exotic
  forIn(uniqueEquippedGroups, (uniqueEquippedGroup) => {
    if (uniqueEquippedGroup.length <= 1) {
      return;
    }

    const validItemCombinations: ItemBySlot[] = [];

    uniqueEquippedGroup.forEach((item) => {
      const otherItems: JoinedItemDefinition[] = uniqueEquippedGroup
        .filter((otherItem) => otherItem !== item)
        .filter((otherItem) => !!otherItem)
        .map((otherItem) => otherItem!);
      let isCombinationValid = true;
      const combination = { ...topItemBySlot };
      otherItems.forEach((otherItem) => {
        // Find non-exotics for this slot
        const nonExotics = itemsBySlot[otherItem.slotName].filter(
          (i) => !getEquipLabel(i)
        );
        if (nonExotics.length > 0) {
          // Select max power from non-exotics
          combination[otherItem.slotName] = maxBy(nonExotics, (i) =>
            getItemScore(i, equippedCharacterItems)
          )!;
        } else {
          // No non-exotic options for this slot, so whole combination is invalidaa
          isCombinationValid = false;
        }
      });
      if (isCombinationValid) {
        validItemCombinations.push(combination);
      }
    });

    // Select highest total scoring valid combination, if alternative item combinations have been generated
    if (validItemCombinations.length > 0) {
      const bestCombination = maxBy(validItemCombinations, (combination) =>
        sumBy(Object.values(combination), getItemScore)
      )!;
      topItemBySlot = bestCombination;
    }
  });

  const powerBySlot = getPowerBySlot(topItemBySlot);
  const overallPowerExact = getAveragePower(powerBySlot);
  const overallPower = getOverallPower(powerBySlot);

  const artifactItemComponent = allCharacterItems.find(
    (i) => i.bucketHash === ARTIFACT_INVENTORY_BUCKET_HASH
  );

  const artifactInstance =
    artifactItemComponent?.itemInstanceId &&
    itemInstances[artifactItemComponent.itemInstanceId];

  let artifactData: SeasonalArtifactData | undefined;
  if (
    artifactItemComponent &&
    profileProgression.seasonalArtifact &&
    artifactInstance
  ) {
    const artifactDefinition = manifest.DestinyInventoryItemDefinition[
      artifactItemComponent.itemHash
    ]!;
    artifactData = {
      bonusPower:
        profileProgression.seasonalArtifact.powerBonus ||
        artifactInstance.primaryStat.value,
      iconPath: artifactDefinition.displayProperties?.icon,
      name: artifactDefinition.displayProperties?.name || "Artifact",
      progressToNextLevel:
        profileProgression.seasonalArtifact?.powerBonusProgression
          ?.progressToNextLevel,
      nextLevelAt:
        profileProgression.seasonalArtifact?.powerBonusProgression?.nextLevelAt,
    };
  }

  const potentialPowerBySlot = { ...powerBySlot };
  while (
    Object.values(potentialPowerBySlot).some(
      (power) =>
        power < getOverallPower(potentialPowerBySlot) ||
        power < ITEM_POWER_SOFT_CAP
    )
  ) {
    const tempPotentialOverallPower = getOverallPower(potentialPowerBySlot);
    Object.keys(potentialPowerBySlot).forEach(
      (slot) =>
        (potentialPowerBySlot[slot] = Math.max(
          ITEM_POWER_SOFT_CAP,
          Math.max(tempPotentialOverallPower, potentialPowerBySlot[slot])
        ))
    );
  }
  const potentialOverallPower = getOverallPower(potentialPowerBySlot);

  const titleDefinition =
    manifest.DestinyRecordDefinition[character.titleRecordHash || ""];
  const title =
    titleDefinition &&
    titleDefinition.titleInfo.titlesByGenderHash[character.genderHash];

  const resultData: PowerBarsCharacterData = {
    character,
    className,
    overallPowerExact,
    overallPower,
    potentialOverallPower,
    topItemBySlot,
    artifactData,
    title,
  };

  return resultData;
};

export const getCachedCharacterData = async (
  setCharacterData: (state: PowerBarsCharacterData[]) => any
) => {
  debug("getCachedCharacterData");
  const dataString = localStorage.getItem(CACHED_CHARACTER_DATA_STORAGE_KEY);
  if (dataString) {
    try {
      const parsedData = JSON.parse(dataString) as PowerBarsCharacterData[];
      setCharacterData(parsedData);
    } catch (e) {
      console.error(`Error parsing cached character data`, e);
    }
  }
};

const setCachedCharacterData = (data: PowerBarsCharacterData[]) => {
  localStorage.setItem(CACHED_CHARACTER_DATA_STORAGE_KEY, JSON.stringify(data));
};

let isFetchingCharacterData = false;
export const getIsFetchingCharacterData = () => {
  return isFetchingCharacterData;
};

export const bustProfileCache = async (
  characterData: PowerBarsCharacterData[]
) => {
  // find a character with a valid item somewhere (just to be safe)
  const character = characterData.find(
    (char) =>
      char.topItemBySlot &&
      Object.values(char.topItemBySlot).find((v) => v?.itemInstanceId)
  );

  // find a valid item on our character
  const item = Object.values(character?.topItemBySlot ?? {}).find(
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
    characterId: character?.character.characterId,
    membershipType: character?.character.membershipType,
  };

  isFetchingCharacterData = true;
  eventEmitter.emit(EVENTS.FETCHING_CHARACTER_DATA_CHANGE);

  try {
    await setItemLockState(payload);
  } catch (err) {
    throw err;
  } finally {
    isFetchingCharacterData = false;
    eventEmitter.emit(EVENTS.FETCHING_CHARACTER_DATA_CHANGE);
  }
};

export const getCharacterData = async (
  setCharacterData: (state: PowerBarsCharacterData[]) => any
) => {
  debug("getCharacterData");
  try {
    const isAuthed = await auth();
    if (!isAuthed) {
      return;
    }

    const pendingManifest = getManifest();

    isFetchingCharacterData = true;
    eventEmitter.emit(EVENTS.FETCHING_CHARACTER_DATA_CHANGE);

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
    } catch (e) {
      if (e.message === "401") {
        await auth();
        fullProfile = await getFullProfile(
          destinyMembership.membershipType,
          destinyMembership.membershipId
        );
      } else {
        throw e;
      }
    }

    if (
      !fullProfile ||
      !fullProfile?.Response?.characters?.data ||
      !fullProfile?.Response?.characterEquipment?.data ||
      !fullProfile?.Response?.characterInventories?.data ||
      !fullProfile?.Response?.profileInventory?.data ||
      !fullProfile?.Response?.itemComponents?.instances?.data ||
      !fullProfile?.Response?.profileProgression?.data
    ) {
      return;
    }

    const characters = fullProfile.Response.characters.data;
    const characterEquipments = fullProfile.Response.characterEquipment.data;
    const characterInventories = fullProfile.Response.characterInventories.data;
    const profileInventories = fullProfile.Response.profileInventory.data;
    const itemInstances = fullProfile.Response.itemComponents.instances.data;
    const profileProgression = fullProfile.Response.profileProgression.data;

    let manifestResult: GetManifestResult | undefined;
    try {
      manifestResult = await pendingManifest;
    } catch (e) {
      console.error(e);
      return;
    }

    if (!manifestResult || !manifestResult.manifest) {
      return;
    }

    const { manifest } = manifestResult;

    const allCharacterItems = mergeItems(characterInventories)
      .concat(mergeItems(characterEquipments))
      .concat(profileInventories.items);

    const characterIds = Object.keys(characters);
    const characterData = characterIds.map((id) =>
      getDataForCharacterId(
        id,
        characters,
        itemInstances,
        manifest,
        characterEquipments[id].items,
        allCharacterItems,
        profileInventories,
        profileProgression
      )
    );
    setCachedCharacterData(characterData);
    setCharacterData(characterData);
  } catch (e) {
    throw e;
  } finally {
    isFetchingCharacterData = false;
    eventEmitter.emit(EVENTS.FETCHING_CHARACTER_DATA_CHANGE);
  }
};
