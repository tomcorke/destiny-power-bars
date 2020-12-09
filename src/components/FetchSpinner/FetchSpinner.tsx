import React from "react";

import STYLES from "./FetchSpinner.module.scss";

const FetchSpinner = () => (
  <div className={STYLES.fetchSpinnerContainer}>
    <div className={STYLES.anchor}>
      <div className={STYLES.spinner} />
      <div className={STYLES.spinnerSmall} />
    </div>
  </div>
);

export default FetchSpinner;
