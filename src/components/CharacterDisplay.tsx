import classnames from "classnames";
import React from "react";

import { CharacterData } from "../types";

import { ORDERED_ITEM_SLOTS } from "../constants";
import STYLES from "./CharacterDisplay.module.scss";

interface CharacterDisplayProps {
  data: CharacterData;
}

const titleCase = (text: string) =>
  text.substr(0, 1).toUpperCase() + text.substr(1);

interface BarProps {
  min: number;
  max: number;
  value: number;
  avgValue: number;
  label: string;
  icon?: string;
}
const Bar = ({ min, max, value, avgValue, label, icon }: BarProps) => {
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

interface InlinePowerNumberProps {
  children: number | string;
}
const Power = ({ children }: InlinePowerNumberProps) => (
  <span className={STYLES.inlinePowerNumber}>{children}</span>
);

const CharacterDisplay = ({ data }: CharacterDisplayProps) => {
  const classItemNames: { [key: string]: string } = {
    hunter: "Hunter Cloak",
    titan: "Titan Mark",
    warlock: "Warlock Bond"
  };
  const slotFullNames: { [key: string]: string } = {
    chest: "Chest Armor",
    classItem: classItemNames[data.className],
    energy: "Energy Weapon",
    gloves: "Gauntlets",
    head: "Helmet",
    kinetic: "Kinetic Weapon",
    legs: "Leg Armor",
    power: "Power Weapon"
  };

  const rgbString = ({
    red,
    green,
    blue
  }: {
    red: number;
    green: number;
    blue: number;
  }) => `rgb(${red},${green},${blue})`;

  interface PowerBySlot {
    [slotName: string]: number;
  }

  // Get power by slot, using overall power if slot data does not exist
  const powerBySlot = ORDERED_ITEM_SLOTS.reduce(
    (slots, slotName) => ({
      ...slots,
      [slotName]: data.topItemBySlot
        ? data.topItemBySlot[slotName].instanceData.primaryStat.value
        : data.overallPower
    }),
    {} as PowerBySlot
  );

  // Round to 50s
  const minItemPower = Math.min(...Object.values(powerBySlot));
  const minPowerToDisplay = Math.max(
    Math.floor(minItemPower / 50) * 50 - 50,
    0
  );
  const maxItemPower = Math.max(...Object.values(powerBySlot));
  const maxPowerToDisplay =
    data.maxItemPower || Math.ceil(maxItemPower / 50) * 50;

  const roundedPower = Math.floor(data.overallPower);

  const range = maxPowerToDisplay - minPowerToDisplay;
  const perc =
    Math.floor(((roundedPower - minPowerToDisplay) / range) * 1000) / 10;

  const withSign = (value: number) => {
    if (value >= 0) {
      return `+${value}`;
    }
    return `${value}`;
  };

  const summableArtifactBonusPower = data.artifactData
    ? data.artifactData.bonusPower
    : 0;

  return (
    <div
      className={classnames(
        STYLES.characterDisplay,
        STYLES[`class_${data.className}`]
      )}
      style={{ backgroundColor: rgbString(data.character.emblemColor) }}
    >
      <div className={STYLES.header}>
        <img
          className={STYLES.emblemBackground}
          src={`https://www.bungie.net${data.character.emblemBackgroundPath}`}
          alt=""
        />
        <div className={STYLES.name}>{titleCase(data.className)}</div>
        <div className={STYLES.power}>
          {roundedPower + summableArtifactBonusPower}
        </div>
      </div>
      <div className={STYLES.details}>
        <div className={STYLES.detailsRow}>
          <div className={STYLES.detailsLabel}>Max equippable gear power:</div>
          <div className={STYLES.defailsValue}>
            <Power>{roundedPower}</Power>
          </div>
        </div>
        {data.artifactData ? (
          <>
            <div className={STYLES.detailsRow}>
              <div className={STYLES.detailsLabel}>
                <img
                  className={STYLES.detailsInlineIcon}
                  src={`https://www.bungie.net${data.artifactData.iconPath}`}
                  alt=""
                />
                {data.artifactData.name} bonus power:
              </div>
              <div className={STYLES.detailsValue}>
                <Power>{withSign(data.artifactData.bonusPower)}</Power>
              </div>
            </div>

            <div className={STYLES.detailsRow}>
              <div className={STYLES.detailsLabel}>Total combined power:</div>
              <div className={STYLES.detailsValue}>
                <Power>{roundedPower + summableArtifactBonusPower}</Power>
              </div>
            </div>
          </>
        ) : null}
      </div>
      <div className={STYLES.powerBars}>
        <div className={STYLES.powerRange}>
          <div className={STYLES.minPower}>{minPowerToDisplay}</div>
          <div className={STYLES.rangeLine} />
          <div className={STYLES.maxPower}>{maxPowerToDisplay}</div>
        </div>
        <div className={STYLES.bars}>
          {Object.entries(powerBySlot).map(([slotName, power]) => {
            const bestItem = data.topItemBySlot && data.topItemBySlot[slotName];
            return (
              <Bar
                key={`${data.id}_${slotName}`}
                min={minPowerToDisplay}
                max={maxPowerToDisplay}
                value={power}
                avgValue={roundedPower}
                label={slotFullNames[slotName] || slotName}
                icon={
                  bestItem &&
                  bestItem.itemDefinition &&
                  bestItem.itemDefinition.displayProperties.icon
                }
              />
            );
          })}
        </div>
        <div className={STYLES.powerLabel}>
          <div className={STYLES.indicator} style={{ left: `${perc}%` }}>
            {roundedPower}
          </div>
        </div>
      </div>

      <div className={STYLES.hints}>
        {data.potentialOverallPower &&
        data.potentialOverallPower > data.overallPower ? (
          <div className={classnames(STYLES.hint, STYLES.worldDropHint)}>
            <span>
              World drops can increase your overall gear power to{" "}
              <Power>{data.potentialOverallPower}</Power>
            </span>
            <div className={STYLES.hintExtra}>
              <div className={STYLES.hintExtraInner}>
                <p>
                  World drops (from strikes, public events, non-powerful
                  legendary rewards) can drop with a power level from{" "}
                  <Power>{data.overallPower - 3}</Power> to{" "}
                  <Power>{data.overallPower}</Power> for this character.
                </p>
                <p>
                  Replacing items below your current overall power can increase
                  your power to a higher average.
                </p>
                {data.powerRequiredToReachPotential ? (
                  <p>
                    You need an extra{" "}
                    <Power>{data.powerRequiredToReachPotential}</Power> total
                    power on your items to reach an overall power of{" "}
                    <Power>{data.potentialOverallPower}</Power>.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {data.potentialOverallPower === data.overallPower &&
        data.overallPower >= 900 &&
        data.overallPower < 950 ? (
          <div className={classnames(STYLES.hint, STYLES.powerfulHint)}>
            <span>
              Powerful rewards can increase your overall gear power up to the
              powerful cap of <Power>{950}</Power>
            </span>
            <div className={STYLES.hintExtra}>
              <div className={STYLES.hintExtraInner}>
                <p>
                  Powerful and pinnacle reward sources (Weekly challenges, Year
                  3 raids) will give you items above your overall gear power,
                  with powerful rewards capped at <Power>{950}</Power>.
                </p>
                <p>
                  Powerful rewards (Tier 1) will give items up to 3 levels above
                  your overall gear power
                </p>
                <p>
                  Powerful rewards (Tier 2) will give items up to 5 levels above
                  your overall gear power
                </p>
                <p>
                  Pinnacle rewards will give items up to 8 levels above your
                  overall gear power
                </p>
                <p>
                  After getting a powerful reward, check back here to see if
                  it's beneficial to catch up the rest of your slots with world
                  drops before getting another!
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {data.potentialOverallPower === data.overallPower &&
        data.overallPower >= 950 &&
        data.overallPower < 960 ? (
          <div className={classnames(STYLES.hint, STYLES.pinnacleHint)}>
            <span>
              Pinnacle rewards can increase your overall gear power up to the
              pinnacle cap of 960
            </span>
            <div className={STYLES.hintExtra}>
              <p>
                Pinnacle reward sources (Weekly challenges, Year 3 raids) will
                give you items above your overall gear power, capped at 960.
              </p>
              <p>
                Pinnacle rewards will give items up to 8 levels above your
                overall gear power
              </p>
              <p>
                After getting a pinnacle reward, check back here to see if it's
                beneficial to catch up the rest of your slots with world drops
                before getting another!
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CharacterDisplay;
