import React from "react";

import {
  ITEM_POWER_PINNACLE_CAP,
  ITEM_POWER_POWERFUL_CAP,
  ITEM_POWER_SOFT_CAP,
} from "../../constants";
import { CharacterDisplayBodyWrapper } from "../CharacterDisplay";
import { PowerHints } from "./PowerHints";

const story = {
  title: "Power Hints",
  decorators: [
    (storyFn: () => JSX.Element) =>
      CharacterDisplayBodyWrapper("rgb(7, 5, 43)", storyFn()),
  ],
};
export default story;

export const display = () => (
  <>
    <PowerHints
      minPower={ITEM_POWER_PINNACLE_CAP - 10}
      overallPowerExact={ITEM_POWER_SOFT_CAP - 10}
      overallPower={ITEM_POWER_SOFT_CAP - 10}
      potentialOverallPower={ITEM_POWER_SOFT_CAP}
    />
    <PowerHints
      minPower={ITEM_POWER_PINNACLE_CAP - 10}
      overallPowerExact={ITEM_POWER_POWERFUL_CAP - 10}
      overallPower={ITEM_POWER_POWERFUL_CAP - 10}
      potentialOverallPower={ITEM_POWER_POWERFUL_CAP - 10}
    />
    <PowerHints
      minPower={ITEM_POWER_PINNACLE_CAP - 5}
      overallPowerExact={ITEM_POWER_PINNACLE_CAP - 5}
      overallPower={ITEM_POWER_PINNACLE_CAP - 5}
      potentialOverallPower={ITEM_POWER_PINNACLE_CAP - 5}
    />
  </>
);

export const belowSoftCap = () => (
  <PowerHints
    minPower={ITEM_POWER_PINNACLE_CAP - 10}
    overallPowerExact={ITEM_POWER_SOFT_CAP - 10}
    overallPower={ITEM_POWER_SOFT_CAP - 10}
    potentialOverallPower={ITEM_POWER_SOFT_CAP}
  />
);

export const belowLegendaryPower = () => (
  <PowerHints
    minPower={ITEM_POWER_PINNACLE_CAP - 50}
    overallPowerExact={ITEM_POWER_SOFT_CAP - 10}
    overallPower={ITEM_POWER_SOFT_CAP - 10}
    potentialOverallPower={ITEM_POWER_SOFT_CAP}
  />
);

export const belowPowerfulCap = () => (
  <PowerHints
    minPower={ITEM_POWER_PINNACLE_CAP - 10}
    overallPowerExact={ITEM_POWER_POWERFUL_CAP - 10}
    overallPower={ITEM_POWER_POWERFUL_CAP - 10}
    potentialOverallPower={ITEM_POWER_POWERFUL_CAP - 10}
  />
);

export const belowPowerfulCapWithPotential = () => (
  <PowerHints
    minPower={ITEM_POWER_PINNACLE_CAP - 10}
    overallPowerExact={ITEM_POWER_POWERFUL_CAP - 10}
    overallPower={ITEM_POWER_POWERFUL_CAP - 10}
    potentialOverallPower={ITEM_POWER_POWERFUL_CAP - 9}
  />
);

export const belowPowerfulCapWithPotentialAndEngrams = () => (
  <PowerHints
    minPower={ITEM_POWER_POWERFUL_CAP - 12}
    overallPowerExact={ITEM_POWER_POWERFUL_CAP - 10}
    overallPower={ITEM_POWER_POWERFUL_CAP - 10}
    potentialOverallPower={ITEM_POWER_POWERFUL_CAP - 9}
    engrams={[
      {
        name: "Fake Engram",
        power: ITEM_POWER_POWERFUL_CAP - 10,
        icon: "/common/destiny2_content/icons/7eea47cc31d9b065213f85169e668b6e.png",
      },
      {
        name: "Fake Engram",
        power: ITEM_POWER_POWERFUL_CAP - 19,
        icon: "/common/destiny2_content/icons/7eea47cc31d9b065213f85169e668b6e.png",
      },
      {
        name: "Fake Engram",
        power: ITEM_POWER_POWERFUL_CAP - 29,
        icon: "/common/destiny2_content/icons/7eea47cc31d9b065213f85169e668b6e.png",
      },
    ]}
  />
);

export const belowPowerfulCapWithPotentialAndHighEngrams = () => (
  <PowerHints
    minPower={ITEM_POWER_POWERFUL_CAP - 12}
    overallPowerExact={ITEM_POWER_POWERFUL_CAP - 10}
    overallPower={ITEM_POWER_POWERFUL_CAP - 10}
    potentialOverallPower={ITEM_POWER_POWERFUL_CAP - 9}
    engrams={[
      {
        name: "Fake Engram",
        power: ITEM_POWER_POWERFUL_CAP - 10,
        icon: "/common/destiny2_content/icons/7eea47cc31d9b065213f85169e668b6e.png",
      },
      {
        name: "Fake Engram",
        power: ITEM_POWER_POWERFUL_CAP + 1,
        icon: "/common/destiny2_content/icons/7eea47cc31d9b065213f85169e668b6e.png",
      },
      {
        name: "Fake Engram",
        power: ITEM_POWER_POWERFUL_CAP + 2,
        icon: "/common/destiny2_content/icons/7eea47cc31d9b065213f85169e668b6e.png",
      },
      {
        name: "Fake Engram",
        power: ITEM_POWER_POWERFUL_CAP - 12,
        icon: "/common/destiny2_content/icons/7eea47cc31d9b065213f85169e668b6e.png",
      },
      {
        name: "Fake Engram",
        power: ITEM_POWER_POWERFUL_CAP - 13,
        icon: "/common/destiny2_content/icons/7eea47cc31d9b065213f85169e668b6e.png",
      },
    ]}
  />
);

export const belowPinnacleCap = () => (
  <PowerHints
    minPower={ITEM_POWER_PINNACLE_CAP - 5}
    overallPowerExact={ITEM_POWER_PINNACLE_CAP - 5}
    overallPower={ITEM_POWER_PINNACLE_CAP - 5}
    potentialOverallPower={ITEM_POWER_PINNACLE_CAP - 5}
  />
);

export const belowPinnacleCapWithPotential = () => (
  <PowerHints
    minPower={ITEM_POWER_PINNACLE_CAP - 5}
    overallPowerExact={ITEM_POWER_PINNACLE_CAP - 5}
    overallPower={ITEM_POWER_PINNACLE_CAP - 5}
    potentialOverallPower={ITEM_POWER_PINNACLE_CAP - 4}
  />
);

export const abovePinnacleCap = () => (
  <PowerHints
    minPower={ITEM_POWER_PINNACLE_CAP + 5}
    overallPowerExact={ITEM_POWER_PINNACLE_CAP + 5}
    overallPower={ITEM_POWER_PINNACLE_CAP + 5}
    potentialOverallPower={ITEM_POWER_PINNACLE_CAP + 5}
  />
);
