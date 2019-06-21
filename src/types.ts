import { DestinyItemComponent, DestinyItemInstanceComponent, DestinyInventoryItemDefinition, DestinyCharacterComponent } from "bungie-api-ts/destiny2";

export type JoinedItemDefinition = DestinyItemComponent & {
  instanceData?: DestinyItemInstanceComponent
  itemDefinition?: DestinyInventoryItemDefinition
}

export interface CharacterData {
  id: string
  className: string
  character: DestinyCharacterComponent
  equippableItemsBySlot?: { [key: string]: JoinedItemDefinition[] }
  maxPowerBySlot: PowerBySlot
  overallPower: number
  bestItemBySlot?: { [key: string]: JoinedItemDefinition }
}

export interface PowerBySlot { [key: string]: number }