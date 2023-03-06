import React from "react";

import { ITEM_POWER_POWERFUL_CAP, ORDERED_ITEM_SLOTS } from "../../constants";
import {
  hasIncompleteDeepsightResonance,
  isCrafted,
} from "../../services/crafting";
import { isMasterwork } from "../../services/masterwork";
import {
  PowerBarsCharacterData,
  PowerBySlot,
  SelectedJoinedItemDefinition,
} from "../../types";
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

type PowerBarsProps = PowerBarsCharacterData & {
  useUnrestrictedPower?: boolean;
};

const getItemIconPath = (item: SelectedJoinedItemDefinition) => {
  return (
    item.overrideStyleItemIconPath ||
    item.itemDefinition?.displayProperties?.icon
  );
};

const getItemIconWatermarkPath = (item: SelectedJoinedItemDefinition) => {
  return item.watermarkIconPath;
};

export const PowerBars = (data: PowerBarsProps) => {
  const itemsBySlot =
    data.useUnrestrictedPower &&
    data.unrestrictedOverallPowerExact &&
    data.unrestrictedOverallPowerExact > data.overallPowerExact
      ? data.topUnrestrictedItemBySlot
      : data.topItemBySlot;

  // Get power by slot, using overall power if slot data does not exist
  const powerBySlot = ORDERED_ITEM_SLOTS.reduce((slots, slotName) => {
    const item = itemsBySlot?.[slotName];
    let power = item?.instanceData?.primaryStat?.value;
    if (!power && item?.instanceData?.itemLevel) {
      power = item.instanceData.itemLevel * 10;
      power += item.instanceData.quality || 0;
    }
    if (!power) {
      power = data.overallPower;
    }

    return {
      ...slots,
      [slotName]: power,
    };
  }, {} as PowerBySlot);

  const roundedPower = Math.floor(data.overallPower);
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
          const bestItem = itemsBySlot?.[slotName];
          if (!bestItem) {
            return null;
          }
          return (
            <PowerBar
              key={`${data.character.characterId}_${slotName}`}
              min={minPowerToDisplay}
              max={maxPowerToDisplay}
              value={power}
              avgValue={roundedPower}
              label={slotFullNames(data.className)[slotName] || slotName}
              icon={getItemIconPath(bestItem)}
              iconWatermark={getItemIconWatermarkPath(bestItem)}
              isMasterworked={isMasterwork(bestItem)}
              isCrafted={isCrafted(bestItem)}
              hasDeepsightResonance={hasIncompleteDeepsightResonance(bestItem)}
              itemName={bestItem.itemDefinition?.displayProperties.name}
              itemType={
                (bestItem.itemCategories?.[0]?.parentCategoryHashes?.[0] ===
                  1 &&
                  bestItem.itemCategories?.[0]?.displayProperties.name) ||
                bestItem.itemDefinition?.itemTypeDisplayName
              }
              location={bestItem.location}
              isEquipped={bestItem.instanceData?.isEquipped}
            />
          );
        })}
      </div>
      {roundedPower < maxPowerToDisplay ? (
        <div className={STYLES.powerLabel}>
          <div className={STYLES.indicator} style={{ left: `${perc}%` }}>
            {roundedPower}
          </div>
        </div>
      ) : null}
    </div>
  );
};
