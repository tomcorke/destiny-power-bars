import useInterval from "@use-it/interval";
import classnames from "classnames";
import HumanizeDuration from "humanize-duration";
import React, { useEffect, useState } from "react";

import { ITEM_POWER_POWERFUL_CAP } from "../constants";
import { ManifestData } from "../services/bungie-api";
import {
  getVendorDisplayName,
  getVendorEngramsData,
  VENDOR_ENGRAMS_DROP_HIGH,
  VENDOR_ENGRAMS_DROP_LOW,
  VENDOR_ENGRAMS_DROP_NO_DATA,
  VendorEngramsData,
  VendorEngramsVendorData,
} from "../services/vendor-engrams";
import { Power } from "./characterDisplay/Power";

import STYLES from "./VendorDisplay.module.scss";

const VENDOR_DATA_REFRESH_ATTEMPT_DELAY = 10 * 1000;

interface VendorProps {
  vendor: VendorEngramsVendorData;
  manifestData: ManifestData;
}
export const Vendor = ({ vendor, manifestData }: VendorProps) => {
  const manifestVendor = manifestData.DestinyVendorDefinition[vendor.vendorID];
  let vendorInner: JSX.Element | string;

  if (!manifestVendor) {
    vendorInner = getVendorDisplayName(vendor.shorthand);
  } else {
    vendorInner = (
      <>
        <img
          className={STYLES.icon}
          src={`https://www.bungie.net${manifestVendor.displayProperties.icon}`}
          alt=""
        />
        {manifestVendor.displayProperties.name}
      </>
    );
  }
  return (
    <div
      className={classnames(STYLES.vendor, {
        [STYLES.high]: vendor.drop === VENDOR_ENGRAMS_DROP_HIGH,
        [STYLES.low]: vendor.drop === VENDOR_ENGRAMS_DROP_LOW,
        [STYLES.noData]: vendor.drop === VENDOR_ENGRAMS_DROP_NO_DATA,
      })}
    >
      {vendorInner}
    </div>
  );
};

const vendorListDisplay = (
  vendors: VendorEngramsVendorData[],
  manifestData: ManifestData
) => {
  return (
    <ul className={STYLES.vendorList}>
      {vendors.map((v) => (
        <li className={STYLES.vendorListItem} key={v.shorthand}>
          <Vendor manifestData={manifestData} vendor={v} />
        </li>
      ))}
    </ul>
  );
};

interface VendorDisplayProps {
  manifestData?: ManifestData;
}

export const VendorDisplay = ({ manifestData }: VendorDisplayProps) => {
  const [vendorData, setVendorData] = useState<VendorEngramsData | undefined>(
    undefined
  );

  const attemptRefreshVendorData = () => {
    getVendorEngramsData()
      .then((data) => setVendorData(data))
      .catch((e) => console.warn(`Error fetching vendor engrams data:`, e));
  };
  useInterval(attemptRefreshVendorData, VENDOR_DATA_REFRESH_ATTEMPT_DELAY);
  useEffect(attemptRefreshVendorData, []);

  const [vendorsLastCheckedString, setVendorsLastCheckedString] = useState<
    string | null
  >(null);

  useInterval(() => {
    if (!vendorData) {
      setVendorsLastCheckedString(null);
      return;
    }

    const newString = HumanizeDuration(
      vendorData.updateTimestamp - Date.now(),
      {
        round: true,
        largest: 1,
      }
    );
    setVendorsLastCheckedString(newString);
  }, 1000);

  if (!manifestData) {
    return null;
  }

  const highVendors =
    (vendorData &&
      vendorData.data.filter(
        (v) => v.drop === VENDOR_ENGRAMS_DROP_HIGH && v.display === "1"
      )) ||
    [];

  const noDataVendors =
    (vendorData &&
      vendorData.data.filter(
        (v) => v.drop === VENDOR_ENGRAMS_DROP_NO_DATA && v.display === "1"
      )) ||
    [];

  if (!vendorData) {
    return null;
  }

  return (
    <div className={STYLES.vendorDisplay}>
      {highVendors.length > 0 && (
        <div className={classnames(STYLES.section, STYLES.withSeparator)}>
          <div className={STYLES.description}>
            These vendors are currently giving at-level engrams (to a maximum of{" "}
            <Power>{ITEM_POWER_POWERFUL_CAP}</Power>) which can help you raise
            the power of slots below your average, or to provide items for
            infusion:
          </div>
          {vendorListDisplay(highVendors, manifestData)}
        </div>
      )}
      {noDataVendors.length > 0 && (
        <div className={STYLES.section}>
          <div className={STYLES.description}>
            Some vendors are missing data, visit{" "}
            <a
              href="https://www.vendorengrams.xyz"
              /* eslint-disable-next-line react/jsx-no-target-blank */
              target="_blank"
              rel="noopener"
            >
              vendorengrams.xyz
            </a>{" "}
            if you can help provide data for these vendors:
          </div>
          {vendorListDisplay(noDataVendors, manifestData)}
        </div>
      )}

      <div className={STYLES.section}>
        <div>
          Data provided by{" "}
          <a
            href="https://www.vendorengrams.xyz"
            /* eslint-disable-next-line react/jsx-no-target-blank */
            target="_blank"
            rel="noopener"
          >
            vendorengrams.xyz
          </a>
          {vendorsLastCheckedString && (
            <>, last updated {vendorsLastCheckedString} ago.</>
          )}
        </div>
      </div>
    </div>
  );
};
