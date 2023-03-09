import {
  BucketHashes,
  ItemCategoryHashes,
} from "../../../data/d2ai-module/generated-enums";

import {
  createCharacterDataProcessor,
  itemHasDefinition,
  itemHasInstanceData,
} from "./helpers";

export default createCharacterDataProcessor(
  ({ characterItems, manifest, itemInstances }) => {
    const engrams = characterItems
      .map((item) => {
        const definition =
          manifest.DestinyInventoryItemDefinition[item.itemHash];
        const instanceData = item.itemInstanceId
          ? itemInstances[item.itemInstanceId]
          : undefined;
        return { item, definition, instanceData };
      })
      .filter(itemHasDefinition)
      .filter(itemHasInstanceData)
      .filter(
        ({ definition }) =>
          definition.itemCategoryHashes?.includes(ItemCategoryHashes.Engrams) ||
          definition.inventory?.bucketTypeHash === BucketHashes.Engrams
      )
      .map((engram) => ({
        name: engram.definition.displayProperties.name,
        power: engram.instanceData.itemLevel * 10 + engram.instanceData.quality,
        icon: engram.definition.displayProperties.icon,
      }));

    return { engrams };
  }
);
