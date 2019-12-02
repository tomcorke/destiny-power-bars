import { action } from "@storybook/addon-actions";
import { UserInfoCard } from "bungie-api-ts/user";
import React from "react";

import MembershipSelect from "./MembershipSelect";
import { RequiredApi } from "./MembershipSelect";

export default {
  title: "MembershipSelect"
};

const mockApi: RequiredApi = {
  bungieAuth: {
    getDestinyMemberships: () =>
      ([
        {
          membershipId: 1,
          membershipType: 1,
          displayName: "Test Xbox Membership"
        },
        {
          membershipId: 2,
          membershipType: 2,
          displayName: "Test PS Membership"
        },
        {
          membershipId: 3,
          membershipType: 3,
          displayName: "Test Steam Membership"
        },
        {
          membershipId: 4,
          membershipType: 4,
          displayName: "Test Battle.net Membership"
        },
        {
          membershipId: 5,
          membershipType: 5,
          displayName: "Test Stadia Membership"
        }
      ] as any) as UserInfoCard[]
  }
};

const mockApiWithMembershipType = (membershipType: number) => ({
  bungieAuth: {
    getDestinyMemberships: () =>
      ([
        {
          membershipId: 111,
          membershipType,
          displayName: "Test Membership"
        }
      ] as any) as UserInfoCard[]
  }
});

const mockApiWithCrossSave = (
  activeMembershipType: number,
  ...secondaryMembershipTypes: number[]
) => ({
  bungieAuth: {
    getDestinyMemberships: () =>
      ([
        {
          membershipId: 111,
          membershipType: activeMembershipType,
          crossSaveOverride: activeMembershipType,
          applicableMembershipTypes: [
            activeMembershipType,
            ...secondaryMembershipTypes
          ],
          displayName: "Test Cross Save Membership"
        },
        ...secondaryMembershipTypes.map(m => ({
          membershipId: 111,
          membershipType: m,
          crossSaveOverride: activeMembershipType,
          displayName: "Test Membership"
        }))
      ] as any) as UserInfoCard[]
  }
});

export const allMemberships = () => (
  <MembershipSelect
    api={mockApi}
    onMembershipSelect={action("membership selected")}
    onLogout={action("Logout")}
  />
);

export const membershipsWithCrossSave = () => (
  <MembershipSelect
    api={mockApiWithCrossSave(3, 1, 2, 5)}
    onMembershipSelect={action("membership selected")}
    onLogout={action("Logout")}
  />
);

export const xboxMembership = () => (
  <MembershipSelect
    api={mockApiWithMembershipType(1)}
    onMembershipSelect={action("membership selected")}
    onLogout={action("Logout")}
  />
);

export const psMembership = () => (
  <MembershipSelect
    api={mockApiWithMembershipType(2)}
    onMembershipSelect={action("membership selected")}
    onLogout={action("Logout")}
  />
);

export const steamMembership = () => (
  <MembershipSelect
    api={mockApiWithMembershipType(3)}
    onMembershipSelect={action("membership selected")}
    onLogout={action("Logout")}
  />
);

export const battleNetMembership = () => (
  <MembershipSelect
    api={mockApiWithMembershipType(4)}
    onMembershipSelect={action("membership selected")}
    onLogout={action("Logout")}
  />
);

export const stadiaMembership = () => (
  <MembershipSelect
    api={mockApiWithMembershipType(5)}
    onMembershipSelect={action("membership selected")}
    onLogout={action("Logout")}
  />
);
