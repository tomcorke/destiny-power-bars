import throttle from "lodash/throttle";
import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { BungieSystemDisabledError, getManifest } from "../services/bungie-api";
import { debug } from "../services/debug";
import { EVENTS, useEvent } from "../services/events";

const doGetManifest = throttle(
  (
    setBungieSystemDisabled: (value: boolean) => void,
    setBungieServiceUnavailable: (value: boolean) => void,
    setManifestError: (value: boolean) => void
  ) => {
    (async () => {
      try {
        const manifestResult = await getManifest();
        if (manifestResult.error) {
          console.error(
            `Error fetching manifest:`,
            manifestResult.error.message
          );
          setManifestError(true);
          if (manifestResult.error instanceof BungieSystemDisabledError) {
            setBungieSystemDisabled(true);
          }
          if (manifestResult.error.message === "503") {
            setBungieServiceUnavailable(true);
          }
          return;
        }
      } catch (e) {
        console.error(e);
        setManifestError(true);
      }
    })();
  },
  500
);

export const enum MANIFEST_STATE {
  UNINITIALIZED = "UNINITIALIZED",
  CHECKING_HASH = "CHECKING_HASH",
  LOADING = "LOADING",
  FETCHING = "FETCHING",
  PARSING = "PARSING",
  STORING = "STORING",
  READY = "READY",
}

type ManifestState = {
  hasManifestError: boolean;
  isBungieSystemDisabled: boolean;
  setBungieSystemDisabled: (value: boolean) => void;
  isBungieServiceUnavailable: boolean;
  setBungieServiceUnavailable: (value: boolean) => void;
  manifestState: MANIFEST_STATE;
};

export const ManifestContext = createContext<ManifestState>({
  hasManifestError: false,
  isBungieSystemDisabled: false,
  setBungieSystemDisabled: () => {},
  isBungieServiceUnavailable: false,
  setBungieServiceUnavailable: () => {},
  manifestState: MANIFEST_STATE.UNINITIALIZED,
});

export const ManifestContextProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const [hasManifestError, setManifestError] = useState(false);
  const [isBungieSystemDisabled, setBungieSystemDisabled] = useState(false);
  const [isBungieServiceUnavailable, setBungieServiceUnavailable] =
    useState(false);
  const [manifestState, setManifestState] = useState<MANIFEST_STATE>(
    MANIFEST_STATE.UNINITIALIZED
  );

  useEvent(EVENTS.GET_MANIFEST, () => {
    setManifestError(false);
    setManifestState(MANIFEST_STATE.CHECKING_HASH);
  });
  useEvent(EVENTS.LOAD_MANIFEST_DATA, () =>
    setManifestState(MANIFEST_STATE.LOADING)
  );
  useEvent(EVENTS.FETCH_MANIFEST_DATA, () =>
    setManifestState(MANIFEST_STATE.FETCHING)
  );
  useEvent(EVENTS.PARSE_MANIFEST_DATA, () =>
    setManifestState(MANIFEST_STATE.PARSING)
  );
  useEvent(EVENTS.STORE_MANIFEST_DATA, () =>
    setManifestState(MANIFEST_STATE.STORING)
  );
  useEvent(EVENTS.MANIFEST_DATA_READY, () => {
    setManifestError(false);
    setManifestState(MANIFEST_STATE.READY);
  });

  useEvent(EVENTS.MANIFEST_FETCH_ERROR, () => {
    debug("doGetManifest on MANIFEST_FETCH_ERROR");
    doGetManifest(
      setBungieSystemDisabled,
      setBungieServiceUnavailable,
      setManifestError
    );
  });

  useEffect(
    () =>
      doGetManifest(
        setBungieSystemDisabled,
        setBungieServiceUnavailable,
        setManifestError
      ),
    [setBungieSystemDisabled, setBungieServiceUnavailable, setManifestError]
  );

  return (
    <ManifestContext.Provider
      value={{
        hasManifestError,
        isBungieSystemDisabled,
        setBungieSystemDisabled,
        isBungieServiceUnavailable,
        setBungieServiceUnavailable,
        manifestState,
      }}
    >
      {children}
    </ManifestContext.Provider>
  );
};
