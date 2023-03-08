import React, {
  PropsWithChildren,
  createContext,
  useState,
  useEffect,
} from "react";
import throttle from "lodash/throttle";

import {
  auth,
  hasManuallyAuthed,
  hasValidAuth,
  logOut,
  manualStartAuth,
} from "../services/bungie-auth";
import { EVENTS, useEvent } from "../services/events";

const doAuth = throttle(
  (
    setIsAuthed: (value: boolean) => void,
    setAuthError: (value: boolean) => void
  ) => {
    (async () => {
      try {
        const authResult = await auth();
        if (authResult) {
          setIsAuthed(true);
          setAuthError(false);
        } else {
          setIsAuthed(false);
          setAuthError(true);
        }
      } catch (e) {
        console.error(e);
        setIsAuthed(false);
        setAuthError(true);
      }
    })();
  },
  100
);

type AuthenticationState = {
  disableManualLogin: boolean;
  isAuthed: boolean;
  hasAuthError: boolean;
  startManualAuth: () => void;
  logOut: () => void;
};

export const AuthenticationContext = createContext<AuthenticationState>({
  disableManualLogin: false,
  isAuthed: false,
  hasAuthError: false,
  startManualAuth: () => {},
  logOut: () => {},
});

export const AuthenticationContextProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const [disableManualLogin, setDisableManualLogin] = useState(
    hasManuallyAuthed()
  );
  const [isAuthed, setIsAuthed] = useState(hasValidAuth());
  const [hasAuthError, setAuthError] = useState(false);

  useEvent(EVENTS.LOG_OUT, () => {
    setIsAuthed(false);
    setDisableManualLogin(false);
  });

  useEffect(() => {
    if (!isAuthed) {
      doAuth(setIsAuthed, setAuthError);
    }
  }, [isAuthed, setIsAuthed, setAuthError]);

  return (
    <AuthenticationContext.Provider
      value={{
        disableManualLogin,
        isAuthed,
        hasAuthError,
        startManualAuth: manualStartAuth,
        logOut,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
