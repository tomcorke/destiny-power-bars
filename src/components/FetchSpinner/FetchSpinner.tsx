import React, { useContext } from "react";
import { CharacterDataContext } from "../../contexts/CharacterDataContext";

import STYLES from "./FetchSpinner.module.scss";

const FetchSpinner = () => {
  const { isFetchingCharacterData } = useContext(CharacterDataContext);

  if (!isFetchingCharacterData) {
    return null;
  }

  return (
    <div className={STYLES.fetchSpinnerContainer}>
      <div className={STYLES.anchor}>
        <div className={STYLES.spinner} />
        <div className={STYLES.spinnerSmall} />
      </div>
    </div>
  );
};

export default FetchSpinner;
