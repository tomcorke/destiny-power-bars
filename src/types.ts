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
  progressToNextLevel: number;
  nextLevelAt: number;
}

export interface CharacterData {
  character: DestinyCharacterComponent;
  className: string;
  overallPowerExact: number;
  overallPower: number;
  topItemBySlot?: ItemBySlot;
  maxItemPower?: number;
  artifactData?: SeasonalArtifactData;
  potentialOverallPower?: number;
  other?: unknown;
  emblemData?: DestinyInventoryItemDefinition;
}
