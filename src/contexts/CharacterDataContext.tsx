import useInterval from "@use-it/interval";
import throttle from "lodash/throttle";
import React, {
  createContext,
  PropsWithChildren,
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
import eventEmitter, { EVENTS, useEvent } from "../services/events";

import { AuthenticationContext } from "./AuthenticationContext";
import { ManifestContext } from "./ManifestContext";
import { MembershipContext } from "./MembershipContext";

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

  const [characterData, setCharacterData] = useState<
    PowerBarsCharacterData | undefined
  >();

  const [isFetchingCharacterData, setIsFetchingCharacterData] = useState(false);

  useEvent(EVENTS.FETCHING_CHARACTER_DATA_CHANGE, (value: boolean) =>
    setIsFetchingCharacterData(value)
  );

  const [hasLoadedCachedCharacterData, setHasLoadedCachedCharacterData] =
    useState(false);

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
    }
  }, [isAuthed, hasSelectedMembership, hasLoadedCachedCharacterData]);

  const doGetCharacterData = useRef(() => {
    const promise = throttledGetCharacterData();
    if (promise) {
      promise
        .then((data) => {
          if (data) {
            setCharacterData(data);
          }
        })
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
  });

  useInterval(() => {
    if (isAuthed && hasSelectedMembership && !isFetchingCharacterData) {
      doGetCharacterData.current();
    }
  }, CHARACTER_DATA_REFRESH_TIMER);

  const forceRefresh = async () => {
    if (!characterData) {
      return;
    }

    await bustProfileCache(characterData);
    doGetCharacterData.current();
  };

  return (
    <CharacterDataContext.Provider
      value={{ characterData, isFetchingCharacterData, forceRefresh }}
    >
      {children}
    </CharacterDataContext.Provider>
  );
};
