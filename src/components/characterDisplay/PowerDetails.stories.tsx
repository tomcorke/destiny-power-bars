import React from "react";

import { CharacterDisplayBodyWrapper } from "../CharacterDisplay";

import { PowerDetails } from "./PowerDetails";

const story = {
  title: "Power Details",
  decorators: [
    (storyFn: () => JSX.Element) =>
      CharacterDisplayBodyWrapper("rgb(7, 5, 43)", storyFn()),
  ],
};
export default story;

export const withFullData = () => <PowerDetails characterId={"1"} />;

export const withoutArtifactData = () => <PowerDetails characterId={"1"} />;
