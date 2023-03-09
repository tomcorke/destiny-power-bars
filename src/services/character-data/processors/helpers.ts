import {
  DestinyInventoryItemDefinition,
  DestinyItemInstanceComponent,
} from "bungie-api-ts/destiny2";

import { GlobalProcessorContext, CharacterProcessorContext } from "..";

export type GlobalDataProcessor<T extends {}> = (
  context: GlobalProcessorContext
) => { data: T };

export const createGlobalDataProcessor = <T extends {}>(
  fn: (context: GlobalProcessorContext) => T
) => {
  return (context: GlobalProcessorContext) => {
    return {
      data: fn(context),
    };
  };
};

export type CharacterDataProcessor<T extends {}> = (
  context: CharacterProcessorContext
) => { data: T };

export const createCharacterDataProcessor = <T extends {}>(
  fn: (context: CharacterProcessorContext) => T
) => {
  return (context: CharacterProcessorContext) => {
    return {
      data: fn(context),
    };
  };
};

export const itemHasDefinition = <
  T extends { definition?: DestinyInventoryItemDefinition }
>(
  item: T
): item is T & { definition: DestinyInventoryItemDefinition } =>
  item.definition !== undefined;

export const itemHasInstanceData = <
  T extends { instanceData?: DestinyItemInstanceComponent }
>(
  item: T
): item is T & { instanceData: DestinyItemInstanceComponent } =>
  item.instanceData !== undefined;
