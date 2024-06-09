import React, { useContext } from "react";

import { ITEM_POWER_POWERFUL_CAP, ORDERED_ITEM_SLOTS } from "../../constants";
import { CharacterDataContext } from "../../contexts/CharacterDataContext";
import { PowerBySlot } from "../../types";

import { PowerBar } from "./PowerBar";
import STYLES from "./PowerBars.module.scss";

const classItemNames: { [key: string]: string } = {
  hunter: "Hunter Cloak",
  titan: "Titan Mark",
  warlock: "Warlock Bond",
};
const slotFullNames = (className: string): { [key: string]: string } => ({
  chest: "Chest Armor",
  classItem: classItemNames[className],
  energy: "Energy Weapon",
  gloves: "Gauntlets",
  head: "Helmet",
  kinetic: "Kinetic Weapon",
  legs: "Leg Armor",
  power: "Power Weapon",
});

type PowerBarsProps = {
  characterId: string;
  useUnrestrictedPower?: boolean;
};

export const PowerBars = ({
  characterId,
  useUnrestrictedPower,
}: PowerBarsProps) => {
  const { characterData } = useContext(CharacterDataContext);

  const thisCharacterData = characterData?.characters[characterId];

  if (!thisCharacterData) {
    return null;
  }

  const overallPower = thisCharacterData.topItems.overallPower;

  const itemsBySlot =
    useUnrestrictedPower &&
    thisCharacterData.unrestricted.averagePower >
      thisCharacterData.topItems.averagePower
      ? thisCharacterData.unrestricted.topItemsBySlot
      : thisCharacterData.topItems.topItemsBySlot;

  // Get power by slot, using overall power if slot data does not exist
  const powerBySlot = ORDERED_ITEM_SLOTS.reduce((slots, slotName) => {
    const item = itemsBySlot?.[slotName];
    let power = item?.power;
    if (!power) {
      power = overallPower;
    }

    return {
      ...slots,
      [slotName]: power,
    };
  }, {} as PowerBySlot);

  // Round to 50s
  const minItemPower = Math.min(...Object.values(powerBySlot));
  let minPowerToDisplay = Math.max(Math.floor(minItemPower / 50) * 50 - 50, 0);
  // If within 20 of pinnacle cap, use higher minimum value
  if (minItemPower > ITEM_POWER_POWERFUL_CAP) {
    minPowerToDisplay = ITEM_POWER_POWERFUL_CAP - 10;
  }

  const maxItemPower = Math.max(...Object.values(powerBySlot));
  const maxItemPowerGrouping =
    ITEM_POWER_POWERFUL_CAP - maxItemPower < 50 ? 10 : 50;
  const maxPowerToDisplay =
    Math.ceil(maxItemPower / maxItemPowerGrouping) * maxItemPowerGrouping;

  const range = maxPowerToDisplay - minPowerToDisplay;
  const perc =
    Math.floor(((overallPower - minPowerToDisplay) / range) * 1000) / 10;

  return (
    <div className={STYLES.powerBars}>
      <div className={STYLES.powerRange}>
        <div className={STYLES.minPower}>{minPowerToDisplay}</div>
        <div className={STYLES.rangeLine} />
        <div className={STYLES.maxPower}>{maxPowerToDisplay}</div>
      </div>
      <div className={STYLES.bars}>
        {Object.entries(powerBySlot).map(([slotName, power]) => {
          const bestItem = itemsBySlot?.[slotName];
          if (!bestItem) {
            return null;
          }

          const accountPowerForSlot =
            characterData.global.accountPowerBySlot[slotName];

          return (
            <PowerBar
              key={`${characterId}_${slotName}`}
              min={minPowerToDisplay}
              max={maxPowerToDisplay}
              value={power}
              avgValue={overallPower}
              label={
                slotFullNames(thisCharacterData.className)[slotName] || slotName
              }
              icon={bestItem.icon}
              iconWatermark={bestItem.watermark}
              isMasterworked={bestItem.isMasterwork}
              isCrafted={bestItem.isCrafted}
              hasDeepsightResonance={bestItem.hasDeepsightResonance}
              itemName={bestItem.name}
              itemType={bestItem.itemType}
              location={bestItem.location}
              isEquipped={bestItem.isEquipped}
              accountMaxValue={accountPowerForSlot}
            />
          );
        })}
      </div>
      {overallPower < maxPowerToDisplay ? (
        <div className={STYLES.powerLabel}>
          <div className={STYLES.indicator} style={{ left: `${perc}%` }}>
            {overallPower}
          </div>
        </div>
      ) : null}
    </div>
  );
};
