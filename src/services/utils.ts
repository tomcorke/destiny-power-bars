import {
  DestinyCharacterComponent,
  DestinyInventoryComponent,
  DestinyItemComponent,
  DestinyItemInstanceComponent,
  DestinyProfileProgressionComponent
} from "bungie-api-ts/destiny2";

import forIn from "lodash/forIn";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import maxBy from "lodash/maxBy";
import sumBy from "lodash/sumBy";

import {
  CLASS_NAMES,
  CLASS_TYPE_ALL,
  ITEM_BUCKET_SLOTS,
  ITEM_SLOT_BUCKETS,
  ITEM_TYPE_ARMOR,
  ITEM_TYPE_WEAPON,
  UNDYING_ARTIFACT_ITEM_HASH
} from "../constants";
import {
  CharacterData,
  ItemBySlot,
  JoinedItemDefinition,
  PowerBySlot,
  SeasonalArtifactData
} from "../types";
import {
  getBasicProfile,
  getFullProfile,
  getManifest,
  ManifestData
} from "./bungie-api";
import { auth, getSelectedDestinyMembership } from "./bungie-auth";

const getPowerBySlot = (itemsBySlot: ItemBySlot): PowerBySlot =>
  mapValues(itemsBySlot, item =>
    item && item.instanceData ? item.instanceData.primaryStat.value : 0
  );

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
  if (item.instanceData.canEquip) {
    return true;
  } // If the game says we can equip it, let's believe it
  if (item.instanceData.cannotEquipReason === 16) {
    return true;
  } // Only reason is that it's in your vault
  if (item.instanceData.equipRequiredLevel > character.baseCharacterLevel) {
    return false;
  }
  if (
    item.itemDefinition.classType !== CLASS_TYPE_ALL &&
    item.itemDefinition.classType !== character.classType
  ) {
    return false;
  }
  // Let's ignore the rest for now
  return true;
};

