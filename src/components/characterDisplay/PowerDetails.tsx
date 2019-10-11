import React from "react";

import STYLES from "./PowerDetails.module.scss";

import { Power } from "./Power";

const withSign = (value: number) => {
  if (value >= 0) {
    return `+${value}`;
  }
  return `${value}`;
};

interface PowerDetailsProps {
  overallPower: number;
  artifactData?: {
    name: string;
    iconPath: string;
    bonusPower: number;
  };
}

export const PowerDetails = (data: PowerDetailsProps) => {
  const roundedPower = Math.floor(data.overallPower);

  /*
  const summableArtifactBonusPower = data.artifactData
    ? data.artifactData.bonusPower
    : 0;
    */

  if (!data.artifactData || data.artifactData.bonusPower === 0) {
    return null;
  }

  return (
    <div className={STYLES.details}>
      <div className={STYLES.detailsRow}>
        <div className={STYLES.detailsLabel}>
          Maximum equippable gear power:
        </div>
        <div className={STYLES.defailsValue}>
          <Power>{roundedPower}</Power>
        </div>
      </div>
      {data.artifactData ? (
        <>
          <div className={STYLES.detailsRow}>
            <div className={STYLES.detailsLabel}>
              <img
                className={STYLES.detailsInlineIcon}
                src={`https://www.bungie.net${data.artifactData.iconPath}`}
                alt=""
              />
              {data.artifactData.name} bonus power:
            </div>
            <div className={STYLES.detailsValue}>
              <Power>{withSign(data.artifactData.bonusPower)}</Power>
            </div>
          </div>

          {/*<div className={STYLES.detailsRow}>
            <div className={STYLES.detailsLabel}>Total combined power:</div>
            <div className={STYLES.detailsValue}>
              <Power>{roundedPower + summableArtifactBonusPower}</Power>
            </div>
      </div>*/}
        </>
      ) : null}
    </div>
  );
};
