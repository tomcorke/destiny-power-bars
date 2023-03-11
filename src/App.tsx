import classnames from "classnames";
import React, { useContext } from "react";

import STYLES from "./App.module.scss";
import CombinedHeader from "./components/CombinedHeader";
import FetchSpinner from "./components/FetchSpinner";
import Footer from "./components/Footer";
import { LoadingChecklist } from "./components/LoadingChecklist";
import LoadingSpinner from "./components/LoadingSpinner";
import LoggedOutHeader from "./components/LoggedOutHeader";
import LoginPrompt from "./components/LoginPrompt";
import MembershipSelect from "./components/MembershipSelect";
import { MultiCharacterDisplay } from "./components/MultiCharacterDisplay";
import RedactedWarning from "./components/RedactedWarning";
import ToastOverlay from "./components/ToastOverlay";
import { AppContextWrapper } from "./contexts/AppContextWrapper";
import { AuthenticationContext } from "./contexts/AuthenticationContext";
import { CharacterDataContext } from "./contexts/CharacterDataContext";

import "normalize.css";
import "./index.css";

export const AppWrapper = ({
  children,
  top = false,
}: {
  children: JSX.Element | (JSX.Element | null)[];
  top?: boolean;
}) => {
  return (
    <div className={STYLES.App}>
      <div className={classnames(STYLES.AppInner, { [STYLES.top]: top })}>
        {children}
      </div>

      <ToastOverlay />
    </div>
  );
};

const AppContent = () => {
  const { isAuthed, hasAuthError, disableManualLogin } = useContext(
    AuthenticationContext
  );
  const { characterData } = useContext(CharacterDataContext);

  if (isAuthed && characterData) {
    return (
      <>
        <AppWrapper top>
          <CombinedHeader />
          <MultiCharacterDisplay />
          <RedactedWarning />
          <LoadingSpinner />
          <FetchSpinner />
        </AppWrapper>
        <Footer withMobilePadding />
      </>
    );
  }

  if (hasAuthError && !disableManualLogin) {
    return (
      <>
        <AppWrapper>
          <LoggedOutHeader />
          <LoginPrompt />
        </AppWrapper>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AppWrapper>
        <MembershipSelect />
        <LoadingChecklist />
        <LoadingSpinner />
      </AppWrapper>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <AppContextWrapper>
      <AppContent />
    </AppContextWrapper>
  );
};

export default App;
