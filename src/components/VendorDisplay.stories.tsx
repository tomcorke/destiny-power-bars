import React from "react";
import { ManifestData } from "../services/bungie-api";
import { VendorEngramsVendorData } from "../services/vendor-engrams";
import { Vendor } from "./VendorDisplay";

export default { title: "Vendor" };

const mockEmptyManifest: ManifestData = {
  DestinyInventoryItemDefinition: {},
  DestinyVendorDefinition: {}
};

const mockVendor: VendorEngramsVendorData = {
  display: "1",
  shorthand: "testvendor",
  drop: "2",
  interval: "",
  nextRefresh: "",
  vendorID: "777"
};

export const withNoManifestData = () => (
  <Vendor manifestData={mockEmptyManifest} vendor={mockVendor} />
);
