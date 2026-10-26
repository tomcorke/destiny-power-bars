import classnames from "classnames";
import React, { useContext } from "react";

import { SettingsContext } from "../../contexts/SettingsContext";
import { PowerBarsCharacterData } from "../../services/character-data";

import STYLES from "./PowerHints.module.scss";

interface EngramHintsProps {
  engrams: PowerBarsCharacterData["characters"][string]["engrams"];
  overallPower: number;
  minPower: number;
}

const EngramList = ({ engrams, overallPower, minPower }: EngramHintsProps) => (
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
                [STYLES.highEngramPower!]: engram.power > overallPower,
                [STYLES.lowEngramPower!]: engram.power <= minPower,
              })}
            >
              {engram.power}
            </span>
          </div>
        ))}
    </div>
  </div>
);

export const EngramHints = (props: EngramHintsProps) => {
  const { settings } = useContext(SettingsContext);
  const { engrams, overallPower, minPower } = props;

  const relevantEngrams = engrams.filter((engram) => engram.power > minPower);

  const hasAbovePowerEngrams = relevantEngrams.some(
    (engram) => engram.power > overallPower
  );

  const shouldDisplayEngrams =
    settings.displayEngrams &&
    engrams.length > 0 &&
    (!settings.displayEngramsOnlyWhenRelevant || relevantEngrams.length > 0);

  return (
    <>
      {shouldDisplayEngrams && <EngramList {...props} />}
      {settings.displayEngrams && hasAbovePowerEngrams && (
        <div className={STYLES.powerfulEngrams}>
          You have engrams to decrypt above your average power level!
        </div>
      )}
    </>
  );
};
