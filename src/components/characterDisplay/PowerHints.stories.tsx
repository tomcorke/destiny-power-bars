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
    <PowerHints characterId={"1"} />
    <PowerHints characterId={"1"} />
    <PowerHints characterId={"1"} />
  </>
);

export const belowSoftCap = () => <PowerHints characterId={"1"} />;

export const belowLegendaryPower = () => <PowerHints characterId={"1"} />;

export const belowPowerfulCap = () => <PowerHints characterId={"1"} />;

export const belowPowerfulCapWithPotential = () => (
  <PowerHints characterId={"1"} />
);

export const belowPowerfulCapWithPotentialAndEngrams = () => (
  <PowerHints characterId={"1"} />
);

export const belowPowerfulCapWithPotentialAndHighEngrams = () => (
  <PowerHints characterId={"1"} />
);

export const belowPinnacleCap = () => <PowerHints characterId={"1"} />;

export const belowPinnacleCapWithPotential = () => (
  <PowerHints characterId={"1"} />
);

export const abovePinnacleCap = () => <PowerHints characterId={"1"} />;
