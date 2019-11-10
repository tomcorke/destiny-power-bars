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
    {withMaxSize(200, <InterPowerBar value={950.7} />)}
    {withMaxSize(300, <InterPowerBar value={950.7} />)}
    {withMaxSize(400, <InterPowerBar value={950.7} />)}
    {withMaxSize(500, <InterPowerBar value={950.7} />)}
    {withMaxSize(600, <InterPowerBar value={950.7} />)}
    {withMaxSize(700, <InterPowerBar value={950.7} />)}
  </>
);
export const atDifferentValues = () => (
  <>
    {withMaxSize(500, <InterPowerBar value={950} />)}
    {withMaxSize(500, <InterPowerBar value={950.1} />)}
    {withMaxSize(500, <InterPowerBar value={950.2} />)}
    {withMaxSize(500, <InterPowerBar value={950.3} />)}
    {withMaxSize(500, <InterPowerBar value={950.4} />)}
    {withMaxSize(500, <InterPowerBar value={950.5} />)}
    {withMaxSize(500, <InterPowerBar value={950.6} />)}
    {withMaxSize(500, <InterPowerBar value={950.7} />)}
    {withMaxSize(500, <InterPowerBar value={950.8} />)}
    {withMaxSize(500, <InterPowerBar value={950.9} />)}
    {withMaxSize(500, <InterPowerBar value={951} />)}
  </>
);
