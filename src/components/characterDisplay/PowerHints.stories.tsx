import React from "react";

import {
  ITEM_POWER_PINNACLE_CAP,
  ITEM_POWER_POWERFUL_CAP,
  ITEM_POWER_SOFT_CAP
} from "../../constants";
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
      overallPowerExact={ITEM_POWER_SOFT_CAP - 10}
      overallPower={ITEM_POWER_SOFT_CAP - 10}
      potentialOverallPower={ITEM_POWER_SOFT_CAP}
    />
    <PowerHints
      overallPowerExact={ITEM_POWER_POWERFUL_CAP - 10}
      overallPower={ITEM_POWER_POWERFUL_CAP - 10}
      potentialOverallPower={ITEM_POWER_POWERFUL_CAP - 10}
    />
    <PowerHints
      overallPowerExact={ITEM_POWER_PINNACLE_CAP - 5}
      overallPower={ITEM_POWER_PINNACLE_CAP - 5}
      potentialOverallPower={ITEM_POWER_PINNACLE_CAP - 5}
    />
  </>
);

export const belowSoftCap = () => (
  <PowerHints
    overallPowerExact={ITEM_POWER_SOFT_CAP - 10}
    overallPower={ITEM_POWER_SOFT_CAP - 10}
    potentialOverallPower={ITEM_POWER_SOFT_CAP}
  />
);

export const belowPowerfulCap = () => (
  <PowerHints
    overallPowerExact={ITEM_POWER_POWERFUL_CAP - 10}
    overallPower={ITEM_POWER_POWERFUL_CAP - 10}
    potentialOverallPower={ITEM_POWER_POWERFUL_CAP - 10}
  />
);

export const belowPowerfulCapWithPotential = () => (
  <PowerHints
    overallPowerExact={ITEM_POWER_POWERFUL_CAP - 10}
    overallPower={ITEM_POWER_POWERFUL_CAP - 10}
    potentialOverallPower={ITEM_POWER_POWERFUL_CAP - 9}
  />
);

export const belowPinnacleCap = () => (
  <PowerHints
    overallPowerExact={ITEM_POWER_PINNACLE_CAP - 5}
    overallPower={ITEM_POWER_PINNACLE_CAP - 5}
    potentialOverallPower={ITEM_POWER_PINNACLE_CAP - 5}
  />
);

export const belowPinnacleCapWithPotential = () => (
  <PowerHints
    overallPowerExact={ITEM_POWER_PINNACLE_CAP - 5}
    overallPower={ITEM_POWER_PINNACLE_CAP - 5}
    potentialOverallPower={ITEM_POWER_PINNACLE_CAP - 4}
  />
);

export const abovePinnacleCap = () => (
  <PowerHints
    overallPowerExact={ITEM_POWER_PINNACLE_CAP + 5}
    overallPower={ITEM_POWER_PINNACLE_CAP + 5}
    potentialOverallPower={ITEM_POWER_PINNACLE_CAP + 5}
  />
);
