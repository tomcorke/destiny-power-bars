import now from "~build/time";
import { sha } from "~build/info";
import React from "react";

import STYLES from "./BuildStamp.module.scss";
const buildTimestamp = new Date(now).toLocaleString("en-GB", {
  timeZone: "UTC",
});

const BuildStamp = () => (
  <div className={STYLES.buildStamp}>
    {sha} {buildTimestamp}
  </div>
);

export default BuildStamp;
