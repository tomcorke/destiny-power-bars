import classnames from "classnames";
import React, { useContext, useState } from "react";

import { SettingsContext } from "../../contexts/SettingsContext";
import { debug } from "../../services/debug";

import STYLES from "./Settings.module.scss";

export const Settings = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, setSetting } = useContext(SettingsContext);

  debug("render settings", settings);

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

            <div className={STYLES.settingsRow}>
              <label>Enable automatic item locking </label>
              <input
                type="checkbox"
                checked={!!settings.itemLockingEnabled}
                onChange={(e) => {
                  setSetting(
                    "itemLockingEnabled",
                    !settings.itemLockingEnabled
                  );
                }}
              />
              <div className={STYLES.description}>
                Automatically locks items with the highest power per-character,
                to prevent accidental dismantling! Will not lock items more than
                once (list of previously locked items stored per browser).
              </div>
            </div>

            <div className={STYLES.settingsRow}>
              <label>Display multiple exotics per character</label>
              <input
                type="checkbox"
                checked={!!settings.useMultipleExotics}
                onChange={(e) => {
                  setSetting(
                    "useMultipleExotics",
                    !settings.useMultipleExotics
                  );
                }}
              />
              <div className={STYLES.description}>
                Display multiple exotic weapons or armour items per character,
                even though they cannot both be equipped. The game will use them
                to calculate your power level for drops, but this option allows
                you to choose to see your highest "real" equippable power by
                disabling it.
              </div>
            </div>

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
          </div>
        </div>
      ) : null}
    </>
  );
};
