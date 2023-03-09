import {
  DestinyItemPlugObjectivesComponent,
  DestinyItemSocketsComponent,
} from "bungie-api-ts/destiny2";

import { PlugCategoryHashes } from "../../data/d2ai-module/generated-enums";
import { ManifestData } from "../bungie-api";

/*
const CRAFTABLE_SOCKET_CATEGORY_HASH = 3583996951;
const SHAPED_WEAPON_PLUG_HASH = 4029346515;
const DEEPSIGHT_RESONANCE_PLUG_HASH = 213377779;

  CraftingPlugsFrameIdentifiers = 3425085882,
  CraftingPlugsWeaponsModsExtractors = 3520412733,
  CraftingPlugsWeaponsModsMemories = 2748073883,
  CraftingRecipesEmptySocket = 3618704867,
*/

export const itemIsCrafted = (
  manifest: ManifestData,
  sockets?: DestinyItemSocketsComponent
) => {
  const craftingSocket = sockets?.sockets?.find((s) => {
    if (!s.plugHash) {
      return null;
    }
    const plugDefinition = manifest.DestinyInventoryItemDefinition[s.plugHash];

    return (
      plugDefinition &&
      plugDefinition?.plug?.plugCategoryHash ===
        PlugCategoryHashes.CraftingPlugsFrameIdentifiers
    );
  });

  if (craftingSocket) {
    return craftingSocket.isEnabled;
  }

  return false;
};

export const itemHasDeepsightResonance = (
  manifest: ManifestData,
  sockets?: DestinyItemSocketsComponent,
  plugObjectives?: DestinyItemPlugObjectivesComponent
) => {
  const resonanceSocket = sockets?.sockets?.find((s) => {
    if (!s.plugHash) {
      return null;
    }
    const plugDefinition = manifest.DestinyInventoryItemDefinition[s.plugHash];

    return (
      plugDefinition?.plug?.plugCategoryHash ===
      PlugCategoryHashes.CraftingPlugsWeaponsModsMemories
    );
  });

  if (resonanceSocket && resonanceSocket.plugHash) {
    const objective =
      plugObjectives?.objectivesPerPlug[resonanceSocket.plugHash]?.[0];
    return objective !== undefined;
  }

  return false;
};
