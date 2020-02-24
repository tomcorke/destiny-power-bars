import useInterval from "@use-it/interval";
import { UserInfoCard } from "bungie-api-ts/user";
import classnames from "classnames";
import throttle from "lodash/throttle";
import React, { useCallback, useEffect, useState } from "react";

import {
  auth,
  hasManuallyAuthed,
  hasSelectedDestinyMembership,
  hasValidAuth,
  manualStartAuth,
  setSelectedDestinyMembership
} from "./services/bungie-auth";
import ga from "./services/ga";
import { PowerBarsCharacterData } from "./types";

import CharacterDisplay from "./components/CharacterDisplay";
import FetchSpinner from "./components/FetchSpinner";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import LoadingSpinner from "./components/LoadingSpinner";
import { LoginPrompt } from "./components/LoginPrompt";
import MembershipSelect from "./components/MembershipSelect";
import { VendorDisplay } from "./components/VendorDisplay";
import api from "./services/api";
import {
  BungieSystemDisabledError,
  getManifest,
  ManifestData
} from "./services/bungie-api";
import { EVENTS, useEvent } from "./services/events";
import {
  getCachedCharacterData,
  getCharacterData,
  getIsFetchingCharacterData,
  loadCharacterDisplayOrder,
  saveCharacterDisplayOrder
} from "./services/utils";

import "normalize.css";
import "./index.css";

import STYLES from "./App.module.scss";
import {
  LoadingChecklist,
  LoadingChecklistItem
} from "./components/LoadingChecklist";
import { Stonks } from "./components/Stonks";

const CHARACTER_DATA_REFRESH_TIMER = 15000;

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

const doGetManifest = throttle(
  (
    setBungieSystemDisabled: (value: boolean) => void,
    setBungieServiceUnavailable: (value: boolean) => void,
    setManifestData: (value: ManifestData) => void,
    setManifestError: (value: boolean) => void
  ) => {
    (async () => {
      try {
        const manifestResult = await getManifest();
        if (manifestResult.error) {
          console.error(
            `Error fetching manifest:`,
            manifestResult.error.message
          );
          setManifestError(true);
          if (manifestResult.error instanceof BungieSystemDisabledError) {
            setBungieSystemDisabled(true);
          }
          if (manifestResult.error.message === "503") {
            setBungieServiceUnavailable(true);
          }
          return;
        }
        setManifestData(manifestResult.manifest);
      } catch (e) {
        console.error(e);
        setManifestError(true);
      }
    })();
  },
  500
);

const doGetCharacterData = throttle(
  (
    setCharacterData: (value: PowerBarsCharacterData[]) => void,
    setBungieSystemDisabled: (value: boolean) => void,
    setBungieServiceUnavailable: (value: boolean) => void
  ) => {
    const updateCharacterData = (newData: PowerBarsCharacterData[]) => {
      const newOverallPower = Math.max(...newData.map(c => c.overallPower));
      const newArtifactPower = Math.max(
        ...newData.map(c => (c.artifactData ? c.artifactData.bonusPower : 0))
      );
      const newTotalPower = newOverallPower + newArtifactPower;
      ga.set({
        dimension1: `${newOverallPower}`,
        dimension2: `${newArtifactPower}`,
        dimension3: `${newTotalPower}`
      });
      setCharacterData(newData);
    };

    const isFetchingCharacterData = getIsFetchingCharacterData();

    (async () => {
      if (!isFetchingCharacterData) {
        try {
          await getCharacterData(updateCharacterData);
        } catch (error) {
          if (error instanceof BungieSystemDisabledError) {
            setBungieSystemDisabled(true);
          }
          if (error.message === "503") {
            setBungieServiceUnavailable(true);
          }
          console.error("Error fetching character data:", error);
        }
      }
    })();
  },
  500
);

export const AppWrapper = ({
  children,
  top = false
}: {
  children: JSX.Element | Array<JSX.Element | null>;
  top?: boolean;
}) => {
  return (
    <div className={STYLES.App}>
      <div className={classnames(STYLES.AppInner, { [STYLES.top]: top })}>
        {children}
      </div>
    </div>
  );
};

