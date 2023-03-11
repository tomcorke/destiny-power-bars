import React, { PropsWithChildren } from "react";

import { AuthenticationContextProvider } from "./AuthenticationContext";
import { CharacterDataContextProvider } from "./CharacterDataContext";
import { ManifestContextProvider } from "./ManifestContext";
import { MembershipContextProvider } from "./MembershipContext";
import { SettingsContextProvider } from "./SettingsContext";

export const AppContextWrapper = ({ children }: PropsWithChildren<{}>) => (
  <SettingsContextProvider>
    <AuthenticationContextProvider>
      <ManifestContextProvider>
        <MembershipContextProvider>
          <CharacterDataContextProvider>
            {children}
          </CharacterDataContextProvider>
        </MembershipContextProvider>
      </ManifestContextProvider>
    </AuthenticationContextProvider>
  </SettingsContextProvider>
);
