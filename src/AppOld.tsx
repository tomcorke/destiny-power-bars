// @ts-nocheck

import useInterval from "@use-it/interval";
import { UserInfoCard } from "bungie-api-ts/user";
import classnames from "classnames";
import throttle from "lodash/throttle";
import React, { useCallback, useContext, useEffect, useState } from "react";

import {
  manualStartAuth,
  setSelectedDestinyMembership,
} from "./services/bungie-auth";
import { PowerBarsCharacterData } from "./types";

import CharacterDisplay from "./components/CharacterDisplay";
import FetchSpinner from "./components/FetchSpinner";
import Footer from "./components/Footer";
import LoggedOutHeader from "./components/LoggedOutHeader";
import {
  LoadingChecklist,
  LoadingChecklistItem,
} from "./components/LoadingChecklist";
import LoadingSpinner from "./components/LoadingSpinner";
import LoginPrompt from "./components/LoginPrompt";
import MembershipSelect from "./components/MembershipSelect";
import { BungieSystemDisabledError, getManifest } from "./services/bungie-api";
import { EVENTS, useEvent } from "./services/events";
import {
  getCachedCharacterData,
  getCharacterData,
  getIsFetchingCharacterData,
  loadCharacterDisplayOrder,
  saveCharacterDisplayOrder,
  bustProfileCache,
} from "./services/utils";
import RedactedWarning from "./components/RedactedWarning";

import "normalize.css";
import "./index.css";

import STYLES from "./App.module.scss";
import MembershipHeader from "./components/MembershipHeader";
import ToastOverlay from "./components/ToastOverlay";

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

const App = () => {
  const onSelectMembership = useCallback((membership: UserInfoCard) => {
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
        Error loading manifest, if this persists try{" "}
        <a href="/">refreshing the page</a>!
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

  window.characterData = characterData;

  const getDefaultCharacterDisplayOrder = useCallback(
    () =>
      characterData ? characterData.map((c) => c.character.characterId) : [],
    [characterData]
  );

  const isValidCharacterDisplayOrder = useCallback(
    (characterIds: string[]) =>
      characterData &&
      characterData.length === characterIds.length &&
      characterIds.every((id) =>
        characterData.some((c) => c.character.characterId === id)
      ) &&
      characterData.every((c) =>
        characterIds.includes(c.character.characterId)
      ),
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
      getDefaultCharacterDisplayOrder,
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

  if (isAuthed && characterData && characterData.length > 0) {
    const showRedactedWarning = characterData.some(
      (c) => c.hasRedactedEquippableItems
    );

    return (
      <>
        <AppWrapper top>
          <MembershipHeader
            api={api}
            onMembershipSelect={onSelectMembership}
            isFetchingCharacterData={isFetchingCharacterData}
            onRefreshClick={onRefreshClick}
          />
          <div className={STYLES.charactersContainer}>
            <div className={STYLES.characters}>
              {useCharacterOrder
                .map((characterId) =>
                  characterData.find(
                    (c) => c.character.characterId === characterId
                  )
                )
                .map((c, i) => (
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
          {showRedactedWarning ? <RedactedWarning /> : null}
          {/* <VendorDisplay manifestData={manifestData} /> */}
          {status ? <LoadingSpinner>{status}</LoadingSpinner> : null}
          {isFetchingCharacterData ? <FetchSpinner /> : null}
        </AppWrapper>
        {/* <S10Overlay /> */}
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

  const loadingChecklistItems: LoadingChecklistItem[] = [];
  const addToChecklist = (
    label: string,
    isComplete: boolean,
    isFailed?: boolean
  ) =>
    loadingChecklistItems.push({
      label,
      status: isComplete ? "complete" : isFailed ? "failed" : "pending",
    });
  addToChecklist("Authenticated", isAuthed, hasAuthError);
  addToChecklist("Loaded Character Data", !!characterData);
  addToChecklist(
    "Loaded Destiny Manifest Definitions",
    hasManifestData,
    hasManifestError
  );

  return (
    <>
      <AppWrapper>
        <MembershipSelect api={api} onMembershipSelect={onSelectMembership} />
        <LoadingChecklist withTopMargin items={loadingChecklistItems} />
        <LoadingSpinner>{status}</LoadingSpinner>
      </AppWrapper>
      <Footer />
    </>
  );
};

export default App;
