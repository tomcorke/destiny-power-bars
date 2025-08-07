import classNames from "classnames";
import React from "react";

import STYLES from "./Power.module.scss";

const numberWithSign = (value: number) => {
  if (value >= 0) {
    return `+${value}`;
  }
  return `${value}`;
};

interface PowerProps {
  children: number;
  withSign?: boolean;
  withSymbol?: boolean;
}
export const Power = ({
  children: value,
  withSign = false,
  withSymbol = false,
}: PowerProps) => (
  <span
    className={classNames(STYLES.inlinePowerNumber, {
      [STYLES.symbol!]: withSymbol,
    })}
  >
    <span>{withSign ? numberWithSign(value) : value}</span>
  </span>
);
