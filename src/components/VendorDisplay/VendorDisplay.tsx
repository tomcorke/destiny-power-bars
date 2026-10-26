import { DestinyItemInstanceComponent } from "bungie-api-ts/destiny2";
import React, { useContext } from "react";

import { ACCOUNT_WIDE_CHARACTER_ID } from "../../constants";
import { CharacterDataContext } from "../../contexts/CharacterDataContext";
import { SettingsContext } from "../../contexts/SettingsContext";
import { VendorDataContext } from "../../contexts/VendorDataContext";
import { isNotNull } from "../../services/utils";
import { Power } from "../characterDisplayComponents/Power";

import STYLES from "./VendorDisplay.module.scss";

type VendorDisplayProps = {
  characterId: string;
};

const getPowerFilter = (
  displayOnlyAbovePowerVendorItems: boolean,
  displayAccountWidePower: boolean,
  characterOverallPower: number,
  accountOverallPower: number
): ((power: number, slotPower: number) => boolean) => {
  if (displayOnlyAbovePowerVendorItems) {
    if (displayAccountWidePower) {
      return (power: number) => power > accountOverallPower;
    }
    return (power: number, currentSlotPower: number) =>
      power > characterOverallPower && power > currentSlotPower;
  }
  if (displayAccountWidePower) {
    return (power: number, currentSlotPower: number) =>
      power > currentSlotPower || power > accountOverallPower;
  }
  return (power: number, currentSlotPower: number) => power > currentSlotPower;
};

type Vendor = React.ContextType<
  typeof VendorDataContext
>["vendorData"][number]["data"][number];

const VendorRow = ({ vendor: v }: { vendor: Vendor }) => (
  <div className={STYLES.vendorRow}>
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
    characterData?.characters[characterId]?.topItems.topItemsBySlot;
  const accountTopItemsBySlot = characterData?.global.accountPowerBySlot;

  const characterOverallPower =
    characterData?.characters[characterId]?.topItems.overallPower || 0;

  const accountOverallPower =
    characterData?.global.accountPower.overallPower || 0;

  const powerFilter = getPowerFilter(
    settings.displayOnlyAbovePowerVendorItems,
    settings.displayAccountWidePower,
    characterOverallPower,
    accountOverallPower
  );

  const minCharacterSlotPower =
    characterData?.characters[characterId]?.topItems.minPower || 0;

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
          slotName === undefined ? minCharacterSlotPower : currentSlotPower
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
      {relevantVendors?.map((v) => <VendorRow vendor={v} key={v.vendorHash} />)}
    </div>
  );
};

export default VendorDisplay;
