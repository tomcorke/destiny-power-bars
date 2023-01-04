import { SelectedJoinedItemDefinition } from "../types";
import { PlugCategoryHashes } from "../data/d2ai-module/generated-enums";

const CRAFTABLE_SOCKET_CATEGORY_HASH = 3583996951;
const SHAPED_WEAPON_PLUG_HASH = 4029346515;

export const isCrafted = (item: SelectedJoinedItemDefinition) => {
  //   const itemCraftableSocketCategory =
  //     item.itemDefinition?.sockets?.socketCategories.find(
  //       (c) => c.socketCategoryHash === CRAFTABLE_SOCKET_CATEGORY_HASH
  //     );

  //   if (!itemCraftableSocketCategory) {
  //     return false;
  //   }

  //   const craftedSocketIndex = itemCraftableSocketCategory.socketIndexes[0];
  //   if (craftedSocketIndex === undefined) {
  //     return false;
  //   }

  //   const plugInSocket = item.sockets?.sockets[craftedSocketIndex];
  //   if (!plugInSocket) {
  //     return false;
  //   }

  //   return plugInSocket.isEnabled;

  return item.sockets?.sockets.some(
    (plug) => plug.plugHash === SHAPED_WEAPON_PLUG_HASH && plug.isEnabled
  );
};

export const hasIncompleteDeepsightResonance = (
  item: SelectedJoinedItemDefinition
) => {
  return item.sockets?.sockets.some(
    (plug) =>
      plug.plugHash === PlugCategoryHashes.CraftingPlugsWeaponsModsMemories
  );
};
