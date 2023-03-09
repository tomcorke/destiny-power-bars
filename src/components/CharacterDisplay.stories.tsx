import React from "react";

import CharacterDisplay from "./CharacterDisplay";

const story = { title: "Character Display" };
export default story;

export const realisticTitan = () => <CharacterDisplay characterId={"1"} />;

export const mockWarlock = () => <CharacterDisplay characterId={"1"} />;
