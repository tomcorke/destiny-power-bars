import { describe, expect, it } from "vitest";

import { CharacterProcessorContext } from "..";
import {
  ACCOUNT_WIDE_CHARACTER_ID,
  ITEM_SLOT_BUCKETS,
} from "../../../constants";

import accountPower from "./account-power";
import topItems from "./top-items";

const createContext = () => {
  const slots = Object.values(ITEM_SLOT_BUCKETS);
  const items = [...slots, slots[0], slots[1]].map((bucketHash, index) => ({
    itemHash: index,
    itemInstanceId: String(index),
    bucketHash,
    location: 1,
    state: 0,
  }));
  const manifest = {
    DestinyInventoryItemDefinition: Object.fromEntries(
      items.map((item, index) => [
        item.itemHash,
        {
          displayProperties: { name: `Item ${index}` },
          inventory: { bucketTypeHash: item.bucketHash },
          equippingBlock: { uniqueLabel: index >= 8 ? "exotic-weapon" : "" },
          classType: 3,
        },
      ])
    ),
    DestinyItemCategoryDefinition: {},
  };
  const itemInstances = Object.fromEntries(
    items.map((item, index) => [
      item.itemInstanceId,
      { primaryStat: { value: index >= 8 ? 2010 : 2000 }, canEquip: true },
    ])
  );

  return {
    allCharacterItems: items,
    manifest,
    itemInstances,
    itemSockets: {},
    itemPlugObjectives: {},
    characterId: ACCOUNT_WIDE_CHARACTER_ID,
    equippedCharacterItems: [],
    global: { accountPower: { overallPower: 2002 } },
  } as unknown as CharacterProcessorContext;
};

describe("Lodash-backed power aggregation", () => {
  it("groups slots and maps their highest-scoring items into account power", () => {
    const { data } = accountPower(createContext());
    expect(data.accountPowerBySlot).toEqual({
      kinetic: 2010,
      energy: 2010,
      power: 2000,
      head: 2000,
      gloves: 2000,
      chest: 2000,
      legs: 2000,
      classItem: 2000,
    });
    expect(data.accountPower).toEqual({
      minPower: 2000,
      averagePower: 2002.5,
      overallPower: 2002,
    });
  });

  it("selects a valid exotic combination while retaining unrestricted power", () => {
    const { data } = topItems(createContext());
    const selected = Object.values(data.topItems.topItemsBySlot);
    expect(selected.filter((item) => item?.equipLabel)).toHaveLength(1);
    expect(data.topItems.averagePower).toBe(2001.25);
    expect(data.unrestricted.averagePower).toBe(2002.5);
    expect(data.potentialOverallPower).toBeGreaterThanOrEqual(2002);
  });

  it("prefers an equipped item when power is tied", () => {
    const context = createContext();
    context.itemInstances["8"] = {
      ...context.itemInstances["8"]!,
      primaryStat: { ...context.itemInstances["8"]!.primaryStat!, value: 2000 },
    };
    context.equippedCharacterItems = [context.allCharacterItems[8]!];
    const { data } = topItems(context);
    expect(data.unrestricted.topItemsBySlot.kinetic?.itemInstanceId).toBe("8");
  });
});
