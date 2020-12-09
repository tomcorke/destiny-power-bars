import preval from "preval.macro";
import React from "react";

import STYLES from "./BuildStamp.module.scss";

const gitHead = (process.env.REACT_APP_NPM_PACKAGE_GITHEAD || "").substr(0, 6);

const buildTimestamp = preval`module.exports = new Date().toISOString();`;

const BuildStamp = () => (
  <div className={STYLES.buildStamp}>
    {gitHead} {buildTimestamp}
  </div>
);

export default BuildStamp;
