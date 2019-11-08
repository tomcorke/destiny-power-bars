import classnames from "classnames";
import React from "react";

import { Power } from "./Power";

import STYLES from "./PowerHints.module.scss";

interface PowerHintsProps {
  overallPower: number;
  potentialOverallPower?: number;
  powerRequiredToReachPotential?: number;
  powerRequiredToReachNext?: number;
}

export const PowerHints = (data: PowerHintsProps) => {
  return (
    <div className={STYLES.hints}>
      {data.potentialOverallPower &&
      data.potentialOverallPower > data.overallPower ? (
        <div className={classnames(STYLES.hint, STYLES.worldDropHint)}>
          <span>
            World drops can increase your overall gear power to{" "}
            <Power>{data.potentialOverallPower}</Power>
          </span>
          <div className={STYLES.hintExtra}>
            <div className={STYLES.hintExtraInner}>
              <div>
                World drops (from strikes, public events, vendors, non-powerful
                legendary rewards) can drop with a power level from{" "}
                <Power>{data.overallPower - 3}</Power> to{" "}
                <Power>{data.overallPower}</Power> for this character.
              </div>
              <div>
                Replacing items below your current overall power can increase
                your power to a higher average.
              </div>
              {data.powerRequiredToReachNext &&
                data.powerRequiredToReachNext !==
                  data.powerRequiredToReachPotential && (
                  <div>
                    You need an extra{" "}
                    <Power>{data.powerRequiredToReachNext}</Power> total power
                    on your items to reach an overall power of{" "}
                    <Power>{Math.floor(data.overallPower + 1)}</Power>.
                  </div>
                )}
              {data.powerRequiredToReachPotential && (
                <div>
                  You need an extra{" "}
                  <Power>{data.powerRequiredToReachPotential}</Power> total
                  power on your items to reach an overall power of{" "}
                  <Power>{data.potentialOverallPower}</Power>.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {data.potentialOverallPower === data.overallPower &&
      data.overallPower >= 900 &&
      data.overallPower < 950 ? (
        <div className={classnames(STYLES.hint, STYLES.powerfulHint)}>
          <span>
            Powerful rewards can increase your overall gear power up to the
            powerful cap of <Power>{950}</Power>
          </span>
          <div className={STYLES.hintExtra}>
            <div className={STYLES.hintExtraInner}>
              <div>
                Powerful and pinnacle reward sources (Weekly challenges, Year 3
                raids) will give you items above your overall gear power, with
                powerful rewards capped at <Power>{950}</Power>.
              </div>
              {data.powerRequiredToReachNext && (
                <div>
                  You need an extra{" "}
                  <Power>{data.powerRequiredToReachNext}</Power> total power on
                  your items to reach an overall power of{" "}
                  <Power>{Math.floor(data.overallPower + 1)}</Power>.
                </div>
              )}
              <div>
                After getting a powerful reward, check back here to see if it's
                beneficial to catch up the rest of your slots with world drops
                before getting another!
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {data.potentialOverallPower === data.overallPower &&
      data.overallPower >= 950 &&
      data.overallPower < 960 ? (
        <div className={classnames(STYLES.hint, STYLES.pinnacleHint)}>
          <span>
            Pinnacle rewards can increase your overall gear power up to the
            pinnacle cap of <Power>{960}</Power>
          </span>
          <div className={STYLES.hintExtra}>
            <div className={STYLES.hintExtraInner}>
              <div>
                Pinnacle reward sources (Some weekly challenges, Year 3 raids)
                will give you items at{" "}
                <Power>{Math.min(data.overallPower + 2, 960)}</Power> power.
              </div>
              {data.powerRequiredToReachNext && (
                <div>
                  You need an extra{" "}
                  <Power>{data.powerRequiredToReachNext}</Power> total power on
                  your items to reach an overall power of{" "}
                  <Power>{Math.floor(data.overallPower + 1)}</Power>.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
