import artifact from "./artifact";
import classData from "./class";
import engrams from "./engrams";
import { CharacterDataProcessor, GlobalDataProcessor } from "./helpers";
import redacted from "./redacted";
import title from "./title";

export const globalProcessors = [artifact] satisfies GlobalDataProcessor<any>[];

export const characterProcessors = [
  title,
  classData,
  engrams,
  redacted,
] satisfies CharacterDataProcessor<any>[];
