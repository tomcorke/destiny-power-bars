import { DestinyProfileResponse, ServerResponse } from "bungie-api-ts/destiny2";

import { BungieSystemDisabledError, getFullProfile } from "../bungie-api";
import { auth, getSelectedDestinyMembership } from "../bungie-auth";

const extractProfileData = (
  fullProfile: ServerResponse<DestinyProfileResponse>
) => {
  try {
    const characters = fullProfile.Response.characters.data!;
    const characterEquipments = fullProfile.Response.characterEquipment.data!;
    const characterInventories =
      fullProfile.Response.characterInventories.data!;
    const profileInventories = fullProfile.Response.profileInventory.data!;
    const itemInstances = fullProfile.Response.itemComponents.instances.data!;
    const itemSockets = fullProfile.Response.itemComponents.sockets.data!;
    const itemPlugObjectives =
      fullProfile.Response.itemComponents.plugObjectives.data!;
    const profileProgression = fullProfile.Response.profileProgression.data!;
    const records = fullProfile.Response.profileRecords.data!;

    return {
      responseMintedTimestamp: fullProfile.Response.responseMintedTimestamp,
      characters,
      characterEquipments,
      characterInventories,
      profileInventories,
      itemInstances,
      itemSockets,
      itemPlugObjectives,
      profileProgression,
      records,
    };
  } catch (e) {
    // Something went wrong pulling data out of the profile response
    console.error(e);
    return undefined;
  }
};

export const getProfileData = async () => {
  const destinyMembership = getSelectedDestinyMembership();
  if (!destinyMembership) {
    return;
  }

  let fullProfile: ServerResponse<DestinyProfileResponse> | undefined;
  try {
    fullProfile = await getFullProfile(
      destinyMembership.membershipType,
      destinyMembership.membershipId
    );
    if (fullProfile.ErrorStatus === "SystemDisabled") {
      throw new BungieSystemDisabledError();
    }
  } catch (e: any) {
    if (e.message === "401") {
      // On 401, re-auth and try again
      await auth();
      fullProfile = await getFullProfile(
        destinyMembership.membershipType,
        destinyMembership.membershipId
      );
    } else {
      throw e;
    }
  }

  const profileData = extractProfileData(fullProfile);
  if (!profileData) {
    return;
  }

  return profileData;
};

export type ProfileData = ReturnType<typeof extractProfileData>;
