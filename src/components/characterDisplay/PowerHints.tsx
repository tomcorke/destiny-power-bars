import classnames from "classnames";
import React from "react";

import {
  ITEM_POWER_PINNACLE_CAP,
  ITEM_POWER_PINNACLE_DROP_OFFSET,
  ITEM_POWER_POWERFUL_CAP,
  ITEM_POWER_SOFT_CAP,
} from "../../constants";
import { Power } from "./Power";

import STYLES from "./PowerHints.module.scss";

interface PowerHintsProps {
  overallPowerExact: number;
  overallPower: number;
  potentialOverallPower?: number;
}

export const PowerHints = ({
  overallPowerExact,
  overallPower,
  potentialOverallPower,
}: PowerHintsProps) => {
  potentialOverallPower =
    potentialOverallPower || Math.min(ITEM_POWER_SOFT_CAP, overallPower);

  const nextPower =
    overallPowerExact === overallPower
      ? overallPower + 1
      : Math.ceil(overallPowerExact);

  const powerRequiredToReachNext = (nextPower - overallPowerExact) * 8;
  const powerRequiredToReachPotential =
    (potentialOverallPower - overallPowerExact) * 8;

  return (
    <div className={STYLES.hints}>
      {potentialOverallPower &&
        potentialOverallPower > overallPower &&
        overallPower > ITEM_POWER_POWERFUL_CAP && (
          <div
            className={classnames(
              STYLES.hint,
              STYLES.dropHint,
              STYLES.legendaryWorldDropHint
            )}
          >
            <span>
              Powerful rewards can increase your overall gear power to{" "}
              <Power>{potentialOverallPower}</Power>
            </span>
            <div className={STYLES.hintExtra}>
              <div className={STYLES.hintExtraInner}>
                <div>
                  Powerful rewards from milestones or prime engrams can drop
                  with a power level up to <Power>{overallPower}</Power> for
                  this character.
                </div>
                <div>
                  Replacing items which are below your current overall power can
                  increase your power to a higher average.
                </div>
                {overallPower < ITEM_POWER_PINNACLE_CAP && (
                  <div>
                    Raising your overall power before collecting your next
                    pinnacle reward will give you the most efficient progress.
                  </div>
                )}
                {powerRequiredToReachNext &&
                  powerRequiredToReachNext !==
                    powerRequiredToReachPotential && (
                    <div>
                      You need an extra{" "}
                      <Power>{powerRequiredToReachNext}</Power> total power on
                      your items to reach an overall power of{" "}
                      <Power>{Math.floor(overallPower + 1)}</Power>.
                    </div>
                  )}
                {powerRequiredToReachPotential && (
                  <div>
                    You need an extra{" "}
                    <Power>{powerRequiredToReachPotential}</Power> total power
                    on your items to reach an overall power of{" "}
                    <Power>{potentialOverallPower}</Power>.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {potentialOverallPower > overallPower &&
        overallPower <= ITEM_POWER_POWERFUL_CAP && (
          <div
            className={classnames(
              STYLES.hint,
              STYLES.dropHint,
              STYLES.worldDropHint
            )}
          >
            <span>
              World drops can increase your overall gear power to{" "}
              <Power>{potentialOverallPower}</Power>
            </span>
            <div className={STYLES.hintExtra}>
              <div className={STYLES.hintExtraInner}>
                <div>
                  World drops (from strikes, public events,{" "}
                  {overallPower <= ITEM_POWER_POWERFUL_CAP && "vendors, "}
                  non-powerful rewards) can drop with a power level{" "}
                  {overallPower >= ITEM_POWER_SOFT_CAP ? (
                    <>
                      from <Power>{overallPower - 3}</Power> to{" "}
                      <Power>{overallPower}</Power>
                    </>
                  ) : (
                    <>
                      above your current power, increasing your power
                      incrementally up to <Power>{potentialOverallPower}</Power>
                    </>
                  )}{" "}
                  for this character.
                </div>
                <div>
                  Replacing items which are below your current overall power can
                  increase your power to a higher average.
                </div>
                {powerRequiredToReachNext &&
                  powerRequiredToReachNext !==
                    powerRequiredToReachPotential && (
                    <div>
                      You need an extra{" "}
                      <Power>{powerRequiredToReachNext}</Power> total power on
                      your items to reach an overall power of{" "}
                      <Power>{Math.floor(overallPower + 1)}</Power>.
                    </div>
                  )}
                {powerRequiredToReachPotential && (
                  <div>
                    You need an extra{" "}
                    <Power>{powerRequiredToReachPotential}</Power> total power
                    on your items to reach an overall power of{" "}
                    <Power>{potentialOverallPower}</Power>.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {potentialOverallPower === overallPower &&
        overallPower >= ITEM_POWER_SOFT_CAP &&
        overallPower < ITEM_POWER_POWERFUL_CAP && (
          <div
            className={classnames(
              STYLES.hint,
              STYLES.dropHint,
              STYLES.powerfulHint
            )}
          >
            <span>
              Powerful rewards can increase your overall gear power up to the
              powerful cap of <Power>{ITEM_POWER_POWERFUL_CAP}</Power>
            </span>
            <div className={STYLES.hintExtra}>
              <div className={STYLES.hintExtraInner}>
                <div>
                  Powerful and pinnacle reward sources (Weekly challenges, Year
                  3 raids) will give you items above your overall gear power,
                  with powerful rewards capped at{" "}
                  <Power>{ITEM_POWER_POWERFUL_CAP}</Power>.
                </div>
                {powerRequiredToReachNext && (
                  <div>
                    You need an extra <Power>{powerRequiredToReachNext}</Power>{" "}
                    total power on your items to reach an overall power of{" "}
                    <Power>{Math.floor(overallPower + 1)}</Power>.
                  </div>
                )}
                <div>
                  After getting a powerful reward, check back here to see if
                  it's beneficial to catch up the rest of your slots with world
                  drops before getting another!
                </div>
              </div>
            </div>
          </div>
        )}

      {potentialOverallPower === overallPower &&
        overallPower >= ITEM_POWER_POWERFUL_CAP &&
        overallPower < ITEM_POWER_PINNACLE_CAP && (
          <div
            className={classnames(
              STYLES.hint,
              STYLES.dropHint,
              STYLES.pinnacleHint
            )}
          >
            <span>
              Pinnacle rewards can increase your overall gear power up to the
              pinnacle cap of <Power>{ITEM_POWER_PINNACLE_CAP}</Power>
            </span>
            <div className={STYLES.hintExtra}>
              <div className={STYLES.hintExtraInner}>
                <div>
                  Pinnacle reward sources (Some weekly challenges, Year 3 raids)
                  will give you items at{" "}
                  <Power>
                    {Math.min(
                      overallPower + ITEM_POWER_PINNACLE_DROP_OFFSET,
                      ITEM_POWER_PINNACLE_CAP
                    )}
                  </Power>{" "}
                  power.
                </div>
                {powerRequiredToReachNext && (
                  <div>
                    You need an extra <Power>{powerRequiredToReachNext}</Power>{" "}
                    total power on your items to reach an overall power of{" "}
                    <Power>{Math.floor(overallPower + 1)}</Power>.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
