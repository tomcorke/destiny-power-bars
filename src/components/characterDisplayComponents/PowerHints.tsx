import React, { useContext } from "react";

import {
  ITEM_POWER_SOFT_CAP,
  LEGENDARY_ACTIVITY_MODIFIER_ICON,
  LEGENDARY_STORY_ITEM_POWER,
} from "../../constants";
import { CharacterDataContext } from "../../contexts/CharacterDataContext";
import { SettingsContext } from "../../contexts/SettingsContext";

import { DropHints } from "./DropHints";
import { EngramHints } from "./EngramHints";
import { Power } from "./Power";
import STYLES from "./PowerHints.module.scss";

interface PowerHintsProps {
  characterId: string;
  useUnrestrictedPower?: boolean;
  onChangeUseUnrestrictedPower?: (newValue: boolean) => void;
}

export const PowerHints = ({
  characterId,
  useUnrestrictedPower = true,
  onChangeUseUnrestrictedPower = () => {},
}: PowerHintsProps) => {
  const { characterData } = useContext(CharacterDataContext);
  const { settings } = useContext(SettingsContext);

  const thisCharacterData = characterData?.characters[characterId];

  if (!thisCharacterData) {
    return null;
  }

  const { accountPower } = characterData.global;

  const { overallPower, averagePower, minPower } = thisCharacterData.topItems;
  const {
    overallPower: unrestrictedOverallPower,
    averagePower: unrestrictedAveragePower,
  } = thisCharacterData.unrestricted;
  let { potentialOverallPower, engrams } = thisCharacterData;

  const powerToUseExact = unrestrictedAveragePower || averagePower;
  const powerToUse = unrestrictedOverallPower || overallPower;

  potentialOverallPower = Math.min(
    accountPower.overallPower,
    potentialOverallPower || Math.min(ITEM_POWER_SOFT_CAP, powerToUse)
  );

  const nextPower =
    powerToUseExact === powerToUse
      ? powerToUse + 1
      : Math.ceil(powerToUseExact);

  const powerRequiredToReachNext = (nextPower - powerToUseExact) * 8;
  const powerRequiredToReachPotential =
    (potentialOverallPower - powerToUseExact) * 8;

  const legendaryStoryDisplay =
    settings.displayLegendaryCampaignHints &&
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
      <DropHints
        powerToUse={powerToUse}
        potentialOverallPower={potentialOverallPower}
        powerRequiredToReachNext={powerRequiredToReachNext}
        powerRequiredToReachPotential={powerRequiredToReachPotential}
      />

      {unrestrictedAveragePower && unrestrictedAveragePower > averagePower ? (
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

      <EngramHints
        engrams={engrams}
        overallPower={overallPower}
        minPower={minPower}
      />
      {legendaryStoryDisplay}
    </div>
  );
};
