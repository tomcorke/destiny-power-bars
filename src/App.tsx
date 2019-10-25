import { UserInfoCard } from "bungie-api-ts/user";
import React, { useEffect, useState } from "react";
import ga from "./services/ga";

import {
  auth,
  hasSelectedDestinyMembership,
  hasValidAuth,
  setSelectedDestinyMembership
} from "./services/bungie-auth";
import { CharacterData } from "./types";

import CharacterDisplay from "./components/CharacterDisplay";
import FetchSpinner from "./components/FetchSpinner";
import { Kofi } from "./components/KoFi";
import LoadingSpinner from "./components/LoadingSpinner";
import MembershipSelect from "./components/MembershipSelect";
import { VendorDisplay } from "./components/VendorDisplay";
import { getManifest, ManifestData } from "./services/bungie-api";
import { getCharacterData } from "./services/utils";

import STYLES from "./App.module.scss";

const CHARACTER_DATA_REFRESH_TIMER = 15000;

let characterDataRefreshTimer: number | undefined;

const AUTO_PAGE_REFRESH_DELAY = 5000;

const refreshPage = () => {
  window.location.search = "";
};

const App = () => {
  const [isAuthed, setIsAuthed] = useState<boolean>(hasValidAuth());
  const [hasAuthError, setAuthError] = useState<boolean>(false);
  const [hasMembership, setHasMembership] = useState<boolean>(
    hasSelectedDestinyMembership()
  );
  const [manifestData, setManifestData] = useState<ManifestData | undefined>(
    undefined
  );
  const [hasManifestError, setManifestError] = useState<boolean>(false);
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
        const data = await getManifest();
        setManifestData(data);
      } catch (e) {
        console.error(e.message);
        setManifestError(true);
      }
    })();
  }, []);

  useEffect(() => {
    const doGetCharacterData = (returnBasicCharacterData: boolean = false) => {
      if (!isFetchingCharacterData) {
        getCharacterData(
          setCharacterData,
          setIsFetchingCharacterData,
          returnBasicCharacterData
        );
      }
    };
    if (isAuthed && hasMembership && !isFetchingCharacterData) {
      if (!characterDataRefreshTimer) {
        characterDataRefreshTimer = setInterval(
          doGetCharacterData,
          CHARACTER_DATA_REFRESH_TIMER
        );
        doGetCharacterData(true);
        (window as any).refreshCharacterData = () => doGetCharacterData();
      }
    }
  }, [isAuthed, hasMembership, hasManifestData, isFetchingCharacterData]);

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
  if (hasAuthError) {
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
  } else if (!hasMembership) {
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

  if (characterData && characterData.length > 0) {
    return (
      <div className={STYLES.App}>
        <MembershipSelect onMembershipSelect={onSelectMembership} />
        <div className={STYLES.charactersContainer}>
          <div className={STYLES.characters}>
            {characterData.map(c => (
              <CharacterDisplay key={c.id} data={c} />
            ))}
          </div>
        </div>
        <VendorDisplay manifestData={manifestData} />
        {status && <LoadingSpinner>{status}</LoadingSpinner>}
        {isFetchingCharacterData && <FetchSpinner />}
        <Kofi />
      </div>
    );
  }

  return (
    <div className={STYLES.App}>
      <MembershipSelect onMembershipSelect={onSelectMembership} />
      <LoadingSpinner>{status}</LoadingSpinner>
      <Kofi />
    </div>
  );
};

export default App;
