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

export interface PowerBySlot {
  [key: string]: number;
}

export interface ItemBySlot {
  [key: string]: JoinedItemDefinition;
}

export interface ItemsBySlot {
  [key: string]: JoinedItemDefinition[];
}

export interface CharacterData {
  id: string;
  className: string;
  character: DestinyCharacterComponent;
  overallPower: number;
  topItemBySlot?: ItemBySlot;
  maxItemPower?: number;
}
