import {
  DestinyCharacterComponent,
  DestinyInventoryItemDefinition,
  DestinyItemComponent,
  DestinyItemInstanceComponent
} from "bungie-api-ts/destiny2";

export type JoinedItemDefinition = DestinyItemComponent & {
  instanceData: DestinyItemInstanceComponent;
  itemDefinition: DestinyInventoryItemDefinition;
  slotName: string;
};

export interface CharacterData {
  id: string;
  className: string;
  character: DestinyCharacterComponent;
  overallPower: number;
  topItemsBySlot?: { [key: string]: JoinedItemDefinition };
}

export interface PowerBySlot {
  [key: string]: number;
}
