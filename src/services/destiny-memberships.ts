import { UserInfoCard } from "bungie-api-ts/user";

import { debug } from "./debug";

const DESTINY_MEMBERSHIPS_STORAGE_KEY = "destinyMemberships";
const DESTINY_MEMBERSHIP_STORAGE_KEY = "destinyMembership";

export const storeDestinyMemberships = (destinyMemberships: UserInfoCard[]) => {
  localStorage.setItem(
    DESTINY_MEMBERSHIPS_STORAGE_KEY,
    JSON.stringify(destinyMemberships)
  );
};

export const clearStoredDestinyMemberships = () => {
  localStorage.removeItem(DESTINY_MEMBERSHIPS_STORAGE_KEY);
};

export const clearSelectedMembership = () => {
  debug("clearSelectedMembership");
  localStorage.removeItem(DESTINY_MEMBERSHIP_STORAGE_KEY);
};

export const autoSelectDestinyMembership = (
  destinyMemberships: UserInfoCard[]
) => {
  debug("autoSelectMembership");
  // If there is only one membership, select it automatically
  if (destinyMemberships.length === 1) {
    setSelectedDestinyMembership(destinyMemberships[0]!);
    return destinyMemberships[0];
  }

  const crossSavePrimaryMemberships = destinyMemberships.filter(
    (m) => m.crossSaveOverride === m.membershipType
  );
  const nonCrossSaveMemberships = destinyMemberships.filter(
    (m) => m.crossSaveOverride === 0
  );
  if (
    crossSavePrimaryMemberships.length === 1 &&
    nonCrossSaveMemberships.length === 0
  ) {
    setSelectedDestinyMembership(crossSavePrimaryMemberships[0]!);
    return crossSavePrimaryMemberships[0];
  }
};

export const getStoredDestinyMemberships = () => {
  debug("getDestinyMemberships");
  const destinyMembershipsString = localStorage.getItem(
    DESTINY_MEMBERSHIPS_STORAGE_KEY
  );
  try {
    if (destinyMembershipsString) {
      return JSON.parse(destinyMembershipsString) as UserInfoCard[];
    }
  } catch (e: any) {
    console.error(`Error loading destiny memberships`, e.message);
  }
  return undefined;
};

export const hasDestinyMemberships = () => {
  return !!getStoredDestinyMemberships();
};

export const getSelectedDestinyMembership = () => {
  debug("getSelectedDestinyMembership");
  const destinyMembershipString = localStorage.getItem(
    DESTINY_MEMBERSHIP_STORAGE_KEY
  );

  debug({ destinyMembershipString });

  try {
    if (destinyMembershipString) {
      return JSON.parse(destinyMembershipString) as UserInfoCard;
    }
    const memberships = getStoredDestinyMemberships();
    if (memberships) {
      const autoSelectedMembership = autoSelectDestinyMembership(memberships);
      debug({ memberships, autoSelectedMembership });
      if (autoSelectedMembership) {
        return autoSelectedMembership;
      }
    }
  } catch (e: any) {
    console.error("Error loading destiny membership", e.message);
  }

  debug({ return: undefined });
  return undefined;
};

export const setSelectedDestinyMembership = (membership: UserInfoCard) => {
  debug("setSelectedDestinyMembership");
  localStorage.setItem(
    DESTINY_MEMBERSHIP_STORAGE_KEY,
    JSON.stringify(membership)
  );
};
