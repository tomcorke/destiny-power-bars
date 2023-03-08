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
import { BungieSystemDisabledError } from "../services/bungie-api";
import { EVENTS, useEvent } from "../services/events";
import {
  bustProfileCache,
  getCachedCharacterData,
  getCharacterData,
  getIsFetchingCharacterData,
} from "../services/utils";
import { PowerBarsCharacterData } from "../types";
import { AuthenticationContext } from "./AuthenticationContext";
import { ManifestContext } from "./ManifestContext";
import { MembershipContext } from "./MembershipContext";

const CHARACTER_DATA_REFRESH_TIMER = 15000;

const throttledGetCharacterData = throttle(getCharacterData, 500);

type CharacterDataState = {
  characterData: PowerBarsCharacterData[];
  isFetchingCharacterData: boolean;
  forceRefresh: () => Promise<void>;
};

export const CharacterDataContext = createContext<CharacterDataState>({
  characterData: [],
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

  const [characterData, setCharacterData] = useState<PowerBarsCharacterData[]>(
    []
  );

  const [isFetchingCharacterData, setIsFetchingCharacterData] = useState(false);

  useEvent(EVENTS.FETCHING_CHARACTER_DATA_CHANGE, () =>
    setIsFetchingCharacterData(getIsFetchingCharacterData())
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
