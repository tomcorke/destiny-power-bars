import React from "react";

import STYLES from "./BuildStamp.module.scss";

import { sha } from "~build/git";
import now from "~build/time";
const buildTimestamp = new Date(now).toLocaleString("en-GB", {
  timeZone: "UTC",
});

const BuildStamp = () => {
  const shortSha = (sha || "").substring(0, 6);
  return (
    <div className={STYLES.buildStamp}>
      {shortSha} {buildTimestamp}
    </div>
  );
};

export default BuildStamp;
