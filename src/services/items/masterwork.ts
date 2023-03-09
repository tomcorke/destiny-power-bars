import {
  DestinyInventoryItemDefinition,
  DestinyItemComponent,
  DestinyItemSocketsComponent,
} from "bungie-api-ts/destiny2";

import { ManifestData } from "../bungie-api";

import { nonNullable } from "./filtering";

// From destiny-api-ts ItemState.Masterwork
const ITEM_STATE_MASTERWORK = 4;
// ItemCategoryHashes.Weapon
const ITEM_CATEGORY_HASH_WEAPON = 1;
// PlugCategoryHashes.Frames
const PLUG_CATEGORY_HASH_FRAMES = 7906839;
// TierType.Common
const TIER_TYPE_COMMON = 3;

export const itemIsMasterwork = (
  manifest: ManifestData,
  item: DestinyItemComponent,
  itemDefinition: DestinyInventoryItemDefinition,
  sockets: DestinyItemSocketsComponent
) => {
  // tslint:disable-next-line:no-bitwise
  if (item.state && item.state & ITEM_STATE_MASTERWORK) {
    return true;
  }

  const isWeapon = itemDefinition.itemCategoryHashes?.some(
    (hash) => hash === ITEM_CATEGORY_HASH_WEAPON
  );

  if (isWeapon) {
    const plugDefinitions =
      sockets?.sockets
        ?.map((s) =>
          s.plugHash
            ? manifest.DestinyInventoryItemDefinition[s.plugHash]
            : undefined
        )
        .filter(nonNullable) || [];

    const enhancedPerks =
      plugDefinitions.filter(
        (plugDef) =>
          plugDef.plug?.plugCategoryHash === PLUG_CATEGORY_HASH_FRAMES &&
          plugDef.inventory?.tierType === TIER_TYPE_COMMON
      ).length || 0;

    if (enhancedPerks >= 2) {
      return true;
    }
  }

  return false;
};