const getBasicCharacterData = async (
  pendingBasicProfile: ReturnType<typeof getBasicProfile>
) => {
  const profile = await pendingBasicProfile;
  if (!profile || !profile.Response || !profile.Response.characters) {
    return;
  }
  const characters = profile.Response.characters.data;

  if (characters) {
    const getBasicDataForCharacterId = (id: string): CharacterData => {
      const character = characters[id];
      const className = CLASS_NAMES[character.classType];
      const result: CharacterData = {
        character,
        className,
        overallPowerExact: character.light,
        overallPower: character.light
      };
      return result;
    };

    const characterIds = Object.keys(characters);
    const characterData = characterIds.map(id =>
      getBasicDataForCharacterId(id)
    );
    return characterData;
  }
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
    .map(item => {
      const instanceData = item.itemInstanceId
        ? itemInstances[item.itemInstanceId]
        : undefined;
      const itemDefinition =
        manifest.DestinyInventoryItemDefinition[item.itemHash];
      return {
        ...item,
        instanceData,
        itemDefinition
      };
    })
    .filter(
      i =>
        i.instanceData &&
        i.itemDefinition &&
        [ITEM_TYPE_ARMOR, ITEM_TYPE_WEAPON].includes(i.itemDefinition.itemType)
    )
    .map(i => ({
      ...i,
      instanceData: i.instanceData!,
      itemDefinition: i.itemDefinition!
    }))
    .map(i => ({
      ...i,
      slotName: ITEM_BUCKET_SLOTS[i.itemDefinition.inventory.bucketTypeHash]
    }))
    .filter(i => i.instanceData.primaryStat && i.instanceData.primaryStat.value)
    .filter(i => isItemEquippableByCharacter(i, character));

const getItemScore = (item?: JoinedItemDefinition) => {
  if (!item || !item.instanceData || !item.instanceData.primaryStat) {
    return 0;
  }
  let score = item.instanceData.primaryStat.value;
  if (item.instanceData.isEquipped) {
    score += 0.1;
  }
  if (item.location === 1) {
    score += 0.05;
  }
  return score;
};

const getEquipLabel = (item?: JoinedItemDefinition) =>
  item && item.itemDefinition.equippingBlock.uniqueLabel;

const getEmblemData = (
  character: DestinyCharacterComponent,
  manifest: ManifestData
) => {
  if (!manifest) {
    return;
  }
  return manifest.DestinyInventoryItemDefinition[character.emblemHash];
};

const getDataForCharacterId = (
  characterId: string,
  characters: ObjectOf<DestinyCharacterComponent>,
  itemInstances: ObjectOf<DestinyItemInstanceComponent>,
  manifest: ManifestData,
  characterInventories: ObjectOf<DestinyInventoryComponent>,
  characterEquipments: ObjectOf<DestinyInventoryComponent>,
  allCharacterWeapons: DestinyItemComponent[],
  profileInventories: DestinyInventoryComponent,
  profileProgression: DestinyProfileProgressionComponent
): CharacterData => {
  const character = characters[characterId];
  const className = CLASS_NAMES[character.classType];

  const characterItems = mapAndFilterItems(
    characterInventories[characterId].items
      .concat(characterEquipments[characterId].items)
      .concat(allCharacterWeapons),
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
    i =>
      i.itemDefinition.classType === CLASS_TYPE_ALL ||
      i.itemDefinition.classType === character.classType
  );

  const allItems = characterItems.concat(relevantProfileItems);

  // Group by slot
  const itemsBySlot = groupBy(allItems, i => i.slotName);
  // Get max power items per slot
  let topItemBySlot: ItemBySlot = mapValues(
    itemsBySlot,
    items => maxBy(items, getItemScore)!
  );
  // Get overlaps by equip label
  const uniqueEquippedGroups = groupBy(
    Object.values(topItemBySlot).filter(getEquipLabel),
    getEquipLabel
  );
  // For overlaps with more than one item, generate valid options where all-but-one item is swapped for the next best non-exotic
  forIn(uniqueEquippedGroups, uniqueEquippedGroup => {
    if (uniqueEquippedGroup.length <= 1) {
      return;
    }

    const validItemCombinations: ItemBySlot[] = [];

    uniqueEquippedGroup.forEach(item => {
      const otherItems: JoinedItemDefinition[] = uniqueEquippedGroup
        .filter(otherItem => otherItem !== item)
        .filter(otherItem => !!otherItem)
        .map(otherItem => otherItem!);
      let isCombinationValid = true;
      const combination = { ...topItemBySlot };
      otherItems.forEach(otherItem => {
        // Find non-exotics for this slot
        const nonExotics = itemsBySlot[otherItem.slotName].filter(
          i => !getEquipLabel(i)
        );
        if (nonExotics.length > 0) {
          // Select max power from non-exotics
          combination[otherItem.slotName] = maxBy(nonExotics, getItemScore)!;
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
      const bestCombination = maxBy(validItemCombinations, combination =>
        sumBy(Object.values(combination), getItemScore)
      )!;
      topItemBySlot = bestCombination;
    }
  });

  // Mock lower kinetic weapon power level to test display of world drop hints
  // (topItemBySlot.kinetic.instanceData.primaryStat as any).value = 940;

  const powerBySlot = getPowerBySlot(topItemBySlot);
  const overallPowerExact = getAveragePower(powerBySlot);
  const overallPower = getOverallPower(powerBySlot);

  const artifactItemComponent = Object.values(characterEquipments)
    .flatMap(i => i.items)
    .find(i => i.itemHash === UNDYING_ARTIFACT_ITEM_HASH);

  let artifactData: SeasonalArtifactData | undefined;
  if (artifactItemComponent && profileProgression.seasonalArtifact) {
    const artifactDefinition = manifest.DestinyInventoryItemDefinition[
      artifactItemComponent.itemHash
    ]!;
    artifactData = {
      bonusPower: profileProgression.seasonalArtifact.powerBonus,
      iconPath: artifactDefinition.displayProperties.icon,
      name: artifactDefinition.displayProperties.name,
      progressToNextLevel:
        profileProgression.seasonalArtifact.powerBonusProgression
          .progressToNextLevel,
      nextLevelAt:
        profileProgression.seasonalArtifact.powerBonusProgression.nextLevelAt
    };
  }

  const potentialPowerBySlot = { ...powerBySlot };
  while (
    Object.values(potentialPowerBySlot).some(
      power => power < getOverallPower(potentialPowerBySlot) || power < 900
    )
  ) {
    const tempPotentialOverallPower = getOverallPower(potentialPowerBySlot);
    Object.keys(potentialPowerBySlot).forEach(
      slot =>
        (potentialPowerBySlot[slot] = Math.max(
          900,
          Math.max(tempPotentialOverallPower, potentialPowerBySlot[slot])
        ))
    );
  }
  const potentialOverallPower = getOverallPower(potentialPowerBySlot);

  const emblemData = getEmblemData(character, manifest);

  const resultData: CharacterData = {
    character,
    className,
    overallPowerExact,
    overallPower,
    potentialOverallPower,
    topItemBySlot,
    artifactData,
    emblemData
  };

  return resultData;
};

export const getCharacterData = async (
  currentCharacterData: CharacterData[] | undefined,
  setCharacterData: (state: CharacterData[]) => any,
  setIsFetchingCharacterData: (state: boolean) => any,
  returnBasicCharacterData: boolean = false
) => {
  try {
    const isAuthed = await auth();
    if (!isAuthed) {
      return;
    }

    const pendingManifest = getManifest();

    setIsFetchingCharacterData(true);

    const destinyMembership = getSelectedDestinyMembership();
    if (!destinyMembership) {
      return;
    }

    let pendingBasicProfile: ReturnType<typeof getBasicProfile> | undefined;

    // Flag lets this be disabled to prevent setting after full profile is returned
    let shouldSetBasicCharacterData = true;
    // Produce basic data if flag is set
    if (returnBasicCharacterData) {
      pendingBasicProfile = getBasicProfile(
        destinyMembership.membershipType,
        destinyMembership.membershipId
      );
      pendingBasicProfile.catch(() => {
        /* Do nothing */
      });
      const pendingBasicCharacterData = getBasicCharacterData(
        pendingBasicProfile
      ).catch(e => {
        /* Do nothing */
      });
      (async () => {
        const basicCharacterData = await pendingBasicCharacterData;
        if (basicCharacterData && shouldSetBasicCharacterData) {
          setCharacterData(basicCharacterData);
        }
      })();
    }

    const fullProfile = await getFullProfile(
      destinyMembership.membershipType,
      destinyMembership.membershipId
    );
    setIsFetchingCharacterData(false);

    if (
      !fullProfile ||
      !fullProfile.Response ||
      !fullProfile.Response.characters ||
      !fullProfile.Response.characters.data ||
      !fullProfile.Response.characterEquipment ||
      !fullProfile.Response.characterEquipment.data ||
      !fullProfile.Response.characterInventories ||
      !fullProfile.Response.characterInventories.data ||
      !fullProfile.Response.profileInventory ||
      !fullProfile.Response.profileInventory.data ||
      !fullProfile.Response.itemComponents ||
      !fullProfile.Response.itemComponents.instances ||
      !fullProfile.Response.itemComponents.instances.data ||
      !fullProfile.Response.profileProgression ||
      !fullProfile.Response.profileProgression.data
    ) {
      return;
    }

    const characters = fullProfile.Response.characters.data;
    const characterEquipments = fullProfile.Response.characterEquipment.data;
    const characterInventories = fullProfile.Response.characterInventories.data;
    const profileInventories = fullProfile.Response.profileInventory.data;
    const itemInstances = fullProfile.Response.itemComponents.instances.data;
    const profileProgression = fullProfile.Response.profileProgression.data;

    const manifestResult = await pendingManifest;

    if (!manifestResult || !manifestResult.manifest) {
      return;
    }

    const { manifest } = manifestResult;

    const allCharacterItems = mergeItems(characterInventories)
      .concat(mergeItems(characterEquipments))
      .concat(profileInventories.items);
    const allCharacterWeapons = allCharacterItems.filter(i => {
      const itemDefinition =
        i.itemHash && manifest.DestinyInventoryItemDefinition[i.itemHash];
      return itemDefinition && itemDefinition.itemType === ITEM_TYPE_WEAPON;
    });

    const characterIds = Object.keys(characters);
    const characterData = characterIds.map(id =>
      getDataForCharacterId(
        id,
        characters,
        itemInstances,
        manifest,
        characterInventories,
        characterEquipments,
        allCharacterWeapons,
        profileInventories,
        profileProgression
      )
    );
    shouldSetBasicCharacterData = false;
    setCharacterData(characterData);
  } catch (e) {
    console.error(`Error fetching manifest and character data`, e);
    setIsFetchingCharacterData(false);
    return;
  }
};
