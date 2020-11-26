import React from "react";

import STYLES from "./PowerDetails.module.scss";

import { InterPowerBar } from "./InterPowerBar";
import { Power } from "./Power";

const ProgressBar = ({ value, max }: { value: number; max: number }) => {
  if (value === undefined || max === undefined) {
    return null;
  }
  const perc = Math.floor((value / max) * 1000) / 10;
  const withThousands = (n: number) =>
    n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (
    <div
      className={STYLES.progressBar}
      title={`${withThousands(value)} / ${withThousands(max)}`}
    >
      <div className={STYLES.progressBarFill} style={{ width: `${perc}%` }} />
      <div className={STYLES.progressBarOverlay} />
    </div>
  );
};

interface PowerDetailsProps {
  overallPowerExact: number;
  overallPower: number;
  artifactData?: {
    name: string;
    iconPath: string;
    bonusPower: number;
    progressToNextLevel: number;
    nextLevelAt: number;
  };
  unrestrictedOverallPower?: number;
  unrestrictedOverallPowerExact?: number;
  useUnrestrictedPower?: boolean;
}

export const PowerDetails = ({
  overallPowerExact,
  overallPower,
  artifactData,
  unrestrictedOverallPower,
  unrestrictedOverallPowerExact,
  useUnrestrictedPower = true,
}: PowerDetailsProps) => {
  const powerToDisplay =
    (useUnrestrictedPower && unrestrictedOverallPower) || overallPower;

  if (!artifactData || artifactData.bonusPower === 0) {
    return (
      <div className={STYLES.details}>
        <div className={STYLES.detailsRow}>
          <InterPowerBar value={overallPowerExact} />
        </div>
      </div>
    );
  }

  return (
    <div className={STYLES.details}>
      <div className={STYLES.detailsRow}>
        <div className={STYLES.detailsLabel}>
          {useUnrestrictedPower &&
          unrestrictedOverallPower &&
          unrestrictedOverallPower > overallPower
            ? "Maximum gear power (with exotics)"
            : "Maximum equippable gear power"}
          :
        </div>
        <div className={STYLES.detailsValue}>
          <Power>{powerToDisplay}</Power>
        </div>
      </div>
      <div className={STYLES.detailsRow}>
        <InterPowerBar
          value={overallPowerExact}
          extraValue={
            useUnrestrictedPower ? unrestrictedOverallPowerExact : undefined
          }
        />
      </div>
      {artifactData ? (
        <>
          <div className={STYLES.detailsRow}>
            <div className={STYLES.detailsLabel}>
              <img
                className={STYLES.detailsInlineIcon}
                src={`https://www.bungie.net${artifactData.iconPath}`}
                alt=""
              />
              {artifactData.name} bonus power:
            </div>
            <div className={STYLES.detailsValue}>
              <Power withSign>{artifactData.bonusPower}</Power>
            </div>
          </div>
          <div className={STYLES.detailsRow}>
            <ProgressBar
              value={artifactData.progressToNextLevel}
              max={artifactData.nextLevelAt}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};
