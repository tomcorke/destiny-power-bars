import classnames from "classnames";
import React, { useState } from "react";

import STYLES from "./S10Overlay.module.scss";

import SEASON_COMP_IMAGE from "../images/season-of-the-worthy/season_comp.png";
import TRIALS_COMP_IMAGE from "../images/season-of-the-worthy/trials_comp.png";

// interface OverlayProps {}

export const S10Overlay = () => {
  const [hideSeason, setHideSeason] = useState(true);
  const [hideTrials, setHideTrials] = useState(true);

  return (
    <div className={STYLES.S10Overlay}>
      <div className={STYLES.overlayContainer}>
        <img
          className={classnames(STYLES.seasonComp, {
            [STYLES.hidden]: hideSeason,
          })}
          src={SEASON_COMP_IMAGE}
          onLoad={() => setHideSeason(false)}
          alt=""
        />
        <img
          className={classnames(STYLES.trialsComp, {
            [STYLES.hidden]: hideTrials,
          })}
          src={TRIALS_COMP_IMAGE}
          onLoad={() => setHideTrials(false)}
          alt=""
        />
      </div>
    </div>
  );
};
