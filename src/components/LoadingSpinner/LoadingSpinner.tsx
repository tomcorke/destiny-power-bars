import React from "react";

import STYLES from "./LoadingSpinner.module.scss";

interface LoadingSpinnerProps {
  children: string | JSX.Element;
}

const LoadingSpinner = ({ children }: LoadingSpinnerProps) => {
  return (
    <div className={STYLES.loading}>
      <div className={STYLES.anchor}>
        <div className={STYLES.spinnerLarge} />
        <div className={STYLES.spinnerLargeDouble} />
        <div className={STYLES.spinnerSmall} />
        <div className={STYLES.spinnerSmallDouble} />
      </div>
      <div className={STYLES.status}>{children}</div>
    </div>
  );
};

export default LoadingSpinner;
