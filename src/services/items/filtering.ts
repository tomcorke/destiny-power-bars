import { DestinyCharacterComponent } from "bungie-api-ts/destiny2";

import { CLASS_TYPE_ALL } from "../../constants";

import { JoinedItemDefinition } from "./joined-item";

export const nonNullable = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

export const isItemEquippableByCharacter = (
  item: JoinedItemDefinition,
  character: DestinyCharacterComponent
) => {
  if (
    item.classType !== CLASS_TYPE_ALL &&
    item.classType !== character.classType &&
    !item.redacted
  ) {
    return false;
  }
  if (item.cannotEquipReason === 16) {
    return true;
  } // Only reason is that it's in your vault
  if (item.canEquip) {
    return true;
  } // If the game says we can equip it, let's believe it
  // Let's ignore the rest for now
  return true;
};
