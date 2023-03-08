import React, { PropsWithChildren } from "react";

import { AuthenticationContextProvider } from "./AuthenticationContext";
import { CharacterDataContextProvider } from "./CharacterDataContext";
import { ManifestContextProvider } from "./ManifestContext";
import { MembershipContextProvider } from "./MembershipContext";

export const AppContextWrapper = ({ children }: PropsWithChildren<{}>) => (
  <AuthenticationContextProvider>
    <ManifestContextProvider>
      <MembershipContextProvider>
        <CharacterDataContextProvider>{children}</CharacterDataContextProvider>
      </MembershipContextProvider>
    </ManifestContextProvider>
  </AuthenticationContextProvider>
);
