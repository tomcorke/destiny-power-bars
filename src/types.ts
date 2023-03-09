import {
  DestinyCharacterComponent,
  DestinyColor,
} from "bungie-api-ts/destiny2";

export interface PowerBySlot {
  [key: string]: number;
}

export interface SeasonalArtifactData {
  iconPath: string;
  name: string;
  bonusPower: number;
  progressToNextLevel: number;
  nextLevelAt: number;
}

export type DeepPartial<T> = Partial<{
  [Key in keyof T]: T[Key] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[Key] extends object | null | undefined
    ? DeepPartial<T[Key]>
    : T[Key];
}>;
