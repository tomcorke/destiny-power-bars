import React from "react";

import STYLES from "./InterPowerBar.module.scss";

interface InterPowerBarProps {
  value: number;
}

export const InterPowerBar = ({ value }: InterPowerBarProps) => {
  const min = Math.floor(value);
  const max = value === min ? value + 1 : Math.ceil(value);

  const fillPerc = Math.floor(value * 100 - min * 100);

  return (
    <div className={STYLES.interPowerBar}>
      <div className={STYLES.min}>{min}</div>
      <div className={STYLES.bar}>
        <div className={STYLES.fillBar} style={{ width: `${fillPerc}%` }} />
        <div className={STYLES.barOverlay} />
      </div>
      <div className={STYLES.max}>{max}</div>
    </div>
  );
};
