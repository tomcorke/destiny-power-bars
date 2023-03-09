import React from "react";

import {
  ITEM_POWER_PINNACLE_CAP,
  ITEM_POWER_POWERFUL_CAP,
  ITEM_POWER_SOFT_CAP,
} from "../../constants";
import { CharacterDisplayBodyWrapper } from "../CharacterDisplay";

import { InterPowerBar } from "./InterPowerBar";

const story = {
  title: "Inter-Power Bar Display",
  decorators: [
    (storyFn: () => JSX.Element) =>
      CharacterDisplayBodyWrapper("rgb(7, 5, 43)", storyFn()),
  ],
};
export default story;

const withMaxSize = (size: number, element: JSX.Element) => (
  <div
    style={{
      width: "100%",
      maxWidth: `${size}px`,
      padding: "2px 5px",
      boxSizing: "border-box",
    }}
  >
    {element}
  </div>
);

export const display = () => withMaxSize(800, <InterPowerBar value={950.8} />);

export const atDifferentSizes = () => (
  <>
    {withMaxSize(200, <InterPowerBar value={950 + 7 / 8} />)}
    {withMaxSize(300, <InterPowerBar value={950 + 7 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={950 + 7 / 8} />)}
  </>
);
export const atDifferentValues = () => (
  <>
    {withMaxSize(400, <InterPowerBar value={953} />)}
    {withMaxSize(400, <InterPowerBar value={953 + 1 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={953 + 2 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={953 + 3 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={953 + 4 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={953 + 5 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={953 + 6 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={953 + 7 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={954} />)}

    {withMaxSize(400, <InterPowerBar value={ITEM_POWER_SOFT_CAP} />)}
    {withMaxSize(400, <InterPowerBar value={ITEM_POWER_POWERFUL_CAP} />)}
    {withMaxSize(400, <InterPowerBar value={ITEM_POWER_PINNACLE_CAP} />)}
  </>
);
