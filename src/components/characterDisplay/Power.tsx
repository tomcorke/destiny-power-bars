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
}
export const Power = ({ children: value, withSign = false }: PowerProps) => (
  <span className={STYLES.inlinePowerNumber}>
    {withSign ? numberWithSign(value) : value}
  </span>
);
