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

export interface SeasonalArtifactData {
  iconPath: string;
  name: string;
  bonusPower: number;
}

export interface CharacterData {
  character: DestinyCharacterComponent;
  className: string;
  overallPower: number;
  topItemBySlot?: ItemBySlot;
  maxItemPower?: number;
  artifactData?: SeasonalArtifactData;
  potentialPowerBySlot?: PowerBySlot;
  potentialOverallPower?: number;
  powerRequiredToReachPotential?: number;
  other?: unknown;
  emblemData?: DestinyInventoryItemDefinition;
}
