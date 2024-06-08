import forIn from "lodash/forIn";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import maxBy from "lodash/maxBy";
import sumBy from "lodash/sumBy";

import { ITEM_POWER_SOFT_CAP, ITEM_SLOT_BUCKETS } from "../../../constants";
import {
  hasPower,
  hasSlotName,
  isItemEquippableByCharacter,
  nonNullable,
} from "../../items/filtering";
import { JoinedItemDefinition, mapJoinedItems } from "../../items/joined-item";
import { getItemScore } from "../../items/scoring";

import { createCharacterDataProcessor } from "./helpers";

type JoinedItemWithScore = JoinedItemDefinition & { score: number };

type ItemBySlot = Record<string, JoinedItemWithScore | undefined>;
type PowerBySlot = Record<string, number>;

const getPowerBySlot = (itemsBySlot: ItemBySlot) =>
  mapValues(itemsBySlot, (i) => i?.power || 0);

const getCombinationScore = (combination: ItemBySlot) =>
  sumBy(Object.values(combination), (i) => i?.score || 0);

const getMinimumPower = (powerBySlot: PowerBySlot) =>
  Math.min(...Object.values(powerBySlot));
const getAveragePower = (powerBySlot: PowerBySlot) =>
  Object.values(powerBySlot).reduce((sum, power) => sum + power, 0) /
  Object.keys(ITEM_SLOT_BUCKETS).length;
const getOverallPower = (powerBySlot: PowerBySlot) =>
  Math.floor(getAveragePower(powerBySlot));

export const powerSummary = (itemsBySlot: ItemBySlot) => {
  const powerBySlot = getPowerBySlot(itemsBySlot);
  return {
    minPower: getMinimumPower(powerBySlot),
    averagePower: getAveragePower(powerBySlot),
    overallPower: getOverallPower(powerBySlot),
  };
};

const findBestUniqueEquippableCombination = (
  itemsBySlot: Record<string, JoinedItemWithScore[]>,
  topItemsBySlot: ItemBySlot
) => {
  const uniqueEquippedGroups = groupBy(
    Object.values(topItemsBySlot).filter((item) => item?.equipLabel),
    (item) => item?.equipLabel
  );

  let bestCombination: ItemBySlot | undefined;

  forIn(uniqueEquippedGroups, (uniqueEquippedGroup) => {
    // If there is only one (or zero) exotic items in this group
    // we can skip trying to find a combination because there's no
    // problem.
    if (uniqueEquippedGroup.length <= 1) {
      return;
    }
    const validEquippableItemCombinations: ItemBySlot[] = [];

    // For each exotic item in the "top items" within the current group
    // e.g. for each exotic armour...
    uniqueEquippedGroup.forEach((item) => {
      if (!item) {
        return;
      }
      // Find the other items in the group - these will be exotics in
      // the other slots, e.g. if we are currently considering an exotic
      // helmet, we will look at other armour pieces to consider replacing
      // them with legendaries
      const otherItems = uniqueEquippedGroup
        .filter((otherItem) => otherItem !== item)
        .filter(nonNullable)
        .filter(hasSlotName);

      let isCombinationValid = true;

      const combination = { ...topItemsBySlot };

      // For each other exotic, find the best non-exotic alternative
      // for the same slot and add it to the current combination
      otherItems.forEach((otherItem) => {
        const nonExotics = itemsBySlot[otherItem.slotName].filter(
          (i) => !i.equipLabel || i.equipLabel !== item.equipLabel
        );
        if (nonExotics.length > 0) {
          combination[otherItem.slotName] = maxBy(nonExotics, (i) => i.score)!;
        } else {
          // No non-exotic options for this slot, so whole combination is invalid
          isCombinationValid = false;
        }
      });

      if (isCombinationValid) {
        validEquippableItemCombinations.push(combination);
      }
    });

    // Select highest total scoring valid combination,
    // from the combinations with the highest power (to prefer higher power over score)
    if (validEquippableItemCombinations.length > 0) {
      const combinationsWithPower = validEquippableItemCombinations.map(
        (c) => ({
          combination: c,
          power: getAveragePower(getPowerBySlot(c)),
        })
      );

      const maxCombinationPower = Math.max(
        ...combinationsWithPower.map((c) => c.power)
      );
      const combinationsToConsider = combinationsWithPower
        .filter((c) => c.power === maxCombinationPower)
        .map((c) => c.combination);

      bestCombination = maxBy(combinationsToConsider, getCombinationScore)!;
    }
  });

  return bestCombination;
};

