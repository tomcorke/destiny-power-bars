import React, { act, useContext } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SETTINGS_LOCAL_STORAGE_KEY } from "../constants";

import { SettingsContext, SettingsContextProvider } from "./SettingsContext";

const SettingsProbe = () => {
  const { settings, setSetting } = useContext(SettingsContext);
  return React.createElement(
    "button",
    {
      onClick: () =>
        setSetting("useMultipleExotics", !settings.useMultipleExotics),
    },
    JSON.stringify(settings)
  );
};

const expectedDefaults = {
  itemLockingEnabled: false,
  useMultipleExotics: true,
  displayEngrams: true,
  displayEngramsOnlyWhenRelevant: true,
  displayLegendaryCampaignHints: true,
  useDarkerCharacterBackground: false,
  displayAccountWidePower: true,
  displayOnlyAccountWidePower: false,
  displayVendorItems: true,
  displayOnlyAbovePowerVendorItems: false,
};

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  localStorage.clear();
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(async () => {
  await act(() => root.unmount());
  localStorage.clear();
  vi.restoreAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: false });
});

const renderSettings = () =>
  act(() => {
    root.render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(
          SettingsContextProvider,
          null,
          React.createElement(SettingsProbe)
        )
      )
    );
  });

describe("settings under React strict mounting", () => {
  it("restores stored settings, fills defaults and persists changes", async () => {
    localStorage.setItem(
      SETTINGS_LOCAL_STORAGE_KEY,
      JSON.stringify({ useMultipleExotics: false })
    );
    await renderSettings();
    expect(JSON.parse(container.textContent!)).toMatchObject({
      useMultipleExotics: false,
      displayEngrams: true,
    });

    await act(() => container.querySelector("button")!.click());
    expect(JSON.parse(container.textContent!).useMultipleExotics).toBe(true);
    expect(
      JSON.parse(localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY)!)
    ).toMatchObject({
      useMultipleExotics: true,
      displayEngrams: true,
    });
  });

  it.each([null, "", "{}"])(
    "uses all defaults for empty settings %s",
    async (stored) => {
      if (stored !== null) {
        localStorage.setItem(SETTINGS_LOCAL_STORAGE_KEY, stored);
      }
      await renderSettings();
      expect(JSON.parse(container.textContent!)).toEqual(expectedDefaults);
    }
  );

  it("preserves every saved boolean preference", async () => {
    const savedSettings = Object.fromEntries(
      Object.entries(expectedDefaults).map(([key, value]) => [key, !value])
    );
    const stored = JSON.stringify(savedSettings);
    localStorage.setItem(SETTINGS_LOCAL_STORAGE_KEY, stored);
    await renderSettings();
    expect(JSON.parse(container.textContent!)).toEqual(savedSettings);
    expect(localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY)).toBe(stored);
  });

  it.each([
    { useMultipleExotics: "invalid", displayEngrams: false },
    { itemLockingEnabled: null },
    { displayVendorItems: 0 },
    null,
    [],
    false,
  ])("keeps all defaults for invalid settings %j", async (savedSettings) => {
    const stored = JSON.stringify(savedSettings);
    localStorage.setItem(SETTINGS_LOCAL_STORAGE_KEY, stored);
    await renderSettings();
    expect(JSON.parse(container.textContent!)).toEqual(expectedDefaults);
    expect(localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY)).toBe(stored);
  });

  it("keeps defaults and reports malformed JSON without overwriting storage", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem(SETTINGS_LOCAL_STORAGE_KEY, "{");
    await renderSettings();
    expect(JSON.parse(container.textContent!)).toEqual(expectedDefaults);
    expect(localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY)).toBe("{");
    expect(errors).toHaveBeenCalledWith(
      "Error loading settings from local storage"
    );
  });
});
