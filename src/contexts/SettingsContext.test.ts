import React, { act, useContext } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

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

  it("keeps defaults when persisted settings fail validation", async () => {
    localStorage.setItem(
      SETTINGS_LOCAL_STORAGE_KEY,
      JSON.stringify({ useMultipleExotics: "invalid" })
    );
    await renderSettings();
    expect(JSON.parse(container.textContent!).useMultipleExotics).toBe(true);
  });
});
