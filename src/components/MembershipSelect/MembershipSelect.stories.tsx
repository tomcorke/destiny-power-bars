import { action } from "@storybook/addon-actions";
import { UserInfoCard } from "bungie-api-ts/user";
import React from "react";

import MembershipSelect from "./MembershipSelect";
import { RequiredApi } from "./MembershipSelect";

const story = {
  title: "Membership Select",
};
export default story;

const mockApi: RequiredApi = {
  bungieAuth: {
    getDestinyMemberships: () =>
      ([
        {
          membershipId: 1,
          membershipType: 1,
          displayName: "Test Xbox Membership",
          crossSaveOverride: 0,
          applicableMembershipTypes: [1],
        },
        {
          membershipId: 2,
          membershipType: 2,
          displayName: "Test PS Membership",
          crossSaveOverride: 0,
          applicableMembershipTypes: [2],
        },
        {
          membershipId: 3,
          membershipType: 3,
          displayName: "Test Steam Membership",
          crossSaveOverride: 0,
          applicableMembershipTypes: [3],
        },
        {
          membershipId: 4,
          membershipType: 4,
          displayName: "Test Battle.net Membership",
          crossSaveOverride: 0,
          applicableMembershipTypes: [4],
        },
        {
          membershipId: 5,
          membershipType: 5,
          displayName: "Test Stadia Membership",
          crossSaveOverride: 0,
          applicableMembershipTypes: [5],
        },
      ] as any) as UserInfoCard[],
  },
};

const mockApiWithMembershipType = (membershipType: number) => ({
  bungieAuth: {
    getDestinyMemberships: () =>
      ([
        {
          membershipId: 111,
          membershipType,
          displayName: "Test Membership",
        },
      ] as any) as UserInfoCard[],
  },
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
            ...secondaryMembershipTypes,
          ],
          displayName: "Test Cross Save Membership",
        },
        ...secondaryMembershipTypes.map((m) => ({
          membershipId: 111,
          membershipType: m,
          crossSaveOverride: activeMembershipType,
          displayName: "Test Membership",
        })),
      ] as any) as UserInfoCard[],
  },
});

export const allMemberships = () => (
  <MembershipSelect
    api={mockApi}
    onMembershipSelect={action("membership selected")}
  />
);

export const membershipsWithCrossSave = () => {
  const membershipDisplays = () => (
    <>
      <MembershipSelect
        api={mockApiWithCrossSave(1, 2, 3, 5)}
        onMembershipSelect={action("membership selected")}
      />
      <MembershipSelect
        api={mockApiWithCrossSave(2, 1, 3, 5)}
        onMembershipSelect={action("membership selected")}
      />
      <MembershipSelect
        api={mockApiWithCrossSave(3, 1, 2, 5)}
        onMembershipSelect={action("membership selected")}
      />
      <MembershipSelect
        api={mockApiWithCrossSave(5, 1, 2, 3)}
        onMembershipSelect={action("membership selected")}
      />
    </>
  );
  return (
    <div
      style={{
        display: "flex",
        flexFlow: "row wrap",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexFlow: "column nowrap",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "10px 20px 20px",
            display: "flex",
            flexFlow: "column nowrap",
          }}
        >
          {membershipDisplays()}
        </div>
        <div
          style={{
            background: "#999",
            padding: "10px 20px 20px",
            display: "flex",
            flexFlow: "column nowrap",
          }}
        >
          {membershipDisplays()}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexFlow: "column nowrap",
        }}
      >
        <div
          style={{
            background: "linear-gradient(to right, #444, #eee)",
            padding: "10px 20px 20px",
            display: "flex",
            flexFlow: "column nowrap",
          }}
        >
          {membershipDisplays()}
        </div>
        <div
          style={{
            background: "black",
            padding: "10px 20px 20px",
            display: "flex",
            flexFlow: "column nowrap",
          }}
        >
          {membershipDisplays()}
        </div>
      </div>
    </div>
  );
};

export const xboxMembership = () => (
  <MembershipSelect
    api={mockApiWithMembershipType(1)}
    onMembershipSelect={action("membership selected")}
  />
);

export const psMembership = () => (
  <MembershipSelect
    api={mockApiWithMembershipType(2)}
    onMembershipSelect={action("membership selected")}
  />
);

export const steamMembership = () => (
  <MembershipSelect
    api={mockApiWithMembershipType(3)}
    onMembershipSelect={action("membership selected")}
  />
);

export const battleNetMembership = () => (
  <MembershipSelect
    api={mockApiWithMembershipType(4)}
    onMembershipSelect={action("membership selected")}
  />
);

export const stadiaMembership = () => (
  <MembershipSelect
    api={mockApiWithMembershipType(5)}
    onMembershipSelect={action("membership selected")}
  />
);
