import { ACCOUNT_WIDE_CHARACTER_ID, CLASS_NAMES } from "../../../constants";

import { createCharacterDataProcessor } from "./helpers";

export default createCharacterDataProcessor(({ character }) => {
  return {
    className:
      character.characterId === ACCOUNT_WIDE_CHARACTER_ID
        ? "Account"
        : CLASS_NAMES[character.classType]!,
  };
});
