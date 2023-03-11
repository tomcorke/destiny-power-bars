import classNames from "classnames";
import React, { useContext } from "react";

import { CharacterDataContext } from "../../contexts/CharacterDataContext";

import STYLES from "./ForceRefresh.module.scss";

export const ForceRefresh = () => {
  const { isFetchingCharacterData, forceRefresh } =
    useContext(CharacterDataContext);

  return (
    <button
      className={classNames(STYLES.hardRefreshButton, {
        [STYLES.disabled]: isFetchingCharacterData,
      })}
      onClick={forceRefresh}
    >
      <div className={STYLES.hardRefreshIcon} />
      <div className={STYLES.hardRefreshText}>Force Refresh</div>
    </button>
  );
};
