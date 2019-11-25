import React from "react";

import { CharacterData } from "../types";
import CharacterDisplay from "./CharacterDisplay";
import characterDisplayData from "./CharacterDisplayMockData.json";

export default { title: "Character Display" };

export const realisticTitan = () => (
  <CharacterDisplay data={(characterDisplayData as unknown) as CharacterData} />
);
