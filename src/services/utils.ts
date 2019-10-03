import {
  DestinyCharacterComponent,
  DestinyItemComponent
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
import { getBasicProfile, getFullProfile, getManifest } from "./bungie-api";
import { auth, getSelectedDestinyMembership } from "./bungie-auth";

const getPowerBySlot = (itemsBySlot: ItemBySlot): PowerBySlot =>
  mapValues(itemsBySlot, item => item.instanceData.primaryStat.value);

const getOverallPower = (powerBySlot: PowerBySlot) =>
  Math.floor(
    Object.values(powerBySlot).reduce((sum, power) => sum + power, 0) /
      Object.keys(ITEM_SLOT_BUCKETS).length
  );

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
    const getDataForCharacterId = (id: string): CharacterData => {
      const character = characters[id];
      const className = CLASS_NAMES[character.classType];
      return {
        character,
        className,
        id,
        overallPower: character.light
      };
    };

    const characterIds = Object.keys(characters);
    const characterData = characterIds.map(id => getDataForCharacterId(id));
    return characterData;
  }
};

export const getCharacterData = async (
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
      !fullProfile.Response.itemComponents.instances.data
    ) {
      return;
    }

    const characters = fullProfile.Response.characters.data;
    const characterEquipments = fullProfile.Response.characterEquipment.data;
    const characterInventories = fullProfile.Response.characterInventories.data;
    const profileInventories = fullProfile.Response.profileInventory.data;
    const itemInstances = fullProfile.Response.itemComponents.instances.data;

    const manifest = await pendingManifest;

    if (!manifest) {
      return;
    }

    const allCharacterItems = mergeItems(characterInventories)
      .concat(mergeItems(characterEquipments))
      .concat(profileInventories.items);
    const allCharacterWeapons = allCharacterItems.filter(i => {
      const itemDefinition =
        i.itemHash && manifest.DestinyInventoryItemDefinition[i.itemHash];
      return itemDefinition && itemDefinition.itemType === ITEM_TYPE_WEAPON;
    });

    const getDataForCharacterId = (id: string): CharacterData => {
      const character = characters[id];
      const className = CLASS_NAMES[character.classType];

      const mapAndFilterItems = (
        items: DestinyItemComponent[]
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
              [ITEM_TYPE_ARMOR, ITEM_TYPE_WEAPON].includes(
                i.itemDefinition.itemType
              )
          )
          .map(i => ({
            ...i,
            instanceData: i.instanceData!,
            itemDefinition: i.itemDefinition!
          }))
          .map(i => ({
            ...i,
            slotName:
              ITEM_BUCKET_SLOTS[i.itemDefinition.inventory.bucketTypeHash]
          }))
          .filter(i => isItemEquippableByCharacter(i, character));

      const characterItems = mapAndFilterItems(
        characterInventories[id].items
          .concat(characterEquipments[id].items)
          .concat(allCharacterWeapons)
      );
      const relevantProfileItems = mapAndFilterItems(
        profileInventories.items
      ).filter(
        i =>
          i.itemDefinition.classType === CLASS_TYPE_ALL ||
          i.itemDefinition.classType === character.classType
      );

      const allItems = characterItems.concat(relevantProfileItems);

      const getItemScore = (item: JoinedItemDefinition) => {
        let score = item.instanceData.primaryStat.value;
        if (item.instanceData.isEquipped) {
          score += 0.1;
        }
        if (item.location === 1) {
          score += 0.05;
        }
        return score;
      };

      const getEquipLabel = (item: JoinedItemDefinition) =>
        item.itemDefinition.equippingBlock.uniqueLabel;

      // Group by slot
      const itemsBySlot = groupBy(allItems, i => i.slotName);
      // Get max power items per slot
      let topItemBySlot = mapValues(
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
          const otherItems = uniqueEquippedGroup.filter(
            otherItem => otherItem !== item
          );
          let isCombinationValid = true;
          const combination = { ...topItemBySlot };
          otherItems.forEach(otherItem => {
            // Find non-exotics for this slot
            const nonExotics = itemsBySlot[otherItem.slotName].filter(
              i => !getEquipLabel(i)
            );
            if (nonExotics.length > 0) {
              // Select max power from non-exotics
              combination[otherItem.slotName] = maxBy(
                nonExotics,
                getItemScore
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
          const bestCombination = maxBy(validItemCombinations, combination =>
            sumBy(Object.values(combination), getItemScore)
          )!;
          topItemBySlot = bestCombination;
        }
      });

      const powerBySlot = getPowerBySlot(topItemBySlot);
      const overallPower = getOverallPower(powerBySlot);

      const artifactItemComponent = Object.values(characterEquipments)
        .flatMap(i => i.items)
        .find(i => i.itemHash === UNDYING_ARTIFACT_ITEM_HASH);

      let artifactData: SeasonalArtifactData | undefined;
      if (artifactItemComponent && artifactItemComponent.itemInstanceId) {
        const artifactDefinition = manifest.DestinyInventoryItemDefinition[
          artifactItemComponent.itemHash
        ]!;
        const artifactInstance = itemInstances[
          artifactItemComponent.itemInstanceId
        ]!;
        artifactData = {
          bonusPower: artifactInstance.primaryStat.value,
          iconPath: artifactDefinition.displayProperties.icon,
          name: artifactDefinition.displayProperties.name
        };
      }

      const potentialPowerBySlot = { ...powerBySlot };
      while (
        Object.values(potentialPowerBySlot).some(
          power => power < getOverallPower(potentialPowerBySlot)
        )
      ) {
        const tempPotentialOverallPower = getOverallPower(potentialPowerBySlot);
        Object.keys(potentialPowerBySlot).forEach(
          slot =>
            (potentialPowerBySlot[slot] = Math.max(
              tempPotentialOverallPower,
              potentialPowerBySlot[slot]
            ))
        );
      }
      const potentialOverallPower = getOverallPower(potentialPowerBySlot);

      return {
        artifactData,
        character,
        className,
        id,
        overallPower,
        potentialOverallPower,
        potentialPowerBySlot,
        topItemBySlot
      };
    };

    const characterIds = Object.keys(characters);
    const characterData = characterIds.map(id => getDataForCharacterId(id));
    shouldSetBasicCharacterData = false;
    setCharacterData(characterData);
  } catch (e) {
    console.error(`Error fetching manifest and character data`, e);
    setIsFetchingCharacterData(false);
    return;
  }
};
