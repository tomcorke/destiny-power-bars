import React from "react";

import { CharacterDisplayBodyWrapper } from "../CharacterDisplay";
import { InterPowerBar } from "./InterPowerBar";

export default {
  title: "Inter-Power Bar Display",
  decorators: [
    (storyFn: () => JSX.Element) =>
      CharacterDisplayBodyWrapper("rgb(7, 5, 43)", storyFn())
  ]
};

const withMaxSize = (size: number, element: JSX.Element) => (
  <div
    style={{
      width: "100%",
      maxWidth: `${size}px`,
      padding: "2px 5px",
      boxSizing: "border-box"
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
    {withMaxSize(400, <InterPowerBar value={950} />)}
    {withMaxSize(400, <InterPowerBar value={950 + 1 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={950 + 2 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={950 + 3 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={950 + 4 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={950 + 5 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={950 + 6 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={950 + 7 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={951} />)}
  </>
);
