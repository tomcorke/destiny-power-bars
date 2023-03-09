import { createCharacterDataProcessor } from "./helpers";

export default createCharacterDataProcessor(({ character }) => {
  return {
    emblem: {
      emblemColor: character.emblemColor,
      emblemBackgroundPath: character.emblemBackgroundPath,
    },
  };
});
