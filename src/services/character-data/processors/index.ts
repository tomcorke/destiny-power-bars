import artifact from "./artifact";
import character from "./character";
import classData from "./class";
import emblem from "./emblem";
import engrams from "./engrams";
import { CharacterDataProcessor, GlobalDataProcessor } from "./helpers";
import redacted from "./redacted";
import title from "./title";
import topItems from "./top-items";

export const globalProcessors = [artifact] satisfies GlobalDataProcessor<any>[];

export const characterProcessors = [
  title,
  classData,
  engrams,
  redacted,
  topItems,
  character,
  emblem,
] satisfies CharacterDataProcessor<any>[];
