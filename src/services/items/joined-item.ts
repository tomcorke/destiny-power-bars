// Join raw items with item instances, definitions from manifest, socket, and plug objective data

import {
  DestinyItemComponent,
  DestinyItemInstanceComponent,
  DestinyItemPlugObjectivesComponent,
  DestinyItemSocketsComponent,
} from "bungie-api-ts/destiny2";

import { ITEM_BUCKET_SLOTS, LOST_ITEMS_BUCKET } from "../../constants";
import { ManifestData } from "../bungie-api";

import {
  getItemCraftedOrEnhancedState,
  ITEM_CRAFTED_OR_ENHANCED_STATE,
  itemHasDeepsightResonance,
} from "./crafting";
import { nonNullable } from "./filtering";
import { itemIsMasterwork } from "./masterwork";

export const joinItemData = (
  rawItem: DestinyItemComponent & { characterId?: string },
  manifest: ManifestData,
  itemInstance: DestinyItemInstanceComponent,
  itemSockets: DestinyItemSocketsComponent,
  itemPlugObjectives: DestinyItemPlugObjectivesComponent
) => {
  const itemDefinition =
    manifest.DestinyInventoryItemDefinition[rawItem.itemHash];
  if (!itemDefinition) {
    throw new Error(
      `No item definition found for item hash ${rawItem.itemHash}`
    );
  }

  const itemInstanceId = rawItem.itemInstanceId;
  if (!itemInstanceId) {
    throw Error("No item instance ID found");
  }

  const slotName =
    itemDefinition.inventory &&
    ITEM_BUCKET_SLOTS[itemDefinition.inventory.bucketTypeHash];

  const name = itemDefinition.displayProperties.name;

  // Use primary stat for power level, or itemLevel if it is redacted
  const power =
    itemInstance?.primaryStat?.value ||
    (itemDefinition.redacted
      ? itemInstance.itemLevel * 10 + itemInstance.quality
      : undefined);

  const overrideStyleItemDefinition =
    rawItem.overrideStyleItemHash &&
    manifest.DestinyInventoryItemDefinition[rawItem.overrideStyleItemHash];

  const icon = overrideStyleItemDefinition
    ? overrideStyleItemDefinition.displayProperties.icon
    : itemDefinition.displayProperties.icon;

  const watermark =
    itemDefinition.quality?.displayVersionWatermarkIcons?.[0] ||
    itemDefinition.iconWatermark ||
    undefined;

  const ItemCraftedOrEnhancedState = getItemCraftedOrEnhancedState(
    manifest,
    itemDefinition,
    itemSockets
  );

  const isCrafted =
    ItemCraftedOrEnhancedState === ITEM_CRAFTED_OR_ENHANCED_STATE.CRAFTED;
  const isEnhanced =
    ItemCraftedOrEnhancedState === ITEM_CRAFTED_OR_ENHANCED_STATE.ENHANCED;

  const isMasterwork = itemIsMasterwork(
    manifest,
    rawItem,
    itemDefinition,
    itemSockets
  );

  const hasDeepsightResonance = itemHasDeepsightResonance(
    manifest,
    itemSockets,
    itemPlugObjectives
  );

  const equipLabel = itemDefinition.equippingBlock?.uniqueLabel;

  let location = rawItem.location;
  if (rawItem.bucketHash === LOST_ITEMS_BUCKET) {
    // Postmaster is not correctly reported by the API
    // so we need to override it if we know the item is in the right bucket
    location = 4; // ItemLocation.Postmaster
  }

  const itemCategories = itemDefinition.itemCategoryHashes
    ?.map((hash) => manifest.DestinyItemCategoryDefinition[hash])
    .filter(nonNullable);
  const itemType =
    (itemCategories?.[0]?.parentCategoryHashes?.[0] === 1 &&
      itemCategories?.[0]?.displayProperties.name) ||
    itemDefinition.itemTypeDisplayName;

  return {
    itemInstanceId: itemInstanceId,
    slotName,
    name,
    power,
    icon,
    watermark,
    isCrafted,
    isEnhanced,
    isMasterwork,
    hasDeepsightResonance,
    classType: itemDefinition.classType,
    redacted: itemDefinition.redacted,
    canEquip: itemInstance.canEquip,
    cannotEquipReason: itemInstance.cannotEquipReason,
    location,
    equipLabel,
    state: rawItem.state,
    itemType,
    isEquipped: itemInstance.isEquipped,
    characterId: rawItem.characterId,
  };
};

export type JoinedItemDefinition = ReturnType<typeof joinItemData>;

export const mapJoinedItems = (
  items: DestinyItemComponent[],
  manifest: ManifestData,
  itemInstances: Record<string, DestinyItemInstanceComponent>,
  itemSockets: Record<string, DestinyItemSocketsComponent>,
  itemPlugObjectives: Record<string, DestinyItemPlugObjectivesComponent>
) => {
  return items
    .map((item) => {
      if (!item.itemInstanceId) {
        return undefined;
      }
      const itemInstance = itemInstances[item.itemInstanceId];
      const thisItemSockets = itemSockets[item.itemInstanceId];
      const thisItemPlugObjectives = itemPlugObjectives[item.itemInstanceId];

      if(!itemInstance) { return undefined; }

      return joinItemData(
        item,
        manifest,
        itemInstance,
        thisItemSockets,
        thisItemPlugObjectives
      );
    })
    .filter(nonNullable);
};
