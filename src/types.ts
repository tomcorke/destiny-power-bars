import {
  DamageType,
  DestinyCharacterComponent,
  DestinyColor,
  DestinyDisplayPropertiesDefinition,
  DestinyInventoryItemDefinition,
  DestinyItemComponent,
  DestinyItemInstanceComponent,
  DestinyStat,
  ItemState
} from "bungie-api-ts/destiny2";

export interface JoinedItemDefinition extends DestinyItemComponent {
  instanceData: DestinyItemInstanceComponent;
  itemDefinition: DestinyInventoryItemDefinition;
  slotName: string;
}

export interface PowerBySlot {
  [key: string]: number;
}

export interface ItemBySlot {
  [key: string]: JoinedItemDefinition | undefined;
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

export interface SelectedDestinyCharacterComponent
  extends Partial<DestinyCharacterComponent> {
  membershipType: number;
  membershipId: string;
  characterId: string;

  emblemColor: DestinyColor;
  emblemBackgroundPath: string;
}

interface SelectedDestinyStat {
  value: number;
}

interface SelectedDestinyItemInstanceComponent {
  primaryStat?: SelectedDestinyStat;
}

interface SelectedDisplayProperties
  extends Partial<DestinyDisplayPropertiesDefinition> {
  icon: string;
}

interface SelectedDestinyInventoryItemDefinition {
  displayProperties: SelectedDisplayProperties;
}

export interface SelectedJoinedItemDefinition {
  itemHash: number;
  instanceData?: SelectedDestinyItemInstanceComponent;
  itemDefinition?: SelectedDestinyInventoryItemDefinition;
  state?: ItemState;
}

export interface SelectedItemBySlot {
  [key: string]: SelectedJoinedItemDefinition | undefined;
}

export interface PowerBarsCharacterData {
  character: SelectedDestinyCharacterComponent;
  className: string;
  overallPowerExact: number;
  overallPower: number;
  topItemBySlot?: SelectedItemBySlot;
  artifactData?: SeasonalArtifactData;
  potentialOverallPower?: number;
  title?: string;
  other?: unknown;
}

export interface FullCharacterData extends PowerBarsCharacterData {
  character: DestinyCharacterComponent;
  topItemBySlot?: ItemBySlot;
}
