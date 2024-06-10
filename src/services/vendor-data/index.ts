import {
  DestinyInventoryItemDefinition,
  DestinyItemInstanceComponent,
  DestinyVendorSaleItemComponent,
  getVendor,
  getVendors,
} from "bungie-api-ts/destiny2";
import { isNotNull, shuffleInPlace } from "../utils";
import { bungieAuthedFetch, getManifest } from "../bungie-api";
import { debug } from "../debug";
import { ITEM_BUCKET_SLOTS } from "../../constants";

export const getVendorData = async (
  membershipType: number,
  membershipId: string,
  characterId: string
) => {
  debug("getVendors");

  const pendingManifest = getManifest();

  const vendorsComponentsList = [
    400, // DestinyComponentType.Vendors
    // 401, // DestinyComponentType.VendorCategories
  ];
  shuffleInPlace(vendorsComponentsList);

  const vendors = await getVendors(bungieAuthedFetch, {
    components: vendorsComponentsList,
    characterId,
    destinyMembershipId: membershipId,
    membershipType,
    // filter: 0, // DestinyVendorFilter.None
  });

  const singleVendorComponentsList = [
    402, // DestinyComponentType.VendorSales,
    300, // DestinyComponentType.ItemInstances
  ];
  shuffleInPlace(singleVendorComponentsList);

  const relevantVendors = Object.values(
    vendors.Response.vendors.data || {}
  ).filter((vendor) => vendor.enabled && vendor.canPurchase);

  const vendorHashes = relevantVendors.map((v) => v.vendorHash);

  const { manifest } = await pendingManifest;

  if (!manifest) {
    throw Error("Manifest not loaded");
  }

  const joinSalesToDefinitionsAndInstances = (
    sales: Record<string, DestinyVendorSaleItemComponent>,
    itemInstances: Record<string, DestinyItemInstanceComponent>
  ) => {
    return Object.entries(sales)
      .map(([key, sale]) => {
        const itemDef = manifest.DestinyInventoryItemDefinition[sale.itemHash];
        if (!itemDef) {
          return null;
        }

        const itemInstance = itemInstances[key];

        if (!itemInstance) {
          return null;
        }

        const power =
          (itemInstance?.itemLevel || 0) * 10 + itemInstance.quality;

        const slotName =
          itemDef.inventory &&
          ITEM_BUCKET_SLOTS[itemDef.inventory.bucketTypeHash];

        return {
          ...sale,
          itemDef,
          itemInstance,
          power,
          slotName,
        };
      })
      .filter(isNotNull);
  };

  const relevantVendorData = (
    await Promise.all(
      vendorHashes.map(async (vendorHash) => {
        const vendorData = vendors.Response.vendors.data?.[vendorHash]!;
        const singleVendorData = await getVendor(bungieAuthedFetch, {
          characterId,
          vendorHash,
          destinyMembershipId: membershipId,
          membershipType,
          components: singleVendorComponentsList,
        });

        const vendorDef = manifest.DestinyVendorDefinition[vendorHash];

        const sales = joinSalesToDefinitionsAndInstances(
          singleVendorData.Response.sales.data || {},
          singleVendorData.Response.itemComponents.instances.data || {}
        );

        const vendorDestinationHash =
          vendorDef?.locations[vendorData.vendorLocationIndex].destinationHash;
        const destinationDef =
          vendorDestinationHash &&
          manifest.DestinyDestinationDefinition?.[vendorDestinationHash];
        const destinationName =
          destinationDef && destinationDef.displayProperties.name;

        const relevantVendorData = {
          vendorHash,
          name: vendorDef?.displayProperties.name,
          location: destinationName,
          icon: vendorDef?.displayProperties.smallTransparentIcon,
          sales,
        };

        return { ...relevantVendorData, sales };
      })
    )
  ).filter((data) => data.sales.length > 0);

  return relevantVendorData;
};

export type VendorData = Awaited<ReturnType<typeof getVendorData>>;
