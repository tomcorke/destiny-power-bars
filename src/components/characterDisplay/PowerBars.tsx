import React from "react";

import { ITEM_POWER_POWERFUL_CAP, ORDERED_ITEM_SLOTS } from "../../constants";
import { isMasterwork } from "../../services/masterwork";
import { PowerBarsCharacterData, PowerBySlot } from "../../types";
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

type PowerBarsProps = PowerBarsCharacterData;

export const PowerBars = (data: PowerBarsProps) => {
  // Get power by slot, using overall power if slot data does not exist
  const powerBySlot = ORDERED_ITEM_SLOTS.reduce(
    (slots, slotName) => ({
      ...slots,
      [slotName]:
        data.topItemBySlot?.[slotName]?.instanceData?.primaryStat?.value ||
        data.overallPower,
    }),
    {} as PowerBySlot
  );

  const roundedPower = Math.floor(data.overallPower);
  // Round to 50s
  const minItemPower = Math.min(...Object.values(powerBySlot));
  const minPowerToDisplay = Math.max(
    Math.floor(minItemPower / 50) * 50 - 50,
    0
  );
  const maxItemPower = Math.max(...Object.values(powerBySlot));
  const maxItemPowerGrouping =
    ITEM_POWER_POWERFUL_CAP - maxItemPower < 50 ? 10 : 50;
  const maxPowerToDisplay =
    Math.ceil(maxItemPower / maxItemPowerGrouping) * maxItemPowerGrouping;

  const range = maxPowerToDisplay - minPowerToDisplay;
  const perc =
    Math.floor(((roundedPower - minPowerToDisplay) / range) * 1000) / 10;

  return (
    <div className={STYLES.powerBars}>
      <div className={STYLES.powerRange}>
        <div className={STYLES.minPower}>{minPowerToDisplay}</div>
        <div className={STYLES.rangeLine} />
        <div className={STYLES.maxPower}>{maxPowerToDisplay}</div>
      </div>
      <div className={STYLES.bars}>
        {Object.entries(powerBySlot).map(([slotName, power]) => {
          const bestItem = data.topItemBySlot?.[slotName];
          return (
            <PowerBar
              key={`${data.character.characterId}_${slotName}`}
              min={minPowerToDisplay}
              max={maxPowerToDisplay}
              value={power}
              avgValue={roundedPower}
              label={slotFullNames(data.className)[slotName] || slotName}
              icon={bestItem?.itemDefinition?.displayProperties.icon}
              isMasterworked={bestItem && isMasterwork(bestItem)}
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
  );
};
