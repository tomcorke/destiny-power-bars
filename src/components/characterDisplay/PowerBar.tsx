import { ItemLocation } from "bungie-api-ts/destiny2";
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
  isMasterworked?: boolean;
  itemName?: string;
  location?: ItemLocation;
  isEquipped?: boolean;
}

const getLocationLabel = (location?: ItemLocation, isEquipped?: boolean) => {
  switch (location) {
    case 0: // ItemLocation.Unknown:
      return undefined;
    case 1: // ItemLocation.Inventory:
      if (isEquipped) {
        return "Equipped";
      }
      return "Inventory";
    case 2: // ItemLocation.Vault:
      return "Vault";
    case 3: //ItemLocation.Vendor:
      return "Vendor";
    case 4: //ItemLocation.Postmaster:
      return "Postmaster";
    default:
      return undefined;
  }
};

export const PowerBar = ({
  min,
  max,
  value,
  avgValue,
  label,
  icon,
  isMasterworked,
  itemName,
  location,
  isEquipped,
}: BarProps) => {
  const range = max - min;
  const perc = Math.floor(((value - min) / range) * 1000) / 10;
  const avgPerc = Math.floor(((avgValue - min) / range) * 1000) / 10;
  // const plusTwoPerc = Math.floor(((avgValue + 2 - min) / range) * 1000) / 10
  // const plusFivePerc = Math.floor(((avgValue + 5 - min) / range) * 1000) / 10
  const fullLabelText = `${value} ${label}`;

  const locationLabel = getLocationLabel(location, isEquipped);
  const specificItemLabel = `${itemName}${
    locationLabel ? ` (${locationLabel})` : ""
  }`;
  const fullLabel = (
    <span className={STYLES.label}>
      <span
        className={classnames(STYLES.power, {
          [STYLES.max]: value >= max,
          [STYLES.belowAverage]: value < avgValue,
        })}
      >
        {value}
      </span>
      <span className={STYLES.slotName}>
        <span className={STYLES.generalLabel}>{label}</span>
        <span className={STYLES.specificLabel}>{specificItemLabel}</span>
      </span>
    </span>
  );
  return (
    <div className={STYLES.barWrapper}>
      <div className={STYLES.iconWrapper} title={specificItemLabel}>
        {icon ? (
          <img
            className={STYLES.icon}
            src={`https://www.bungie.net${icon}`}
            alt={fullLabelText}
          />
        ) : null}
        {icon && location === 2 /*ItemLocation.Vault*/ ? (
          <div className={STYLES.vaultOverlay} />
        ) : null}
        {icon && location === 4 /*ItemLocation.Postmaster*/ ? (
          <div className={STYLES.postmasterOverlay} />
        ) : null}
        {icon && isMasterworked ? (
          <div className={STYLES.masterworkOverlay} />
        ) : null}
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
