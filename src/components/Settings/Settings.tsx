import classnames from "classnames";
import React, { useContext, useState } from "react";

import { SettingsContext } from "../../contexts/SettingsContext";

import STYLES from "./Settings.module.scss";

export const Settings = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, setSetting } = useContext(SettingsContext);

  const createBooleanSetting = (
    key: keyof typeof settings,
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

            {createBooleanSetting(
              "itemLockingEnabled",
              "Enable automatic item locking",
              `Automatically locks items with the highest power per-character, to prevent accidental dismantling!
                Will not lock items more than once (list of previously locked items stored per browser).`
            )}

            {createBooleanSetting(
              "useMultipleExotics",
              "Display multiple exotics per character",
              `Display multiple exotic weapons or armour items per character, even though they cannot both be equipped. The game will use them
                to calculate your power level for drops, but this option allows you to choose to see your highest "real" equippable power by disabling it.`
            )}

            {createBooleanSetting(
              "displayEngrams",
              "Display engrams",
              `Display engrams held by your characters, or in your postbox.`
            )}

            {createBooleanSetting(
              "displayEngramsOnlyWhenRelevant",
              "Display engrams only when relevant",
              `When enabled, engrams will not be displayed unless at least one engram is above your minumum item power level for the character.`
            )}

            {createBooleanSetting(
              "displayLegendaryCampaignHints",
              "Display legendary campaign hints",
              `Display hint for characters below the power level offered by completion of the legendary campaign.`
            )}

            {createBooleanSetting(
              "useDarkerCharacterBackground",
              "Use darker character background",
              `Use a darker background for character cards, instead of the default emblem background colour.`
            )}

            {createBooleanSetting(
              "displayAccountWidePower",
              "Display Account-Wide Power",
              `Show power level achieved across all characters, now used for determining the power level of drops.`
            )}

            {createBooleanSetting(
              "displayOnlyAccountWidePower",
              "Display only Account-Wide Power",
              `Show a single character card representing the power level achieved across all characters, now used for determining the power level of drops.`
            )}

            {createBooleanSetting(
              "displayVendorItems",
              "Display vendor items",
              `Display items available for purchase from vendors, including their power level.`
            )}

            {createBooleanSetting(
              "displayOnlyAbovePowerVendorItems",
              "Display only above-power vendor items",
              `When enabled, only display vendor items that are above the current power level of the character.`
            )}

            {/*
            <div className={STYLES.settingsRow}>
              <label>Display engrams</label>
              <input
                type="checkbox"
                checked={!!settings.displayEngrams}
                onChange={(e) => {
                  setSetting("displayEngrams", !settings.displayEngrams);
                }}
              />
              <div className={STYLES.description}>
                Display engrams held by your characters, or in your postbox.
              </div>
            </div>

            <div className={STYLES.settingsRow}>
              <label>Display engrams only when relevant</label>
              <input
                type="checkbox"
                checked={!!settings.displayEngramsOnlyWhenRelevant}
                onChange={(e) => {
                  setSetting(
                    "displayEngramsOnlyWhenRelevant",
                    !settings.displayEngramsOnlyWhenRelevant
                  );
                }}
              />
              <div className={STYLES.description}>
                When enabled, engrams will not be displayed unless at least one
                engram is above your minumum item power level for the character.
              </div>
            </div>

            <div className={STYLES.settingsRow}>
              <label>Display legendary campaign hint</label>
              <input
                type="checkbox"
                checked={!!settings.displayLegendaryCampaignHints}
                onChange={(e) => {
                  setSetting(
                    "displayLegendaryCampaignHints",
                    !settings.displayLegendaryCampaignHints
                  );
                }}
              />
              <div className={STYLES.description}>
                Display hint for characters below the power level offered by
                completion of the legendary campaign.
              </div>
            </div>
            */}
          </div>
        </div>
      ) : null}
    </>
  );
};
