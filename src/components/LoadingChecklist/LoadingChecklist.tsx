import classnames from "classnames";
import React, { useContext } from "react";

import { AuthenticationContext } from "../../contexts/AuthenticationContext";
import { CharacterDataContext } from "../../contexts/CharacterDataContext";
import {
  ManifestContext,
  MANIFEST_STATE,
} from "../../contexts/ManifestContext";

import STYLES from "./LoadingChecklist.module.scss";

export type LoadingChecklistItemStatus = "complete" | "pending" | "failed";

type LoadingChecklistItem = {
  label: string;
  status: LoadingChecklistItemStatus;
};

const LoadingChecklist = () => {
  const { isAuthed, hasAuthError } = useContext(AuthenticationContext);
  const { characterData } = useContext(CharacterDataContext);
  const { manifestState, hasManifestError } = useContext(ManifestContext);

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
  addToChecklist(
    "Loaded Character Data",
    characterData && characterData.length > 0
  );
  addToChecklist(
    "Loaded Destiny Manifest Definitions",
    manifestState === MANIFEST_STATE.READY,
    hasManifestError
  );

  return (
    <div className={STYLES.LoadingChecklist}>
      <ul>
        {loadingChecklistItems.map((item) => (
          <li key={item.label}>
            <div className={STYLES.item}>
              <div className={classnames(STYLES.status, STYLES[item.status])} />
              {item.label}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoadingChecklist;
