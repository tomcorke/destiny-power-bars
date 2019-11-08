import { UserInfoCard } from "bungie-api-ts/user";
import preval from "preval.macro";
import React, { useEffect, useState } from "react";

import {
  auth,
  hasSelectedDestinyMembership,
  hasValidAuth,
  setSelectedDestinyMembership
} from "./services/bungie-auth";
import ga from "./services/ga";
import { CharacterData } from "./types";

import CharacterDisplay from "./components/CharacterDisplay";
import FetchSpinner from "./components/FetchSpinner";
import { Kofi } from "./components/KoFi";
import LoadingSpinner from "./components/LoadingSpinner";
import MembershipSelect from "./components/MembershipSelect";
import { VendorDisplay } from "./components/VendorDisplay";
import api from "./services/api";
import {
  BungieSystemDisabledError,
  getManifest,
  ManifestData
} from "./services/bungie-api";
import { getCharacterData } from "./services/utils";

import "normalize.css";
import "./index.css";

import STYLES from "./App.module.scss";

const CHARACTER_DATA_REFRESH_TIMER = 15000;

let characterDataRefreshTimer: number | undefined;

const AUTO_PAGE_REFRESH_DELAY = 5000;

const refreshPage = () => {
  window.location.search = "";
};

export const AppWrapper = ({ children }: { children: JSX.Element }) => {
  return <div className={STYLES.App}>{children}</div>;
};

const App = () => {
  const [isAuthed, setIsAuthed] = useState<boolean>(hasValidAuth());
  const [hasAuthError, setAuthError] = useState<boolean>(false);
  const [hasSelectedMembership, setHasMembership] = useState<boolean>(
    hasSelectedDestinyMembership()
  );
  const [manifestData, setManifestData] = useState<ManifestData | undefined>(
    undefined
  );
  const [hasManifestError, setManifestError] = useState<boolean>(false);
  const [isBungieSystemDisabled, setBungieSystemDisabled] = useState<boolean>(
    false
  );
  const [isFetchingCharacterData, setIsFetchingCharacterData] = useState<
    boolean
  >(false);
  const [characterData, setCharacterData] = useState<
    CharacterData[] | undefined
  >(undefined);

  const hasManifestData = !!manifestData;

  useEffect(() => {
    const doAuth = async () => {
      const authResult = await auth();
      if (authResult) {
        setIsAuthed(true);
      } else {
        setAuthError(true);
        // Refresh automatically in 30s
        setTimeout(refreshPage, AUTO_PAGE_REFRESH_DELAY);
      }
    };
    if (!isAuthed) {
      doAuth();
    }
  }, [isAuthed]);

  useEffect(() => {
    (async () => {
      try {
        const manifestResult = await getManifest();
        if (manifestResult.error) {
          console.error(manifestResult.error.message);
          setManifestError(true);
          if (manifestResult.error instanceof BungieSystemDisabledError) {
            setBungieSystemDisabled(true);
          }
          return;
        }
        setManifestData(manifestResult.manifest);
      } catch (e) {
        console.error(e);
        setManifestError(true);
      }
    })();
  }, []);

  useEffect(() => {
    const doGetCharacterData = (returnBasicCharacterData: boolean = false) => {
      if (!isFetchingCharacterData) {
        try {
          getCharacterData(
            setCharacterData,
            setIsFetchingCharacterData,
            returnBasicCharacterData
          );
        } catch (e) {
          console.error("Error fetching character data:", e);
        }
      }
    };
    if (isAuthed && hasSelectedMembership && !isFetchingCharacterData) {
      if (!characterDataRefreshTimer) {
        characterDataRefreshTimer = setInterval(
          doGetCharacterData,
          CHARACTER_DATA_REFRESH_TIMER
        );
        doGetCharacterData(true);
        (window as any).refreshCharacterData = () => doGetCharacterData();
      }
    }
  }, [
    isAuthed,
    hasSelectedMembership,
    hasManifestData,
    isFetchingCharacterData
  ]);

  const onSelectMembership = (membership: UserInfoCard) => {
    ga.event({
      category: "Platform",
      action: "Select platform",
      label: `Membership type: ${membership.membershipType}`
    });
    setSelectedDestinyMembership(membership);
    setHasMembership(true);
  };

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
  } else if (hasAuthError) {
    status = (
      <span>
        Authentication error, <a href="/">refresh page</a> to try again!
      </span>
    );
  } else if (hasManifestError) {
    status = (
      <span>
        Error fetching manifest, <a href="/">refresh page</a> to try again!
      </span>
    );
  } else if (!isAuthed) {
    status = "Authenticating...";
  } else if (!hasSelectedMembership) {
    status = "Waiting for Destiny platform selection...";
  } else if (!hasManifestData) {
    status = "Fetching Destiny item manifest...";
  } else if (!characterData || characterData.length === 0) {
    if (isFetchingCharacterData) {
      status = "Fetching character data...";
    } else {
      status = "No character data";
    }
  }

  (window as any).characterData = characterData;

  const gitHead = (process.env.REACT_APP_NPM_PACKAGE_GITHEAD || "").substr(
    0,
    6
  );

  const buildTimestamp = preval`module.exports = new Date().toISOString();`;

  if (characterData && characterData.length > 0) {
    return (
      <div className={STYLES.App}>
        <MembershipSelect api={api} onMembershipSelect={onSelectMembership} />
        <div className={STYLES.charactersContainer}>
          <div className={STYLES.characters}>
            {characterData.map(c => (
              <CharacterDisplay key={c.character.characterId} data={c} />
            ))}
          </div>
        </div>
        <VendorDisplay manifestData={manifestData} />
        {status && <LoadingSpinner>{status}</LoadingSpinner>}
        {isFetchingCharacterData && <FetchSpinner />}
        <div className={STYLES.buildStamp}>
          {gitHead} {buildTimestamp}
        </div>
        <Kofi />
      </div>
    );
  }

  return (
    <div className={STYLES.App}>
      <MembershipSelect api={api} onMembershipSelect={onSelectMembership} />
      <LoadingSpinner>{status}</LoadingSpinner>
      <div className={STYLES.buildStamp}>
        {gitHead} {buildTimestamp}
      </div>
      <Kofi />
    </div>
  );
};

export default App;
