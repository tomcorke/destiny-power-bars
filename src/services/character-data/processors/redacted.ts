import { createCharacterDataProcessor } from "./helpers";

export default createCharacterDataProcessor(
  ({ allCharacterItems, manifest }) => {
    const hasRedactedEquippableItems = allCharacterItems.some((item) => {
      const itemDefinition =
        manifest.DestinyInventoryItemDefinition[item.itemHash];
      return itemDefinition?.redacted && itemDefinition?.equippable;
    });

    return { hasRedactedEquippableItems };
  }
);
