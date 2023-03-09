import { CLASS_NAMES } from "../../../constants";

import { createCharacterDataProcessor } from "./helpers";

export default createCharacterDataProcessor(({ character }) => {
  return { className: CLASS_NAMES[character.classType] };
});
