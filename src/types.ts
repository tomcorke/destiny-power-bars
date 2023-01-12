import {
  DestinyCharacterComponent,
  DestinyColor,
  DestinyDisplayPropertiesDefinition,
  DestinyInventoryItemDefinition,
  DestinyItemCategoryDefinition,
  DestinyItemComponent,
  DestinyItemInstanceComponent,
  DestinyObjectiveProgress,
} from "bungie-api-ts/destiny2";

export interface JoinedItemDefinition extends DestinyItemComponent {
  instanceData: DestinyItemInstanceComponent;
  itemDefinition: DestinyInventoryItemDefinition;
  itemCategories?: DestinyItemCategoryDefinition[];
  slotName: string;
  overrideStyleItemIconPath?: string;
  watermarkIconPath?: string;
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
  itemLevel?: number;
  quality?: number;
  isEquipped?: boolean;
}

interface SelectedDestinyItemSocketsComponent {
  sockets: { plugHash: number; isEnabled: boolean }[];
}

interface SelectedJoinedDestinyItemSocketsComponent {
  sockets: {
    plugHash?: number;
    isEnabled: boolean;
    plugDef?: DestinyInventoryItemDefinition;
    plugObjectives?: DestinyObjectiveProgress[];
  }[];
}

interface SelectedDisplayProperties
  extends Partial<DestinyDisplayPropertiesDefinition> {
  icon: string;
}

interface SelectedDestinyInventoryItemDefinition {
  displayProperties: SelectedDisplayProperties;
  itemTypeDisplayName: string;
  sockets?: {
    socketCategories: { socketCategoryHash: number; socketIndexes: number[] }[];
  };
}

export interface SelectedJoinedItemDefinition
  extends DeepPartial<JoinedItemDefinition> {
  instanceData?: SelectedDestinyItemInstanceComponent;
  sockets?: SelectedJoinedDestinyItemSocketsComponent;
  itemDefinition?: SelectedDestinyInventoryItemDefinition;
  itemCategories?: DestinyItemCategoryDefinition[];
  overrideStyleItemHash?: number;
  overrideStyleItemIconPath?: string;
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

  unrestrictedOverallPowerExact?: number;
  unrestrictedOverallPower?: number;
  topUnrestrictedItemBySlot?: SelectedItemBySlot;

  artifactData?: SeasonalArtifactData;
  potentialOverallPower?: number;
  title?: string;
  titleGildedCount?: number;
  other?: unknown;
  hasRedactedEquippableItems?: boolean;
}

export interface FullCharacterData extends PowerBarsCharacterData {
  character: DestinyCharacterComponent;
  topItemBySlot?: ItemBySlot;
}

export type DeepPartial<T> = Partial<{
  [Key in keyof T]: T[Key] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[Key] extends object | null | undefined
    ? DeepPartial<T[Key]>
    : T[Key];
}>;

declare global {
  interface Window {
    characterData: PowerBarsCharacterData[] | undefined;
    clearDestinyManifest: () => void;
  }
}
