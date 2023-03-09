import { createCharacterDataProcessor } from "./helpers";

export default createCharacterDataProcessor(({ character }) => {
  return {
    characterId: character.characterId,
    membershipId: character.membershipId,
    membershipType: character.membershipType,
  };
});
