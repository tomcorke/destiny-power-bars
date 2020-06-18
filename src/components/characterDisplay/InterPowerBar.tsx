import React from "react";

import { ITEM_POWER_PINNACLE_CAP } from "../../constants";
import STYLES from "./InterPowerBar.module.scss";

interface InterPowerBarProps {
  value: number;
}

export const InterPowerBar = ({ value }: InterPowerBarProps) => {
  let min = Math.floor(value);
  let max = value === min ? value + 1 : Math.ceil(value);

  if (min === ITEM_POWER_PINNACLE_CAP && value === min) {
    max = min;
    min = min - 1;
  }

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
