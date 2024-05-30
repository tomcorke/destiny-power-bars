import useInterval from "@rooks/use-interval";
import throttle from "lodash/throttle";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { CHARACTER_DATA_REFRESH_TIMER } from "../constants";
import { BungieSystemDisabledError } from "../services/bungie-api";
import {
  bustProfileCache,
  getCachedCharacterData,
  getCharacterData,
  PowerBarsCharacterData,
} from "../services/character-data";
import { debug } from "../services/debug";
import eventEmitter, { EVENTS, useEvent } from "../services/events";
import { hasPower, nonNullable } from "../services/items/filtering";
import { lockItems } from "../services/lock-items";

import { AuthenticationContext } from "./AuthenticationContext";
import { ManifestContext } from "./ManifestContext";
import { MembershipContext } from "./MembershipContext";
import { SettingsContext } from "./SettingsContext";

const throttledGetCharacterData = throttle(() => {
  eventEmitter.emit(EVENTS.FETCHING_CHARACTER_DATA_CHANGE, true);
  return getCharacterData();
}, 500);

type CharacterDataState = {
  characterData: PowerBarsCharacterData | undefined;
  isFetchingCharacterData: boolean;
  forceRefresh: () => Promise<void>;
};

export const CharacterDataContext = createContext<CharacterDataState>({
  characterData: undefined,
  isFetchingCharacterData: false,
  forceRefresh: async () => {},
});

export const CharacterDataContextProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const { isAuthed } = useContext(AuthenticationContext);
  const { hasSelectedMembership } = useContext(MembershipContext);
  const { setBungieSystemDisabled, setBungieServiceUnavailable } =
    useContext(ManifestContext);
  const { settings } = useContext(SettingsContext);

  const [characterData, setCharacterData] = useState<
    PowerBarsCharacterData | undefined
  >();

  const [isFetchingCharacterData, setIsFetchingCharacterData] = useState(false);

  useEvent(EVENTS.FETCHING_CHARACTER_DATA_CHANGE, (value: boolean) =>
    setIsFetchingCharacterData(value)
  );

  const [hasLoadedCachedCharacterData, setHasLoadedCachedCharacterData] =
    useState(false);

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const handleData = useCallback((data?: PowerBarsCharacterData) => {
    if (!data) {
      return;
    }

    setCharacterData(data);

    // After successful character data fetching, trigger locking items
    debug(
      "after data fetch",
      "lockItems",
      settingsRef.current.itemLockingEnabled
    );
    if (settingsRef.current.itemLockingEnabled) {
      Object.entries(data.characters).forEach(([characterId, data]) => {
        lockItems(
          { characterId, membershipType: data.membershipType },
          Object.values(data.topItems.topItemsBySlot)
            .filter(nonNullable)
            .filter(hasPower)
        );
      });
    }
  }, []);

  const doGetCharacterData = useCallback(() => {
    debug("doGetCharacterData");
    const promise = throttledGetCharacterData();
    if (promise) {
      promise
        .then(handleData)
        .catch((error) => {
          if (error instanceof BungieSystemDisabledError) {
            setBungieSystemDisabled(true);
          }
          if ("message" in error && error.message === "503") {
            setBungieServiceUnavailable(true);
          }
          console.error("Error fetching character data:", error);
        })
        .finally(() => setIsFetchingCharacterData(false));
    }
  }, [handleData, setBungieSystemDisabled, setBungieServiceUnavailable]);

  useEffect(() => {
    if (isAuthed && hasSelectedMembership && !hasLoadedCachedCharacterData) {
      setHasLoadedCachedCharacterData(true);
      getCachedCharacterData()
        .then((data) => {
          if (data) {
            setCharacterData(data);
          }
        })
        .catch((err) => console.warn(err));

      // Also trigger immediate live fetch
      doGetCharacterData();
    }
  }, [
    isAuthed,
    hasSelectedMembership,
    hasLoadedCachedCharacterData,
    doGetCharacterData,
  ]);

  useInterval(() => {
    if (isAuthed && hasSelectedMembership && !isFetchingCharacterData) {
      doGetCharacterData();
    }
  }, CHARACTER_DATA_REFRESH_TIMER);

  const forceRefresh = useCallback(async () => {
    if (!characterData) {
      return;
    }

    await bustProfileCache(characterData);
    doGetCharacterData();
  }, [characterData, doGetCharacterData]);

  return (
    <CharacterDataContext.Provider
      value={{ characterData, isFetchingCharacterData, forceRefresh }}
    >
      {children}
    </CharacterDataContext.Provider>
  );
};
