import React, { useContext } from "react";

import { CharacterDataContext } from "../../contexts/CharacterDataContext";

import STYLES from "./FetchSpinner.module.scss";
import { VendorDataContext } from "../../contexts/VendorDataContext";

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
