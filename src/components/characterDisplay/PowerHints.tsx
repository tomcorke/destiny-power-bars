import classnames from "classnames";
import humanizeDuration from "humanize-duration";
import React, { useEffect, useState } from "react";

import {
  getVendorDisplayName,
  VENDOR_ENGRAMS_DROP_HIGH,
  VendorEngramsData
} from "../../services/vendor-engrams";
import { Power } from "./Power";

import STYLES from "./PowerHints.module.scss";

interface PowerHintsProps {
  overallPower: number;
  potentialOverallPower?: number;
  powerRequiredToReachPotential?: number;
  vendorData?: VendorEngramsData;
}

export const PowerHints = (data: PowerHintsProps) => {
  const highVendors =
    (data.vendorData &&
      data.vendorData.data.filter(
        v => v.drop === VENDOR_ENGRAMS_DROP_HIGH && v.display === "1"
      )) ||
    [];

  const [vendorStaleTimeString, setVendorStaleTimeString] = useState("");

  useEffect(() => {
    const timeStringUpdateTimer = setInterval(() => {
      if (!data.vendorData) {
        return "";
      }
      const newString = humanizeDuration(
        data.vendorData.updateTimestamp - Date.now(),
        {
          round: true
        }
      );
      setVendorStaleTimeString(newString);
    }, 1000);

    return () => {
      clearInterval(timeStringUpdateTimer);
    };
  });

  return (
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
              <div>
                World drops (from strikes, public events, vendors, non-powerful
                legendary rewards) can drop with a power level from{" "}
                <Power>{data.overallPower - 3}</Power> to{" "}
                <Power>{data.overallPower}</Power> for this character.
              </div>
              {highVendors.length > 0 ? (
                <div>
                  The following vendors are giving engrams at your maximum
                  equippable gear power, according to{" "}
                  <a
                    href="https://www.vendorengrams.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    vendorengrams.xyz
                  </a>
                  , last updated {vendorStaleTimeString} ago:
                  <ul>
                    {highVendors.map(v => (
                      <li key={v.shorthand}>
                        <Power>{getVendorDisplayName(v.shorthand)}</Power>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div>
                Replacing items below your current overall power can increase
                your power to a higher average.
              </div>
              {data.powerRequiredToReachPotential ? (
                <div>
                  You need an extra{" "}
                  <Power>{data.powerRequiredToReachPotential}</Power> total
                  power on your items to reach an overall power of{" "}
                  <Power>{data.potentialOverallPower}</Power>.
                </div>
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
              <div>
                Powerful and pinnacle reward sources (Weekly challenges, Year 3
                raids) will give you items above your overall gear power, with
                powerful rewards capped at <Power>{950}</Power>.
              </div>
              <div>
                Powerful rewards (Tier 1) will give items up to 3 levels above
                your overall gear power
              </div>
              <div>
                Powerful rewards (Tier 2) will give items up to 5 levels above
                your overall gear power
              </div>
              <div>
                Pinnacle rewards will give items up to 7 levels above your
                overall gear power
              </div>
              <div>
                After getting a powerful reward, check back here to see if it's
                beneficial to catch up the rest of your slots with world drops
                before getting another!
              </div>
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
            pinnacle cap of <Power>{960}</Power>
          </span>
          <div className={STYLES.hintExtra}>
            <div className={STYLES.hintExtraInner}>
              <div>
                Pinnacle reward sources (Weekly challenges, Year 3 raids) will
                give you items above your overall gear power, capped at{" "}
                <Power>{960}</Power>.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
