import useInterval from "@use-it/interval";
import { UserInfoCard } from "bungie-api-ts/user";
import preval from "preval.macro";
import React, { useCallback, useEffect, useState } from "react";

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
import { EVENTS, useEvent } from "./services/events";
import { getCharacterData } from "./services/utils";

import "normalize.css";
import "./index.css";

import STYLES from "./App.module.scss";

const CHARACTER_DATA_REFRESH_TIMER = 15000;

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

  const [manifestState, setManifestState] = useState<string>("Unknown");
  useEvent(EVENTS.GET_MANIFEST, () =>
    setManifestState("Checking manifest version")
  );
  useEvent(EVENTS.LOAD_MANIFEST_DATA, () =>
    setManifestState("Loading manifest data")
  );
  useEvent(EVENTS.FETCH_MANIFEST_DATA, () =>
    setManifestState("Fetching manifest data from Bungie")
  );
  useEvent(EVENTS.PARSE_MANIFEST_DATA, () =>
    setManifestState("Processing manifest data")
  );
  useEvent(EVENTS.STORE_MANIFEST_DATA, () =>
    setManifestState("Saving manifest data")
  );
  useEvent(EVENTS.MANIFEST_DATA_READY, () =>
    setManifestState("Manifest ready")
  );

  useEvent(EVENTS.LOG_OUT, () => setIsAuthed(false));

  const hasManifestData = manifestState === "Manifest ready";

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

  const doGetCharacterData = useCallback(
    (returnBasicCharacterData: boolean = false) => {
      const updateCharacterData = (newData: CharacterData[]) => {
        const newOverallPower = Math.max(...newData.map(c => c.overallPower));
        const newArtifactPower = Math.max(
          ...newData.map(c => c.artifactData!.bonusPower)
        );
        const newTotalPower = newOverallPower + newArtifactPower;
        ga.event({
          category: "Power Report",
          action: "Maximum power",
          value: newTotalPower,
          nonInteraction: true
        });

        if (
          characterData &&
          characterData[0] &&
          characterData[0].artifactData
        ) {
          const currentOverallPower = Math.max(
            ...characterData.map(c => c.overallPower)
          );
          const currentArtifactPower = Math.max(
            ...characterData.map(c => c.artifactData!.bonusPower)
          );
          if (currentArtifactPower < newArtifactPower) {
            ga.event({
              category: "Power Report",
              action: "Artifact power increase",
              value: newArtifactPower,
              nonInteraction: true
            });
          }
          if (currentOverallPower < newOverallPower) {
            ga.event({
              category: "Power Report",
              action: "Gear power increase",
              value: newOverallPower,
              nonInteraction: true
            });
          }
        }
        setCharacterData(newData);
      };

      if (!isFetchingCharacterData) {
        try {
          getCharacterData(
            characterData,
            updateCharacterData,
            setIsFetchingCharacterData,
            returnBasicCharacterData
          );
        } catch (e) {
          console.error("Error fetching character data:", e);
        }
      }
    },
    [
      characterData,
      setCharacterData,
      isFetchingCharacterData,
      setIsFetchingCharacterData
    ]
  );

  useInterval(() => {
    if (isAuthed && hasSelectedMembership && !isFetchingCharacterData) {
      doGetCharacterData();
    }
  }, CHARACTER_DATA_REFRESH_TIMER);

  useEffect(() => {
    if (!characterData && !isFetchingCharacterData) {
      doGetCharacterData();
    }
  }, [characterData, isFetchingCharacterData, doGetCharacterData]);

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
    status = manifestState;
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
