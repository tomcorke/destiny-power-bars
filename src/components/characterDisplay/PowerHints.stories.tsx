import React from "react";

import { CharacterDisplayBodyWrapper } from "../CharacterDisplay";
import { PowerHints } from "./PowerHints";

export default {
  title: "Power Hints",
  decorators: [
    (storyFn: () => JSX.Element) =>
      CharacterDisplayBodyWrapper("rgb(7, 5, 43)", storyFn())
  ]
};

export const display = () => (
  <>
    <PowerHints
      overallPowerExact={890}
      overallPower={890}
      potentialOverallPower={900}
    />
    <PowerHints
      overallPowerExact={930}
      overallPower={930}
      potentialOverallPower={930}
    />
    <PowerHints
      overallPowerExact={955}
      overallPower={955}
      potentialOverallPower={955}
    />
  </>
);

export const below900Power = () => (
  <PowerHints
    overallPowerExact={890}
    overallPower={890}
    potentialOverallPower={900}
  />
);

export const below950Power = () => (
  <PowerHints
    overallPowerExact={930}
    overallPower={930}
    potentialOverallPower={930}
  />
);

export const below950PowerWithPotential = () => (
  <PowerHints
    overallPowerExact={930}
    overallPower={930}
    potentialOverallPower={931}
  />
);

export const below960Power = () => (
  <PowerHints
    overallPowerExact={955}
    overallPower={955}
    potentialOverallPower={955}
  />
);

export const below960PowerWithPotential = () => (
  <PowerHints
    overallPowerExact={955}
    overallPower={955}
    potentialOverallPower={956}
  />
);

export const above960Power = () => (
  <PowerHints
    overallPowerExact={965}
    overallPower={965}
    potentialOverallPower={965}
  />
);
