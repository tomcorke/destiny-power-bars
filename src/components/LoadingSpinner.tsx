import React from "react";

import STYLES from "./LoadingSpinner.module.scss";

interface LoadingSpinnerProps {
  children: string | JSX.Element;
}

const LoadingSpinner = ({ children }: LoadingSpinnerProps) => {
  return (
    <div className={STYLES.loadingSpinnerContainer}>
      <div className={STYLES.anchor}>
        <div className={STYLES.spinnerLarge} />
        <div className={STYLES.spinnerSmall} />
        <div className={STYLES.status}>{children}</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
