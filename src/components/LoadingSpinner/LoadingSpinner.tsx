import React, { useContext } from "react";

import { AuthenticationContext } from "../../contexts/AuthenticationContext";
import { CharacterDataContext } from "../../contexts/CharacterDataContext";
import {
  ManifestContext,
  MANIFEST_STATE,
} from "../../contexts/ManifestContext";
import { MembershipContext } from "../../contexts/MembershipContext";

import STYLES from "./LoadingSpinner.module.scss";

const MANIFEST_STATE_MESSAGE = {
  [MANIFEST_STATE.UNINITIALIZED]: "Loading Destiny Manifest...",
  [MANIFEST_STATE.LOADING]: "Loading Destiny Manifest...",
  [MANIFEST_STATE.CHECKING_HASH]: "Checking Destiny Manifest Hash...",
  [MANIFEST_STATE.FETCHING]: "Fetching Destiny Manifest...",
  [MANIFEST_STATE.PARSING]: "Parsing Destiny Manifest...",
  [MANIFEST_STATE.STORING]: "Storing Destiny Manifest...",
  [MANIFEST_STATE.READY]: "Loaded Destiny Manifest",
};

const LoadingSpinner = () => {
  const { isAuthed, hasAuthError, startManualAuth } = useContext(
    AuthenticationContext
  );
  const {
    manifestState,
    hasManifestError,
    isBungieSystemDisabled,
    isBungieServiceUnavailable,
  } = useContext(ManifestContext);
  const { hasSelectedMembership } = useContext(MembershipContext);
  const { characterData } = useContext(CharacterDataContext);

  let status: string | JSX.Element = "";
  if (isBungieSystemDisabled) {
    status = (
      <span>
        Bungie API disabled.
        <br />
        Check{" "}
        <a
          href="https://www.bungie.net/en/Help/Article/13125"
          target="_blank"
          rel="noopener noreferrer"
        >
          Bungie's server and update status page
        </a>{" "}
        for more information
      </span>
    );
  } else if (isBungieServiceUnavailable) {
    status = (
      <span>
        Bungie API unavailable.
        <br />
        Check{" "}
        <a
          href="https://www.bungie.net/en/Help/Article/13125"
          target="_blank"
          rel="noopener noreferrer"
        >
          Bungie's server and update status page
        </a>{" "}
        for more information
      </span>
    );
  } else if (hasAuthError) {
    status = (
      <span
        className={STYLES.statusAuthError}
        onClick={() => startManualAuth()}
      >
        Bungie.net authentication required
      </span>
    );
  } else if (hasManifestError) {
    status = (
      <span>
        Error loading manifest, if this persists try{" "}
        <a href="/">refreshing the page</a>!
      </span>
    );
  } else if (!isAuthed) {
    status = "Authenticating...";
  } else if (!hasSelectedMembership) {
    status = "Waiting for Destiny platform selection...";
  } else if (manifestState !== MANIFEST_STATE.READY) {
    status = MANIFEST_STATE_MESSAGE[manifestState] || manifestState;
  } else if (!characterData) {
    status = "Fetching character data...";
  }

  if (!status) {
    return null;
  }

  return (
    <div className={STYLES.loading}>
      <div className={STYLES.anchor}>
        <div className={STYLES.spinnerLarge} />
        <div className={STYLES.spinnerLargeDouble} />
        <div className={STYLES.spinnerSmall} />
        <div className={STYLES.spinnerSmallDouble} />
      </div>
      <div className={STYLES.status}>{status}</div>
    </div>
  );
};

export default LoadingSpinner;
