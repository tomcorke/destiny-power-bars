import React from "react";

import STYLES from "./Power.module.scss";

interface PowerProps {
  children: number | string;
}
export const Power = ({ children }: PowerProps) => (
  <span className={STYLES.inlinePowerNumber}>{children}</span>
);
