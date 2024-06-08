import React, { useContext } from "react";

import { CharacterDataContext } from "../../contexts/CharacterDataContext";

import { InterPowerBar } from "./InterPowerBar";
import { Power } from "./Power";
import STYLES from "./PowerDetails.module.scss";
import { SettingsContext } from "../../contexts/SettingsContext";

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
  characterId: string;
  useUnrestrictedPower?: boolean;
}

export const PowerDetails = ({
  characterId,
  useUnrestrictedPower = true,
}: PowerDetailsProps) => {
  const { characterData } = useContext(CharacterDataContext);
  const { settings } = useContext(SettingsContext);

  const thisCharacterData = characterData?.characters[characterId];

  if (!thisCharacterData) {
    return null;
  }

  const { overallPower, averagePower } = thisCharacterData.topItems;
  const {
    overallPower: unrestrictedOverallPower,
    averagePower: unrestrictedAveragePower,
  } = thisCharacterData.unrestricted;
  const artifactData = characterData.global.artifact;

  const powerToDisplay =
    (useUnrestrictedPower && unrestrictedOverallPower) || overallPower;

  const { accountPower } = characterData.global;
  const showAccountPower = settings.displayAccountWidePower;

  if (!artifactData || artifactData.bonusPower === 0) {
    return (
      <div className={STYLES.details}>
        <div className={STYLES.detailsRow}>
          <InterPowerBar
            value={averagePower}
            extraValue={
              useUnrestrictedPower ? unrestrictedAveragePower : undefined
            }
          />
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
          <Power withSymbol>{powerToDisplay}</Power>
        </div>
      </div>
      <div className={STYLES.detailsRow}>
        <InterPowerBar
          value={averagePower}
          extraValue={
            useUnrestrictedPower ? unrestrictedAveragePower : undefined
          }
        />
      </div>
      {showAccountPower ? (
        <>
          <div className={STYLES.detailsRow}>
            <div className={STYLES.detailsLabel}>Account-wide max power:</div>
            <div className={STYLES.detailsValue}>
              <Power withSymbol>{accountPower.overallPower}</Power>
            </div>
          </div>
        </>
      ) : null}
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
