import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import maxBy from "lodash/maxBy";
import sumBy from "lodash/sumBy";
import { hasPower, hasSlotName } from "../../items/filtering";
import { JoinedItemDefinition, mapJoinedItems } from "../../items/joined-item";
import { ITEM_SLOT_BUCKETS } from "../../../constants";
import { getItemScore } from "../../items/scoring";

import { createGlobalDataProcessor } from "./helpers";

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

export default createGlobalDataProcessor(
  ({
    allCharacterItems,
    manifest,
    itemInstances,
    itemSockets,
    itemPlugObjectives,
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
      .filter(hasPower);
    // Unlike per-character top items, we don't care about filtering to the current charater - this is a global top list.

    const itemsWithScore = items.map((item) => ({
      ...item,
      score: getItemScore(item, []), // Don't pass in any priority item instance IDs because we don't care.
    }));

    const itemsBySlot = groupBy(itemsWithScore, (i) => i.slotName);

    // Get top items by slot, preferring currently equipped items
    let topItemsBySlot: ItemBySlot = mapValues(itemsBySlot, (items) =>
      maxBy(items, (item) => item.score)
    );

    const powerBySlot = getPowerBySlot(topItemsBySlot);

    return {
      accountPower: powerSummary(topItemsBySlot),
      accountPowerBySlot: powerBySlot,
    };
  }
);
