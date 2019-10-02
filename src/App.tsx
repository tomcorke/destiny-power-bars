import { UserInfoCard } from "bungie-api-ts/user";
import React, { useEffect, useState } from "react";

import {
  auth,
  hasSelectedDestinyMembership,
  hasValidAuth,
  setSelectedDestinyMembership
} from "./services/bungie-auth";
import { CharacterData } from "./types";

import CharacterDisplay from "./components/CharacterDisplay";
import LoadingSpinner from "./components/LoadingSpinner";
import MembershipSelect from "./components/MembershipSelect";
import { getManifest } from "./services/bungie-api";
import { getCharacterData } from "./services/utils";

import "normalize.css";
import STYLES from "./App.module.scss";

let characterDataRefreshTimer: number | undefined;

const App = () => {
  const [isAuthed, setIsAuthed] = useState<boolean>(hasValidAuth());
  const [hasAuthError, setAuthError] = useState<boolean>(false);
  const [hasMembership, setHasMembership] = useState<boolean>(
    hasSelectedDestinyMembership()
  );
  const [hasManifestData, setHasManifestData] = useState<boolean>(false);
  const [hasManifestError, setManifestError] = useState<boolean>(false);
  const [isFetchingCharacterData, setIsFetchingCharacterData] = useState<
    boolean
  >(false);
  const [characterData, setCharacterData] = useState<
    CharacterData[] | undefined
  >(undefined);

  useEffect(() => {
    const doAuth = async () => {
      const authResult = await auth();
      if (authResult) {
        setIsAuthed(true);
      } else {
        setAuthError(true);
      }
    };
    if (!isAuthed) {
      doAuth();
    }
  });

  useEffect(() => {
    (async () => {
      try {
        await getManifest();
        setHasManifestData(true);
      } catch (e) {
        console.error(e.message);
        setManifestError(true);
      }
    })();
  });

  useEffect(() => {
    const doGetCharacterData = (returnBasicCharacterData: boolean = false) =>
      getCharacterData(
        setCharacterData,
        setIsFetchingCharacterData,
        returnBasicCharacterData
      );
    if (isAuthed && hasMembership && !isFetchingCharacterData) {
      if (!characterDataRefreshTimer) {
        characterDataRefreshTimer = setInterval(doGetCharacterData, 10000);
        doGetCharacterData(true);
      }
    }
  }, [isAuthed, hasMembership, hasManifestData, isFetchingCharacterData]);

  const onSelectMembership = (membership: UserInfoCard) => {
    setSelectedDestinyMembership(membership);
    setHasMembership(true);
  };

  let status = "";
  if (hasAuthError) {
    status = "Authentication error, refresh page to try again!";
  } else if (hasManifestError) {
    status = "Error fetching manifest, refresh page to try again!";
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
        {status && <LoadingSpinner status={status} />}
      </div>
    );
  }

  return (
    <div className={STYLES.App}>
      <LoadingSpinner status={status} />
      <MembershipSelect onMembershipSelect={onSelectMembership} />
    </div>
  );
};

export default App;
