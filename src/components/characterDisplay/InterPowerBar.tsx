import React from "react";

import { ITEM_POWER_PINNACLE_CAP } from "../../constants";
import STYLES from "./InterPowerBar.module.scss";

interface InterPowerBarProps {
  value: number;
  extraValue?: number;
}

export const InterPowerBar = ({ value, extraValue }: InterPowerBarProps) => {
  const valueToUse = extraValue && extraValue > value ? extraValue : value;

  let min = Math.floor(valueToUse);
  let max = valueToUse === min ? valueToUse + 1 : Math.ceil(valueToUse);

  if (min === ITEM_POWER_PINNACLE_CAP && valueToUse === min) {
    max = min;
    min = min - 1;
  }

  const fillPerc = Math.max(0, Math.floor(value * 100 - min * 100));
  const extraFillPerc = extraValue
    ? Math.floor(extraValue * 100 - min * 100)
    : undefined;

  return (
    <div className={STYLES.interPowerBar}>
      <div className={STYLES.min}>{min}</div>
      <div className={STYLES.bar}>
        {extraValue ? (
          <div
            className={STYLES.extraFillBar}
            style={{ width: `${extraFillPerc}%` }}
          />
        ) : null}
        <div className={STYLES.fillBar} style={{ width: `${fillPerc}%` }} />
        <div className={STYLES.barOverlay} />
      </div>
      <div className={STYLES.max}>{max}</div>
    </div>
  );
};
