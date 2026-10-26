import classnames from "classnames";
import React, { useContext, useState } from "react";

import { SettingsContext } from "../../contexts/SettingsContext";

import STYLES from "./Settings.module.scss";

type SettingKey = keyof React.ContextType<typeof SettingsContext>["settings"];

const BOOLEAN_SETTINGS: {
  key: SettingKey;
  label: string;
  description: string;
}[] = [
  {
    key: "itemLockingEnabled",
    label: "Enable automatic item locking",
    description: `Automatically locks items with the highest power per-character, to prevent accidental dismantling!
                Will not lock items more than once (list of previously locked items stored per browser).`,
  },
  {
    key: "useMultipleExotics",
    label: "Display multiple exotics per character",
    description: `Display multiple exotic weapons or armour items per character, even though they cannot both be equipped. The game will use them
                to calculate your power level for drops, but this option allows you to choose to see your highest "real" equippable power by disabling it.`,
  },
  {
    key: "displayEngrams",
    label: "Display engrams",
    description: `Display engrams held by your characters, or in your postbox.`,
  },
  {
    key: "displayEngramsOnlyWhenRelevant",
    label: "Display engrams only when relevant",
    description: `When enabled, engrams will not be displayed unless at least one engram is above your minumum item power level for the character.`,
  },
  {
    key: "displayLegendaryCampaignHints",
    label: "Display legendary campaign hints",
    description: `Display hint for characters below the power level offered by completion of the legendary campaign.`,
  },
  {
    key: "useDarkerCharacterBackground",
    label: "Use darker character background",
    description: `Use a darker background for character cards, instead of the default emblem background colour.`,
  },
  {
    key: "displayAccountWidePower",
    label: "Display Account-Wide Power",
    description: `Show power level achieved across all characters, now used for determining the power level of drops.`,
  },
  {
    key: "displayOnlyAccountWidePower",
    label: "Display only Account-Wide Power",
    description: `Show a single character card representing the power level achieved across all characters, now used for determining the power level of drops.`,
  },
  {
    key: "displayVendorItems",
    label: "Display vendor items",
    description: `Display items available for purchase from vendors, including their power level. When used in conjunction with "Display Account-Wide Power", items will only be shown when above the highest power level per-slot across all characters.`,
  },
  {
    key: "displayOnlyAbovePowerVendorItems",
    label: "Display only above-power vendor items",
    description: `When enabled, only display vendor items that are above the current overall power level of the character. When disabled, vendor items above the current highest power per-slot will be shown, even when they are below your overall equippable power.`,
  },
];

export const Settings = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, setSetting } = useContext(SettingsContext);

  const createBooleanSetting = (
    key: SettingKey,
    label?: string,
    description?: string
  ) => {
    return (
      <div className={STYLES.settingsRow} key={key}>
        <label>{label || key}</label>
        <input
          type="checkbox"
          checked={!!settings[key]}
          onChange={(e) => setSetting(key, e.target.checked)}
        />
        {description && <div className={STYLES.description}>{description}</div>}
      </div>
    );
  };

  return (
    <>
      <button
        className={STYLES.settingsButton}
        onClick={() => setShowSettings(!showSettings)}
      >
        <div className={STYLES.settingsIcon} />
        <div className={STYLES.settingsText}>Settings</div>
      </button>
      {showSettings ? (
        <div
          className={STYLES.settingsOverlay}
          onClick={() => setShowSettings(false)}
        >
          <div
            className={STYLES.settingsContainer}
            onClick={(e) => {
              e.stopPropagation();
              return false;
            }}
          >
            <div className={classnames(STYLES.settingsRow, STYLES.header)}>
              <div className={STYLES.settingsTitle}>Settings</div>
              <div
                className={STYLES.settingsCloseButton}
                onClick={() => setShowSettings(false)}
              >
                x Close
              </div>
            </div>

            {BOOLEAN_SETTINGS.map(({ key, label, description }) =>
              createBooleanSetting(key, label, description)
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};
