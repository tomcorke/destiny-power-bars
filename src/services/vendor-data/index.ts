import {
  DestinyComponentType,
  DestinyInventoryItemDefinition,
  DestinyItemInstanceComponent,
  DestinyStringVariablesComponent,
  DestinyVendorSaleItemComponent,
  getProfile,
  getVendor,
  getVendors,
} from "bungie-api-ts/destiny2";
import { isNotNull, shuffleInPlace } from "../utils";
import { bungieAuthedFetch, getManifest } from "../bungie-api";
import { debug } from "../debug";
import { ITEM_BUCKET_SLOTS } from "../../constants";
import _ from "lodash";

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

  let pendingStringVariables:
    | ReturnType<typeof doGetStringVariables>
    | undefined = undefined;

  const doGetStringVariables = async () => {
    const response = await getProfile(bungieAuthedFetch, {
      components: [
        1200, // DestinyComponentType.StringVariables
      ],
      destinyMembershipId: membershipId,
      membershipType,
    });
    return {
      characterStringVariables:
        response.Response.characterStringVariables?.data,
      profileStringVariables: response.Response.profileStringVariables?.data,
    };
  };
  const getStringVariables = async () => {
    if (!pendingStringVariables) {
      pendingStringVariables = doGetStringVariables();
    }
    return pendingStringVariables;
  };

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
          vendorDef?.locations[vendorData.vendorLocationIndex]?.destinationHash;
        const destinationDef =
          vendorDestinationHash &&
          manifest.DestinyDestinationDefinition?.[vendorDestinationHash];
        const destinationName =
          destinationDef && destinationDef.displayProperties.name;

        let name = vendorDef?.displayProperties.name;

        if (name && name.includes("{var:")) {
          const stringVariables = await getStringVariables();
          const variablePattern = /\{var:(\d+)\}/g;
          const matches = Array.from(name.matchAll(variablePattern));
          const originalName = name;
          for (const match of matches) {
            const characterVariableValue =
              stringVariables?.characterStringVariables?.[characterId]
                ?.integerValuesByHash?.[Number(match[1])];
            const profileVariableValue =
              stringVariables?.profileStringVariables?.integerValuesByHash?.[
                Number(match[1])
              ];
            const variableValue =
              characterVariableValue !== undefined
                ? characterVariableValue
                : profileVariableValue;
            if (variableValue !== undefined) {
              name = name?.replace(match[0], variableValue.toString());
            }
          }

          // const csv = _.pickBy(
          //   stringVariables?.characterStringVariables?.[characterId]
          //     ?.integerValuesByHash,
          //   (value, key) => originalName.includes(key)
          // );
          // const psv = _.pickBy(
          //   stringVariables?.profileStringVariables?.integerValuesByHash,
          //   (value, key) => originalName.includes(key)
          // );
          // console.log({
          //   stringVariables: { csv, psv },
          //   originalName,
          //   name,
          // });
        }

        const relevantVendorData = {
          vendorHash,
          name,
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
