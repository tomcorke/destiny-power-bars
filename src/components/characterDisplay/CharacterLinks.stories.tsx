import React from "react";

import { CharacterDisplayBodyWrapper } from "../CharacterDisplay";
import { CharacterLinks } from "./CharacterLinks";

export default {
  title: "Character Links",
  decorators: [
    (storyFn: () => JSX.Element) =>
      CharacterDisplayBodyWrapper(
        "rgb(7, 5, 43)",
        <>
          {storyFn()}
          <div>&nbsp;</div>
        </>
      )
  ]
};

export const display = () => (
  <CharacterLinks
    membershipType={3}
    membershipId={"4611686018467368793"}
    characterId={"2305843009300185671"}
  />
);
