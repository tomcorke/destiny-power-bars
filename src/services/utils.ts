import {
  DestinyCharacterComponent,
  DestinyItemComponent,
  getItem
} from "bungie-api-ts/destiny2";
import _ from "lodash";
import {
  CLASS_NAMES,
  CLASS_TYPE_ALL,
  ITEM_BUCKET_SLOTS,
  ITEM_SLOT_BUCKETS,
  ITEM_TYPE_ARMOR,
  ITEM_TYPE_WEAPON
} from "../constants";
import { CharacterData, JoinedItemDefinition, PowerBySlot } from "../types";
import { getBasicProfile, getFullProfile, getManifest } from "./bungie-api";
import { auth, getSelectedDestinyMembership } from "./bungie-auth";

const getOverallPower = (powerBySlot: PowerBySlot) =>
  Object.values(powerBySlot).reduce((sum, power) => sum + power, 0) /
  Object.keys(ITEM_SLOT_BUCKETS).length;

const getDropEfficiency = (
  maxPowerBySlot: PowerBySlot,
  dropPowerIncrease: number = 0
) => {
  const base = getOverallPower(maxPowerBySlot);
  const dropPower = Math.floor(base + dropPowerIncrease);
  const overallPerSlotChanges = Object.keys(ITEM_SLOT_BUCKETS).reduce(
    (changes, slotName) => ({
      ...changes,
      [slotName]: Math.max(
        0,
        getOverallPower({ ...maxPowerBySlot, [slotName]: dropPower }) - base
      )
    }),
    {} as PowerBySlot
  );
  return getOverallPower(overallPerSlotChanges);
};

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
  // Let's ignore the rest for now
  return true;
};

const maxItemPower = (items: JoinedItemDefinition[] = []) =>
  Math.max(
    ...items.map(i => (i.instanceData ? i.instanceData.primaryStat.value : 0))
  );

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
          i.itemDefinition &&
          (i.itemDefinition.classType === CLASS_TYPE_ALL ||
            i.itemDefinition.classType === character.classType)
      );

      const allItems = characterItems.concat(relevantProfileItems);

      const getItemScore = (item: JoinedItemDefinition) => {
        return item.instanceData.primaryStat.value;
      };

      const getEquipLabel = (item: JoinedItemDefinition) =>
        item.itemDefinition.equippingBlock.uniqueLabel;

      interface ItemBySlot {
        [slotName: string]: JoinedItemDefinition;
      }

      // Group by slot
      const itemsBySlot = _.groupBy(allItems, i => i.slotName);
      // Get max power items per slot
      let topItemsBySlot = _.mapValues(
        itemsBySlot,
        items => _.maxBy(items, getItemScore)!
      );
      // Get overlaps by equip label
      const uniqueEquippedGroups = _.groupBy(
        Object.values(topItemsBySlot).filter(getEquipLabel),
        getEquipLabel
      );
      // For overlaps with more than one item, generate valid options where all-but-one item is swapped for the next best non-exotic
      _.forIn(uniqueEquippedGroups, uniqueEquippedGroup => {
        if (uniqueEquippedGroup.length <= 1) {
          return;
        }

        const validItemCombinations: ItemBySlot[] = [];

        uniqueEquippedGroup.forEach(item => {
          const otherItems = uniqueEquippedGroup.filter(
            otherItem => otherItem !== item
          );
          let isCombinationValid = true;
          const combination = { ...topItemsBySlot };
          otherItems.forEach(otherItem => {
            // Find non-exotics for this slot
            const nonExotics = itemsBySlot[otherItem.slotName].filter(
              i => !getEquipLabel(i)
            );
            if (nonExotics.length > 0) {
              // Select max power from non-exotics
              combination[otherItem.slotName] = _.maxBy(
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
          const bestCombination = _.maxBy(validItemCombinations, combination =>
            _.sumBy(Object.values(combination), getItemScore)
          )!;
          topItemsBySlot = bestCombination;
        }
      });

      const overallPower = Math.floor(
        Object.values(topItemsBySlot).reduce(
          (total, item) => total + item.instanceData.primaryStat.value,
          0
        ) / Object.keys(topItemsBySlot).length
      );

      return {
        character,
        className,
        id,
        overallPower,
        topItemsBySlot
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
