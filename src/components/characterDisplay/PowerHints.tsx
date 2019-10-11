import classnames from "classnames";
import React from "react";

import { Power } from "./Power";

import STYLES from "./PowerHints.module.scss";

interface PowerHintsProps {
  overallPower: number;
  potentialOverallPower?: number;
  powerRequiredToReachPotential?: number;
}

export const PowerHints = (data: PowerHintsProps) => (
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
            <p>
              World drops (from strikes, public events, vendors, non-powerful
              legendary rewards) can drop with a power level from{" "}
              <Power>{data.overallPower - 3}</Power> to{" "}
              <Power>{data.overallPower}</Power> for this character.
            </p>
            <p>
              Replacing items below your current overall power can increase your
              power to a higher average.
            </p>
            {data.powerRequiredToReachPotential ? (
              <p>
                You need an extra{" "}
                <Power>{data.powerRequiredToReachPotential}</Power> total power
                on your items to reach an overall power of{" "}
                <Power>{data.potentialOverallPower}</Power>.
              </p>
            ) : null}
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
            <p>
              Powerful and pinnacle reward sources (Weekly challenges, Year 3
              raids) will give you items above your overall gear power, with
              powerful rewards capped at <Power>{950}</Power>.
            </p>
            <p>
              Powerful rewards (Tier 1) will give items up to 3 levels above
              your overall gear power
            </p>
            <p>
              Powerful rewards (Tier 2) will give items up to 5 levels above
              your overall gear power
            </p>
            <p>
              Pinnacle rewards will give items up to 8 levels above your overall
              gear power
            </p>
            <p>
              After getting a powerful reward, check back here to see if it's
              beneficial to catch up the rest of your slots with world drops
              before getting another!
            </p>
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
          pinnacle cap of 960
        </span>
        <div className={STYLES.hintExtra}>
          <p>
            Pinnacle reward sources (Weekly challenges, Year 3 raids) will give
            you items above your overall gear power, capped at 960.
          </p>
          <p>
            Pinnacle rewards will give items up to 8 levels above your overall
            gear power
          </p>
          <p>
            After getting a pinnacle reward, check back here to see if it's
            beneficial to catch up the rest of your slots with world drops
            before getting another!
          </p>
        </div>
      </div>
    ) : null}
  </div>
);
