import React from "react";

import { CharacterDisplayBodyWrapper } from "../CharacterDisplay";
import { PowerDetails } from "./PowerDetails";

export default {
  title: "Power Details",
  decorators: [
    (storyFn: () => JSX.Element) =>
      CharacterDisplayBodyWrapper("rgb(7, 5, 43)", storyFn()),
  ],
};

export const withFullData = () => (
  <PowerDetails
    overallPowerExact={965 + 5 / 8}
    overallPower={965}
    artifactData={{
      bonusPower: 10,
      name: "Test Artifact",
      iconPath:
        "/common/destiny2_content/icons/ea70febf637a93c0b224ce91d563ac18.jpg",
      progressToNextLevel: 100,
      nextLevelAt: 120,
    }}
  />
);

export const withoutArtifactData = () => (
  <PowerDetails overallPowerExact={965 + 5 / 8} overallPower={965} />
);
