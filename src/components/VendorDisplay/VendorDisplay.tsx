import React, { useContext } from "react";

import STYLES from "./VendorDisplay.module.scss";
import { VendorDataContext } from "../../contexts/VendorDataContext";
import { ACCOUNT_WIDE_CHARACTER_ID } from "../../constants";
import { DestinyItemInstanceComponent } from "bungie-api-ts/destiny2";
import { isNotNull } from "../../services/utils";
import { Power } from "../characterDisplayComponents/Power";
import { CharacterDataContext } from "../../contexts/CharacterDataContext";
import { SettingsContext } from "../../contexts/SettingsContext";

type VendorDisplayProps = {
  characterId: string;
};

const VendorDisplay = ({ characterId }: VendorDisplayProps) => {
  const { vendorData } = useContext(VendorDataContext);
  const { characterData } = useContext(CharacterDataContext);
  const { settings } = useContext(SettingsContext);

  if (!settings.displayVendorItems) {
    return null;
  }

  const vendors =
    vendorData.find((v) => v.characterId === characterId)?.data || [];

  if (vendors.length === 0) {
    return null;
  }

  const topItemsBySlot =
    characterData?.characters[characterId].topItems.topItemsBySlot;
  const accountTopItemsBySlot = characterData?.global.accountPowerBySlot;

  const characterOverallPower =
    characterData?.characters[characterId].topItems.overallPower || 0;

  const accountOverallPower =
    characterData?.global.accountPower.overallPower || 0;

  let powerFilter: (power: number, slotPower: number) => boolean;

  if (settings.displayOnlyAbovePowerVendorItems) {
    if (settings.displayAccountWidePower) {
      powerFilter = (power: number) => power > accountOverallPower;
    } else {
      powerFilter = (power: number, currentSlotPower: number) =>
        power > characterOverallPower && power > currentSlotPower;
    }
  } else {
    if (settings.displayAccountWidePower) {
      powerFilter = (power: number, currentSlotPower: number) =>
        power > currentSlotPower || power > accountOverallPower;
    } else {
      powerFilter = (power: number, currentSlotPower: number) =>
        power > currentSlotPower;
    }
  }

  const vendorsWithRelevantItems = vendors.map((v) => {
    const itemsWithPower = v.sales
      .map((sale) => {
        const { power, slotName } = sale;

        const hasRelevantPower = power >= 1900;
        const noFailures = sale.failureIndexes.length === 0;

        const currentSlotPower = slotName
          ? settings.displayAccountWidePower
            ? accountTopItemsBySlot?.[slotName] || 9999
            : topItemsBySlot?.[slotName]?.power || 9999
          : 9999;

        const isSlotlessOrAboveCurrentSlotPower = powerFilter(
          power,
          slotName === undefined ? 0 : currentSlotPower
        );

        if (
          hasRelevantPower &&
          sale.quantity > 0 &&
          noFailures &&
          isSlotlessOrAboveCurrentSlotPower
        ) {
          return { ...sale, power };
        }

        return null;
      })
      .filter(isNotNull);

    return {
      ...v,
      sales: itemsWithPower,
    };
  });

  const relevantVendors = vendorsWithRelevantItems.filter(
    (v) => Object.keys(v.sales).length > 0
  );

  if (relevantVendors.length === 0) {
    return null;
  }

  let headerText: string;
  if (settings.displayAccountWidePower) {
    headerText = "Account power increases available from vendors:";
  } else {
    headerText = "Power increases available from vendors:";
  }

  return (
    <div className={STYLES.VendorDisplay}>
      <div className={STYLES.vendorHeader}>{headerText}</div>
      {relevantVendors?.map((v) => {
        return (
          <div className={STYLES.vendorRow} key={v.vendorHash}>
            <div className={STYLES.icon}>
              <img src={`https://www.bungie.net${v.icon}`} alt="" />
            </div>
            <div className={STYLES.header}>
              <div className={STYLES.name}>{v.name}</div>
              <div className={STYLES.location}>{v.location}</div>
            </div>
            <div className={STYLES.items}>
              {v.sales.map((sale) => {
                return (
                  <div
                    className={STYLES.item}
                    key={`${sale.vendorItemIndex}_${sale.itemHash}`}
                  >
                    <div className={STYLES.power}>
                      <Power>{sale.power}</Power>
                    </div>
                    <div className={STYLES.icon}>
                      <img
                        src={`https://www.bungie.net${sale.itemDef?.displayProperties.icon}`}
                        alt=""
                      />
                    </div>
                    <div className={STYLES.name}>
                      {sale.itemDef?.displayProperties.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VendorDisplay;
