import classnames from "classnames";
import React, { useContext } from "react";

import { AppContextWrapper } from "../../contexts/AppContextWrapper";
import { AuthenticationContext } from "../../contexts/AuthenticationContext";
import { CharacterDataContext } from "../../contexts/CharacterDataContext";
import CombinedHeader from "../CombinedHeader";
import FetchSpinner from "../FetchSpinner";
import Footer from "../Footer";
import { LoadingChecklist } from "../LoadingChecklist";
import LoadingSpinner from "../LoadingSpinner";
import LoggedOutHeader from "../LoggedOutHeader";
import LoginPrompt from "../LoginPrompt";
import MembershipSelect from "../MembershipSelect";
import { MultiCharacterDisplay } from "../MultiCharacterDisplay";
import RedactedWarning from "../RedactedWarning";
import ToastOverlay from "../ToastOverlay";

import STYLES from "./App.module.scss";

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
