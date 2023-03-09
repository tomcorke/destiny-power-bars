import classnames from "classnames";
import React from "react";

import {
  ITEM_POWER_PINNACLE_CAP,
  ITEM_POWER_PINNACLE_DROP_OFFSET,
  ITEM_POWER_PINNACLE_DROP_OFFSET_WEAK,
  ITEM_POWER_POWERFUL_CAP,
  ITEM_POWER_SOFT_CAP,
  LEGENDARY_ACTIVITY_MODIFIER_ICON,
  LEGENDARY_STORY_ITEM_POWER,
} from "../../constants";

import { Power } from "./Power";
import STYLES from "./PowerHints.module.scss";

interface PowerHintsProps {
  minPower: number;
  overallPowerExact: number;
  overallPower: number;
  unrestrictedOverallPowerExact?: number;
  unrestrictedOverallPower?: number;
  potentialOverallPower?: number;
  useUnrestrictedPower?: boolean;
  onChangeUseUnrestrictedPower?: (newValue: boolean) => void;
  engrams?: { name: string; power: number; icon: string }[];
}

export const PowerHints = ({
  minPower,
  overallPowerExact,
  overallPower,
  unrestrictedOverallPowerExact,
  unrestrictedOverallPower,
  potentialOverallPower,

  useUnrestrictedPower = true,
  onChangeUseUnrestrictedPower = () => {},

  engrams = [],
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

  const relevantEngrams = engrams.filter((engram) => engram.power > minPower);

  const hasAbovePowerEngrams = relevantEngrams.some(
    (engram) => engram.power > overallPower
  );

  const relevantEngramDisplay =
    relevantEngrams.length > 0 ? (
      <div className={STYLES.relevantEngrams}>
        <div className={STYLES.engramsHeader}>Engrams:</div>
        <div className={STYLES.engramsContainer}>
          {engrams
            .sort((a, b) => b.power - a.power)
            .map((engram, i) => (
              <div className={STYLES.engram} key={i}>
                <img
                  className={STYLES.engramIcon}
                  src={`https://www.bungie.net${engram.icon}`}
                  alt={`${engram.name}: ${engram.power}`}
                  title={`${engram.name}: ${engram.power}`}
                />
                <span className={STYLES.engramName}>{engram.name}</span>
                <span
                  className={classnames(STYLES.engramPower, {
                    [STYLES.highEngramPower]: engram.power > overallPower,
                    [STYLES.lowEngramPower]: engram.power <= minPower,
                  })}
                >
                  {engram.power}
                </span>
              </div>
            ))}
        </div>
      </div>
    ) : null;

  const powerfulEngramsDisplay = hasAbovePowerEngrams ? (
    <div className={STYLES.powerfulEngrams}>
      You have engrams to decrypt above your average power level!
    </div>
  ) : null;

  const legendaryStoryDisplay =
    minPower < LEGENDARY_STORY_ITEM_POWER ? (
      <div className={STYLES.legendaryStoryHint}>
        <img
          className={STYLES.legendaryIcon}
          src={LEGENDARY_ACTIVITY_MODIFIER_ICON}
          alt="Legendary Campaign"
        />
        <div>
          This character can obtain a full set of{" "}
          <Power>{LEGENDARY_STORY_ITEM_POWER}</Power> power gear by completing
          the current campaign on Legendary difficulty.
        </div>
      </div>
    ) : null;

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
              World drops and other on-power item sources can increase your
              overall gear power to <Power>{potentialOverallPower}</Power>
            </span>
            <div className={STYLES.hintExtra}>
              <div className={STYLES.hintExtraInner}>
                <div>
                  World drops (from strikes, public events,{" "}
                  {powerToUse <= ITEM_POWER_POWERFUL_CAP &&
                    "vendor rank rewards, "}
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
                  Powerful and pinnacle reward sources (Weekly challenges,
                  latest and featured dungeons and raids) will give you items
                  above your overall gear power, with powerful rewards capped at{" "}
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
                  Pinnacle reward sources (Some weekly challenges) will give you
                  items at {pinnacleDropPowerDisplay} power.
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
            onChange={() => onChangeUseUnrestrictedPower(!useUnrestrictedPower)}
          />
          <span className={STYLES.switch} />
        </label>
      ) : null}

      {relevantEngramDisplay}
      {powerfulEngramsDisplay}
      {legendaryStoryDisplay}
    </div>
  );
};
