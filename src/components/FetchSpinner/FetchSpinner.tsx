import React, { useContext } from "react";

import { CharacterDataContext } from "../../contexts/CharacterDataContext";
import { VendorDataContext } from "../../contexts/VendorDataContext";

import STYLES from "./FetchSpinner.module.scss";

const FetchSpinner = () => {
  const { isFetchingCharacterData } = useContext(CharacterDataContext);
  const { isFetchingVendorData } = useContext(VendorDataContext);

  if (!isFetchingCharacterData && !isFetchingVendorData) {
    return null;
  }

  return (
    <div className={STYLES.fetchSpinnerContainer}>
      <div className={STYLES.anchor}>
        {isFetchingCharacterData ? (
          <>
            <div className={STYLES.spinner} />
            <div className={STYLES.spinnerSmall} />
          </>
        ) : null}
        {isFetchingVendorData ? <div className={STYLES.spinnerTiny} /> : null}
      </div>
    </div>
  );
};

export default FetchSpinner;
