import React from "react";

import { ManifestData } from "../services/bungie-api";
import { VendorEngramsVendorData } from "../services/vendor-engrams";

import { AppWrapper } from "../App";
import { Vendor } from "./VendorDisplay";

import "normalize.css";
import "../index.css";

export default { title: "Vendor" };

const mockEmptyManifest: ManifestData = {
  DestinyInventoryItemDefinition: {},
  DestinyVendorDefinition: {}
};

const mockManifestWithData: ManifestData = ({
  DestinyInventoryItemDefinition: {},
  DestinyVendorDefinition: {
    "777": {
      displayProperties: {
        description:
          "Ever the gentleman sniper, Devrim Kay holds fast in the wilds of the EDZ.",
        hasIcon: true,
        icon:
          "/common/destiny2_content/icons/367067358c84628ec66d896bf6a5602c.png",
        largeIcon:
          "/common/destiny2_content/icons/fd0ba5806a7b2c679f8970609e1fec41.jpg",
        largeTransparentIcon:
          "/common/destiny2_content/icons/ec039a7b698281e1543a92b5436f4ced.png",
        mapIcon:
          "/common/destiny2_content/icons/c08b3f3761472a2d4876928bc3967ad8.png",
        name: "Test Vendor",
        originalIcon:
          "/common/destiny2_content/icons/8268ac4d55d49dc166c10408576da464.png",
        requirementsDisplay: [],
        smallTransparentIcon:
          "/common/destiny2_content/icons/a24735c49623caf24079d0e3e7dfb249.png",
        highResIcon: undefined,
        subtitle: "Dead Zone Scout"
      }
    }
  }
} as any) as ManifestData;

const mockVendor: VendorEngramsVendorData = {
  display: "1",
  shorthand: "testvendor",
  drop: "2",
  interval: "",
  nextRefresh: "",
  vendorID: "777"
};

export const vendorWithNoManifestData = () => (
  <AppWrapper>
    <Vendor manifestData={mockEmptyManifest} vendor={mockVendor} />
  </AppWrapper>
);

export const vendorWithManifestData = () => (
  <AppWrapper>
    <Vendor manifestData={mockManifestWithData} vendor={mockVendor} />
  </AppWrapper>
);
