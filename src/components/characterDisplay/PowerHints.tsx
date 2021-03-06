import classnames from "classnames";
import React from "react";

import {
  ITEM_POWER_PINNACLE_CAP,
  ITEM_POWER_PINNACLE_DROP_OFFSET,
  ITEM_POWER_PINNACLE_DROP_OFFSET_WEAK,
  ITEM_POWER_POWERFUL_CAP,
  ITEM_POWER_SOFT_CAP,
} from "../../constants";
import { Power } from "./Power";

import STYLES from "./PowerHints.module.scss";

interface PowerHintsProps {
  overallPowerExact: number;
  overallPower: number;
  unrestrictedOverallPowerExact?: number;
  unrestrictedOverallPower?: number;
  potentialOverallPower?: number;
  useUnrestrictedPower?: boolean;
  onChangeUseUnrestrictedPower?: (newValue: boolean) => void;
}

export const PowerHints = ({
  overallPowerExact,
  overallPower,
  unrestrictedOverallPowerExact,
  unrestrictedOverallPower,
  potentialOverallPower,

  useUnrestrictedPower = true,
  onChangeUseUnrestrictedPower = () => {},
}: PowerHintsProps) => {
  const powerToUseExact = unrestrictedOverallPowerExact || overallPowerExact;
  const powerToUse = unrestrictedOverallPower || overallPower;

  potentialOverallPower =
    potentialOverallPower || Math.min(ITEM_POWER_SOFT_CAP, powerToUse);

  const nextPower =
    powerToUseExact === powerToUse
      ? powerToUse + 1
      : Math.ceil(powerToUseExact);

  const powerRequiredToReachNext = (nextPower - powerToUseExact) * 8;
  const powerRequiredToReachPotential =
    (potentialOverallPower - powerToUseExact) * 8;

  const pinnacleDropPowerDisplay =
    ITEM_POWER_PINNACLE_CAP - powerToUse >
    ITEM_POWER_PINNACLE_DROP_OFFSET_WEAK ? (
      <>
        <Power>
          {Math.min(
            powerToUse + ITEM_POWER_PINNACLE_DROP_OFFSET_WEAK,
            ITEM_POWER_PINNACLE_CAP
          )}
        </Power>{" "}
        or{" "}
        <Power>
          {Math.min(
            powerToUse + ITEM_POWER_PINNACLE_DROP_OFFSET,
            ITEM_POWER_PINNACLE_CAP
          )}
        </Power>
      </>
    ) : (
      <Power>
        {Math.min(
          powerToUse + ITEM_POWER_PINNACLE_DROP_OFFSET,
          ITEM_POWER_PINNACLE_CAP
        )}
      </Power>
    );

  return (
    <div className={STYLES.hints}>
      {potentialOverallPower &&
        potentialOverallPower > powerToUse &&
        powerToUse > ITEM_POWER_POWERFUL_CAP && (
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
                  with a power level up to <Power>{powerToUse}</Power> for this
                  character.
                </div>
                <div>
                  Replacing items which are below your current overall power can
                  increase your power to a higher average.
                </div>
                {powerToUse < ITEM_POWER_PINNACLE_CAP && (
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
                      <Power>{Math.floor(powerToUse + 1)}</Power>.
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

      {potentialOverallPower > powerToUse &&
        powerToUse <= ITEM_POWER_POWERFUL_CAP && (
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
                  {powerToUse <= ITEM_POWER_POWERFUL_CAP && "vendors, "}
                  non-powerful rewards) can drop with a power level{" "}
                  {powerToUse >= ITEM_POWER_SOFT_CAP ? (
                    <>
                      from <Power>{powerToUse - 3}</Power> to{" "}
                      <Power>{powerToUse}</Power>
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
                      <Power>{Math.floor(powerToUse + 1)}</Power>.
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

      {potentialOverallPower === powerToUse &&
        powerToUse >= ITEM_POWER_SOFT_CAP &&
        powerToUse < ITEM_POWER_POWERFUL_CAP && (
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
                  4 raids) will give you items above your overall gear power,
                  with powerful rewards capped at{" "}
                  <Power>{ITEM_POWER_POWERFUL_CAP}</Power>.
                </div>
                {powerRequiredToReachNext && (
                  <div>
                    You need an extra <Power>{powerRequiredToReachNext}</Power>{" "}
                    total power on your items to reach an overall power of{" "}
                    <Power>{Math.floor(powerToUse + 1)}</Power>.
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

      {potentialOverallPower === powerToUse &&
        powerToUse >= ITEM_POWER_POWERFUL_CAP &&
        powerToUse < ITEM_POWER_PINNACLE_CAP && (
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
                  Pinnacle reward sources (Some weekly challenges, Year 4 raids)
                  will give you items at {pinnacleDropPowerDisplay} power.
                </div>
                {powerRequiredToReachNext && (
                  <div>
                    You need an extra <Power>{powerRequiredToReachNext}</Power>{" "}
                    total power on your items to reach an overall power of{" "}
                    <Power>{Math.floor(powerToUse + 1)}</Power>.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {unrestrictedOverallPowerExact &&
      unrestrictedOverallPowerExact > overallPowerExact ? (
        <label className={STYLES.toggleCheckbox}>
          Include multiple exotics
          <input
            type="checkbox"
            checked={useUnrestrictedPower}
            onClick={() => onChangeUseUnrestrictedPower(!useUnrestrictedPower)}
          />
          <span className={STYLES.switch} />
        </label>
      ) : null}
    </div>
  );
};
