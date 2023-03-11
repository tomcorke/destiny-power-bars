import React, { PropsWithChildren, useEffect, useState } from "react";
import { z } from "zod";

import { SETTINGS_LOCAL_STORAGE_KEY } from "../constants";
import { debug } from "../services/debug";

const settingsSchema = z.object({
  itemLockingEnabled: z.boolean().default(false),
  useMultipleExotics: z.boolean().default(true),
  displayEngrams: z.boolean().default(true),
  displayEngramsOnlyWhenRelevant: z.boolean().default(true),
  displayLegendaryCampaignHints: z.boolean().default(true),
});

type Settings = z.infer<typeof settingsSchema>;

type SettingsState = {
  settings: Settings;
  setSetting: <K extends keyof Settings>(
    key: keyof Settings,
    value: Settings[K]
  ) => void;
};

const defaults = settingsSchema.parse({});

export const SettingsContext = React.createContext<SettingsState>({
  settings: defaults,
  setSetting: () => {},
});

export const SettingsContextProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const [settings, setSettings] = useState<Settings>(defaults);

  // load settings from local storage on mount
  useEffect(() => {
    const settingsFromLocalStorage = window.localStorage.getItem(
      SETTINGS_LOCAL_STORAGE_KEY
    );
    if (settingsFromLocalStorage) {
      try {
        const parsedSettings = JSON.parse(settingsFromLocalStorage);
        // Only apply settings if we parsed them successfully.
        if (settingsSchema.safeParse(parsedSettings).success) {
          setSettings(parsedSettings);
        }
      } catch (e) {
        // Catch errors that occur when parsing the JSON
        // and do nothing because it doesn't matter.
      }
    }
  }, []);

  const setSettingsWithLocalStorage = (settings: Settings) => {
    const newSettings = { ...settings };
    console.log("new settings", newSettings);
    // Save values to local storage
    window.localStorage.setItem(
      SETTINGS_LOCAL_STORAGE_KEY,
      JSON.stringify(newSettings)
    );
    // Update state
    setSettings(newSettings);
  };

  const setSetting = <K extends keyof Settings>(
    key: keyof Settings,
    value: Settings[K]
  ) => {
    debug("setSetting", key, value);
    setSettingsWithLocalStorage({
      ...settings,
      [key]: value,
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSetting,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
