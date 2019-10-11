import classnames from "classnames";
import React from "react";

import STYLES from "./PowerBar.module.scss";

interface BarProps {
  min: number;
  max: number;
  value: number;
  avgValue: number;
  label: string;
  icon?: string;
}

export const PowerBar = ({
  min,
  max,
  value,
  avgValue,
  label,
  icon
}: BarProps) => {
  const range = max - min;
  const perc = Math.floor(((value - min) / range) * 1000) / 10;
  const avgPerc = Math.floor(((avgValue - min) / range) * 1000) / 10;
  // const plusTwoPerc = Math.floor(((avgValue + 2 - min) / range) * 1000) / 10
  // const plusFivePerc = Math.floor(((avgValue + 5 - min) / range) * 1000) / 10
  const fullLabelText = `${value} ${label}`;
  const fullLabel = (
    <span className={STYLES.label}>
      <span
        className={classnames(STYLES.power, {
          [STYLES.max]: value >= max,
          [STYLES.belowAverage]: value < avgValue
        })}
      >
        {value}
      </span>
      <span className={STYLES.slotName}>{label}</span>
    </span>
  );
  return (
    <div className={STYLES.barWrapper}>
      <div className={STYLES.iconWrapper}>
        {icon && (
          <img
            className={STYLES.icon}
            src={`https://www.bungie.net${icon}`}
            alt={fullLabelText}
          />
        )}
      </div>
      <div className={STYLES.barContainer}>
        <div className={STYLES.filledBar} style={{ width: `${perc}%` }}>
          {fullLabel}
        </div>
        <div className={STYLES.barLine} style={{ left: `${avgPerc}%` }} />
      </div>
    </div>
  );
};
