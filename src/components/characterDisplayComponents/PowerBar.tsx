import { ItemLocation } from "bungie-api-ts/destiny2";
import classnames from "classnames";
import React, { useContext } from "react";

import { SettingsContext } from "../../contexts/SettingsContext";

import STYLES from "./PowerBar.module.scss";

interface BarProps {
  min: number;
  max: number;
  value: number;
  avgValue: number;
  label: string;
  icon?: string;
  iconWatermark?: string;
  isMasterworked?: boolean;
  isCrafted?: boolean;
  isEnhanced?: boolean;
  hasDeepsightResonance?: boolean;
  itemName?: string;
  itemType?: string;
  location?: ItemLocation;
  isEquipped?: boolean;
  accountMaxValue?: number;
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

const ItemIcon = ({
  icon,
  iconWatermark,
  isMasterworked,
  isCrafted,
  isEnhanced,
  hasDeepsightResonance,
  location,
  title,
  alt,
}: Pick<
  BarProps,
  | "icon"
  | "iconWatermark"
  | "isMasterworked"
  | "isCrafted"
  | "isEnhanced"
  | "hasDeepsightResonance"
  | "location"
> & { title: string; alt: string }) => (
  <div className={STYLES.iconWrapper} title={title}>
    {icon ? (
      <img
        className={STYLES.icon}
        src={`https://www.bungie.net${icon}`}
        alt={alt}
      />
    ) : null}
    {iconWatermark ? (
      <div
        className={STYLES.watermark}
        style={{
          backgroundImage: `url('https://www.bungie.net${iconWatermark}')`,
        }}
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
    {icon && isCrafted ? <div className={STYLES.craftedOverlay} /> : null}
    {icon && isEnhanced ? <div className={STYLES.enhancedOverlay} /> : null}
    {icon && hasDeepsightResonance ? (
      <div className={STYLES.deepsightOverlay} />
    ) : null}
  </div>
);

export const PowerBar = ({
  min,
  max,
  value,
  avgValue,
  label,
  icon,
  iconWatermark,
  isMasterworked,
  isCrafted,
  isEnhanced,
  hasDeepsightResonance,
  itemName,
  itemType,
  location,
  isEquipped,
  accountMaxValue,
}: BarProps) => {
  const { settings } = useContext(SettingsContext);

  const range = max - min;
  const perc = Math.floor(((value - min) / range) * 1000) / 10;
  const avgPerc = Math.floor(((avgValue - min) / range) * 1000) / 10;
  // const plusTwoPerc = Math.floor(((avgValue + 2 - min) / range) * 1000) / 10
  // const plusFivePerc = Math.floor(((avgValue + 5 - min) / range) * 1000) / 10

  const accountPerc =
    Math.floor((((accountMaxValue || 0) - min) / range) * 1000) / 10;

  const fullLabelText = `${value} ${label}`;

  const locationLabel = getLocationLabel(location, isEquipped);
  const specificItemLabel = `${itemName}${
    locationLabel ? ` (${locationLabel})` : ""
  }`;
  const fullLabel = (
    <span className={STYLES.label}>
      <span
        className={classnames(STYLES.power, {
          [STYLES.max!]: value >= max,
          [STYLES.belowAverage!]: value < avgValue,
        })}
      >
        {value}
      </span>
      <span className={STYLES.slotName}>
        <span className={STYLES.generalLabel}>{itemType}</span>
        <span className={STYLES.specificLabel}>{specificItemLabel}</span>
      </span>
    </span>
  );
  return (
    <div className={STYLES.barWrapper}>
      <ItemIcon
        icon={icon}
        iconWatermark={iconWatermark}
        isMasterworked={isMasterworked}
        isCrafted={isCrafted}
        isEnhanced={isEnhanced}
        hasDeepsightResonance={hasDeepsightResonance}
        location={location}
        title={specificItemLabel}
        alt={fullLabelText}
      />
      <div className={STYLES.barContainer}>
        {accountMaxValue && settings.displayAccountWidePower ? (
          <div
            className={STYLES.accountMaxBar}
            style={{ width: `${accountPerc}%` }}
          />
        ) : null}
        <div className={STYLES.filledBar} style={{ width: `${perc}%` }}>
          {fullLabel}
        </div>
        <div className={STYLES.barLine} style={{ left: `${avgPerc}%` }} />
      </div>
    </div>
  );
};