export default createCharacterDataProcessor(
  ({
    global,
    allCharacterItems,
    manifest,
    itemInstances,
    itemSockets,
    itemPlugObjectives,
    character,
    equippedCharacterItems,
    characterItems,
  }) => {
    const unfilteredItems = mapJoinedItems(
      allCharacterItems,
      manifest,
      itemInstances,
      itemSockets,
      itemPlugObjectives
    );

    const items = unfilteredItems
      // Filter to items that fit into an equipment slot and have a power value
      .filter(hasSlotName)
      .filter(hasPower)
      // Filter to items that are equippable by the current character
      .filter((item) => isItemEquippableByCharacter(item, character));

    const equippedItemInstanceIds = equippedCharacterItems
      .map((item) => item.itemInstanceId)
      .filter(nonNullable);

    const itemsWithScore = items.map((item) => ({
      ...item,
      score: getItemScore(item, equippedItemInstanceIds),
    }));

    const itemsBySlot = groupBy(itemsWithScore, (i) => i.slotName);

    // Get top items by slot, preferring currently equipped items
    let topItemsBySlot: ItemBySlot = mapValues(itemsBySlot, (items) =>
      maxBy(items, (item) => item.score)
    );

    const unrestrictedItemsBySlot: ItemBySlot = { ...topItemsBySlot };

    // These "top items" ignore exotic restrictions, allowing any number
    // of exotics to be equipped at once. Equip labels are used to group
    // exotics, so that only one exotic weapon and one exotic armor piece
    // can be equipped.

    // For each exotic item we find in our "top items", we need to consider
    // an equipment set where no other exotics are equipped in the same group.

    // From these legitimate combinations, we select the one with the highest
    // total item score.

    const bestUniqueCombination = findBestUniqueEquippableCombination(
      itemsBySlot,
      topItemsBySlot
    );

    if (bestUniqueCombination) {
      topItemsBySlot = bestUniqueCombination;
    }

    // Calculate the potential power that this character could reach
    // if they continually infused items in each slot up to their average

    const powerBySlot = getPowerBySlot(unrestrictedItemsBySlot);
    const hasPotential = (powerBySlot: PowerBySlot) => {
      const overallPower = getOverallPower(powerBySlot);
      return Object.values(powerBySlot).some(
        (power) => power < overallPower || power < ITEM_POWER_SOFT_CAP
      );
    };

    // Keep iterating until we have no more potential power to gain
    const potentialPowerBySlot = { ...powerBySlot };
    while (hasPotential(potentialPowerBySlot)) {
      const tempPower = getOverallPower(potentialPowerBySlot);
      Object.keys(potentialPowerBySlot).forEach((slot) => {
        potentialPowerBySlot[slot] = Math.max(
          ITEM_POWER_SOFT_CAP,
          Math.max(tempPower, potentialPowerBySlot[slot]),
          global.accountPower.overallPower
        );
      });
    }

    const potentialOverallPower = getOverallPower(potentialPowerBySlot);

    return {
      topItems: {
        topItemsBySlot,
        ...powerSummary(topItemsBySlot),
      },
      unrestricted: {
        topItemsBySlot: unrestrictedItemsBySlot,
        ...powerSummary(unrestrictedItemsBySlot),
      },
      potentialOverallPower,
    };
  }
);