const App = () => {
  const [disableManualLogin, setDisableManualLogin] = useState(
    hasManuallyAuthed()
  );
  const [isAuthed, setIsAuthed] = useState(hasValidAuth());
  const [hasAuthError, setAuthError] = useState(false);

  const [manifestData, setManifestData] = useState<ManifestData | undefined>(
    undefined
  );
  const [hasManifestError, setManifestError] = useState(false);
  const [isBungieSystemDisabled, setBungieSystemDisabled] = useState(false);
  const [isBungieServiceUnavailable, setBungieServiceUnavailable] = useState(
    false
  );
  const [isFetchingCharacterData, setIsFetchingCharacterData] = useState(false);
  const [characterData, setCharacterData] = useState<
    PowerBarsCharacterData[] | undefined
  >(undefined);

  const [manifestState, setManifestState] = useState("Initialising...");
  useEvent(EVENTS.GET_MANIFEST, () => {
    setManifestError(false);
    setManifestState("Checking manifest version");
  });
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
  useEvent(EVENTS.MANIFEST_DATA_READY, () => {
    setManifestError(false);
    setManifestState("Manifest ready");
  });
  useEvent(EVENTS.LOG_OUT, () => {
    setIsAuthed(false);
    setDisableManualLogin(false);
  });

  const hasManifestData = manifestState === "Manifest ready";

  useEffect(() => {
    if (!isAuthed) {
      doAuth(setIsAuthed, setAuthError);
    }
  }, [isAuthed, setIsAuthed, setAuthError]);

  useEffect(
    () =>
      doGetManifest(
        setBungieSystemDisabled,
        setBungieServiceUnavailable,
        setManifestData,
        setManifestError
      ),
    [
      setBungieSystemDisabled,
      setBungieServiceUnavailable,
      setManifestData,
      setManifestError
    ]
  );

  useEvent(EVENTS.MANIFEST_FETCH_ERROR, () => {
    doGetManifest(
      setBungieSystemDisabled,
      setBungieServiceUnavailable,
      setManifestData,
      setManifestError
    );
  });

  const [
    hasLoadedCachedCharacterData,
    setHasLoadedCachedCharacterData
  ] = useState(false);

  const hasSelectedMembership = hasSelectedDestinyMembership();

  useEffect(() => {
    if (isAuthed && hasSelectedMembership && !hasLoadedCachedCharacterData) {
      setHasLoadedCachedCharacterData(true);
      getCachedCharacterData(setCharacterData);
    }
  }, [
    isAuthed,
    hasSelectedMembership,
    hasLoadedCachedCharacterData,
    setHasLoadedCachedCharacterData
  ]);

  useInterval(() => {
    if (isAuthed && hasSelectedMembership && !isFetchingCharacterData) {
      doGetCharacterData(
        setCharacterData,
        setBungieSystemDisabled,
        setBungieServiceUnavailable
      );
    }
  }, CHARACTER_DATA_REFRESH_TIMER);

  useEffect(() => {
    if (
      isAuthed &&
      !characterData &&
      !isFetchingCharacterData &&
      !isBungieSystemDisabled
    ) {
      doGetCharacterData(
        setCharacterData,
        setBungieSystemDisabled,
        setBungieServiceUnavailable
      );
    }
  }, [
    isAuthed,
    characterData,
    isFetchingCharacterData,
    isBungieSystemDisabled
  ]);

  const onSelectMembership = useCallback((membership: UserInfoCard) => {
    ga.event({
      category: "Platform",
      action: "Select platform",
      label: `Membership type: ${membership.membershipType}`
    });
    setSelectedDestinyMembership(membership);
  }, []);

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
        onClick={() => manualStartAuth()}
      >
        Bungie.net authentication required
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

  const getDefaultCharacterDisplayOrder = useCallback(
    () =>
      characterData ? characterData.map(c => c.character.characterId) : [],
    [characterData]
  );

  const isValidCharacterDisplayOrder = useCallback(
    (characterIds: string[]) =>
      characterData &&
      characterData.length === characterIds.length &&
      characterIds.every(id =>
        characterData.some(c => c.character.characterId === id)
      ) &&
      characterData.every(c => characterIds.includes(c.character.characterId)),
    [characterData]
  );

  const [draggingCharacterId, setDraggingCharacterId] = useState<
    string | undefined
  >(undefined);
  const [characterDisplayOrder, setCharacterDisplayOrder] = useState<
    string[] | undefined
  >(loadCharacterDisplayOrder());
  const dropOnCharacterId = useCallback(
    (dropCharacterId: string) => {
      if (!draggingCharacterId || draggingCharacterId === dropCharacterId) {
        return;
      }
      const currentCharacterOrder =
        characterDisplayOrder && characterDisplayOrder.length > 0
          ? characterDisplayOrder
          : getDefaultCharacterDisplayOrder();

      const swappedOrder = currentCharacterOrder.slice();
      swappedOrder.splice(
        currentCharacterOrder.indexOf(draggingCharacterId),
        1,
        dropCharacterId
      );
      swappedOrder.splice(
        currentCharacterOrder.indexOf(dropCharacterId),
        1,
        draggingCharacterId
      );

      saveCharacterDisplayOrder(swappedOrder);
      setCharacterDisplayOrder(swappedOrder);
    },
    [
      draggingCharacterId,
      characterDisplayOrder,
      setCharacterDisplayOrder,
      getDefaultCharacterDisplayOrder
    ]
  );

  let useCharacterOrder = getDefaultCharacterDisplayOrder();
  if (
    characterData &&
    characterData.length > 0 &&
    characterDisplayOrder &&
    characterDisplayOrder.length > 0
  ) {
    // Validate that character IDs in display order match
    if (isValidCharacterDisplayOrder(characterDisplayOrder)) {
      useCharacterOrder = characterDisplayOrder;
    } else {
      setCharacterDisplayOrder(undefined);
    }
  }

  const shouldShowStonks = () => {
    const now = new Date();
    const seasonOfDawnEnd = new Date(2020, 2, 10, 17, 0, 0);
    return now < seasonOfDawnEnd;
  };
  const [showStonks, setShowStonks] = useState(shouldShowStonks());
  useInterval(() => setShowStonks(shouldShowStonks()), 1000 * 60 * 10);

  if (isAuthed && characterData && characterData.length > 0) {
    return (
      <>
        <AppWrapper top>
          <MembershipSelect api={api} onMembershipSelect={onSelectMembership} />
          <div className={STYLES.charactersContainer}>
            <div className={STYLES.characters}>
              {useCharacterOrder
                .map(characterId =>
                  characterData.find(
                    c => c.character.characterId === characterId
                  )
                )
                .map(c => (
                  <CharacterDisplay
                    key={c!.character.characterId}
                    data={c!}
                    onDragStart={() =>
                      setDraggingCharacterId(c!.character.characterId)
                    }
                    onDragEnd={() => setDraggingCharacterId(undefined)}
                    onDragDrop={() =>
                      dropOnCharacterId(c!.character.characterId)
                    }
                  />
                ))}
            </div>
          </div>
          <VendorDisplay manifestData={manifestData} />
          {status ? <LoadingSpinner>{status}</LoadingSpinner> : null}
          {isFetchingCharacterData ? <FetchSpinner /> : null}
        </AppWrapper>
        {showStonks ? <Stonks /> : null}
        <Footer />
      </>
    );
  }

  if (hasAuthError && !disableManualLogin) {
    return (
      <AppWrapper>
        <Header />
        <LoginPrompt />
        <Footer />
      </AppWrapper>
    );
  }

  const loadingChecklistItems: LoadingChecklistItem[] = [];
  const addToChecklist = (
    label: string,
    isComplete: boolean,
    isFailed?: boolean
  ) =>
    loadingChecklistItems.push({
      label,
      status: isComplete ? "complete" : isFailed ? "failed" : "pending"
    });
  addToChecklist("Authenticated", isAuthed, hasAuthError);
  addToChecklist("Loaded Character Data", !!characterData);
  addToChecklist(
    "Loaded Destiny Manifest Defintions",
    hasManifestData,
    hasManifestError
  );

  return (
    <AppWrapper>
      <MembershipSelect api={api} onMembershipSelect={onSelectMembership} />
      <LoadingChecklist withTopMargin items={loadingChecklistItems} />
      <LoadingSpinner>{status}</LoadingSpinner>
      <Footer />
    </AppWrapper>
  );
};

export default App;
