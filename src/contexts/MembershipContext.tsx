import { BungieMembershipType } from "bungie-api-ts/common";
import { UserInfoCard } from "bungie-api-ts/user";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getSelectedDestinyMembership,
  getStoredDestinyMemberships,
} from "../services/bungie-auth";
import { AuthenticationContext } from "./AuthenticationContext";

type MembershipState = (
  | {
      hasSelectedMembership: false;
      membershipId?: undefined;
      membershipType?: undefined;
    }
  | {
      hasSelectedMembership: true;
      membershipId: string;
      membershipType: BungieMembershipType;
    }
) & {
  destinyMemberships: UserInfoCard[];
  selectMembership: (membership: UserInfoCard) => void;
};

export const MembershipContext = createContext<MembershipState>({
  hasSelectedMembership: false,
  destinyMemberships: [],
  membershipId: undefined,
  membershipType: undefined,
  selectMembership: () => {},
});

export const MembershipContextProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const { isAuthed } = useContext(AuthenticationContext);

  const [destinyMemberships, setDestinyMemberships] = useState(
    getStoredDestinyMemberships()
  );

  // Re-fetch stored destiny memberships from localstorage when isAuthed changes
  // - the authentication flow may have updated the localstorage value.
  useEffect(
    () => setDestinyMemberships(getStoredDestinyMemberships()),
    [isAuthed]
  );

  const hasDestinyMemberships =
    destinyMemberships && destinyMemberships.length > 0;

  const [selectedMembership, setSelectedMembership] = useState(
    getSelectedDestinyMembership()
  );

  useEffect(
    () => setSelectedMembership(getSelectedDestinyMembership()),
    [hasDestinyMemberships]
  );

  const membershipContextData = !!selectedMembership
    ? {
        hasSelectedMembership: true as const,
        membershipId: selectedMembership.membershipId,
        membershipType: selectedMembership.membershipType,
      }
    : { hasSelectedMembership: false as const };

  return (
    <MembershipContext.Provider
      value={{
        ...membershipContextData,
        destinyMemberships: hasDestinyMemberships ? destinyMemberships : [],
        selectMembership: setSelectedMembership,
      }}
    >
      {children}
    </MembershipContext.Provider>
  );
};
