import React from "react";

import { InterPowerBar } from "./InterPowerBar";

export default {
  title: "Inter-Power Bar Display"
};

const withMaxSize = (size: number, element: JSX.Element) => (
  <div style={{ width: "100%", maxWidth: `${size}px` }}>{element}</div>
);

export const display = () => <InterPowerBar value={950.8} />;

export const atDifferentSizes = () => (
  <>
    {withMaxSize(200, <InterPowerBar value={950 + 7 / 8} />)}
    {withMaxSize(300, <InterPowerBar value={950 + 7 / 8} />)}
    {withMaxSize(400, <InterPowerBar value={950 + 7 / 8} />)}
    {withMaxSize(500, <InterPowerBar value={950 + 7 / 8} />)}
    {withMaxSize(600, <InterPowerBar value={950 + 7 / 8} />)}
    {withMaxSize(700, <InterPowerBar value={950 + 7 / 8} />)}
    {withMaxSize(800, <InterPowerBar value={950 + 7 / 8} />)}
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
