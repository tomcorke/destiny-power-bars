import { UserInfoCard } from "bungie-api-ts/user";
import classnames from "classnames";
import React from "react";

import { PartialApi } from "../../services/api";
import STYLES from "./MembershipSelect.module.scss";

export interface RequiredApi extends PartialApi {
  bungieAuth: {
    getDestinyMemberships: () => UserInfoCard[] | undefined;
  };
}

const PLATFORMS: { [key: number]: string } = {
  1: "xbox",
  2: "psn",
  3: "steam",
  4: "blizzard",
  5: "stadia",
  254: "bungie",
};

const isCrossSavePrimary = (membership: UserInfoCard) => {
  return (
    membership.crossSaveOverride &&
    membership.crossSaveOverride === membership.membershipType &&
    membership.applicableMembershipTypes.length > 0
  );
};

const isCrossSaveSecondary = (membership: UserInfoCard) => {
  return (
    membership.crossSaveOverride &&
    membership.crossSaveOverride !== membership.membershipType
  );
};

const titleCase = (s: string = "") => {
  return s.substr(0, 1).toUpperCase() + s.substr(1);
};

interface CrossSaveDisplayProps {
  membership: UserInfoCard;
}

const CrossSaveDisplay = ({ membership }: CrossSaveDisplayProps) => {
  if (membership.applicableMembershipTypes.length === 0) {
    return null;
  }
  return (
    <div className={STYLES.crossSaveDisplayWrapper}>
      <div
        className={STYLES.crossSaveDisplay}
        title={`Cross-save enabled for: ${membership.applicableMembershipTypes
          .map((t) => titleCase(PLATFORMS[t]))
          .join(", ")}`}
      >
        <div className={STYLES.crossSaveIcon} />
        {membership.applicableMembershipTypes.map((m) => {
          return (
            <div
              key={m}
              className={classnames(
                STYLES.crossSaveMembershipIcon,
                STYLES[`crossSaveMembershipType_${PLATFORMS[m]}`]
              )}
            />
          );
        })}
      </div>
    </div>
  );
};

interface BungieNameDisplayProps {
  name: string;
  code: number;
}

const BungieNameDisplay = ({ name, code }: BungieNameDisplayProps) => (
  <span className={STYLES.bungieNameDisplay}>
    <span className={STYLES.bungieName}>{name}</span>
    <span className={STYLES.bungieNameSeparator}>#</span>
    <span className={STYLES.bungieCode}>{code}</span>
  </span>
);

type UserInfoCardWithBungieName = UserInfoCard & {
  bungieGlobalDisplayName: string;
  bungieGlobalDisplayNameCode: number;
};
const isBungieMembership = (
  m: UserInfoCard
): m is UserInfoCardWithBungieName => {
  const ma = m as any;
  return ma.bungieGlobalDisplayName && ma.bungieGlobalDisplayNameCode;
};

const getDisplayName = (m: UserInfoCard) => {
  if (isBungieMembership(m)) {
    return (
      <BungieNameDisplay
        name={m.bungieGlobalDisplayName}
        code={m.bungieGlobalDisplayNameCode}
      />
    );
  }
  return m.displayName;
};

export interface MembershipSelectProps {
  onMembershipSelect: (membership: UserInfoCard) => any;
  api: RequiredApi;
}

type UserInfoCardWithOverrideMembership = UserInfoCard & {
  overrideMembershipType?: number;
};

const MembershipSelect = ({
  onMembershipSelect,
  api,
}: MembershipSelectProps) => {
  const destinyMemberships = api.bungieAuth.getDestinyMemberships();

  if (!destinyMemberships) {
    return null;
  }

  if (destinyMemberships.length === 0) {
    return <div>No destiny memberships!</div>;
  }

  let filteredMemberships: UserInfoCardWithOverrideMembership[] = destinyMemberships
    .filter((m) => !isCrossSaveSecondary(m)) // Hide cross-save secondary memberships
    .filter((m) => m.membershipType !== 4); // Hide Blizzard memberships

  const displayAsBungie =
    filteredMemberships.length === 1 &&
    isBungieMembership(filteredMemberships[0]);

  if (displayAsBungie) {
    // Override membership type to 254 to force display as bungie
    // and remove cross save because it's not important any more!
    filteredMemberships = [
      {
        ...filteredMemberships[0],
        overrideMembershipType: 254,
        applicableMembershipTypes: [],
      },
    ];
  }

  return (
    <div className={STYLES.membershipSelect}>
      {filteredMemberships.map((m) => {
        return (
          <div
            key={m.membershipId}
            className={classnames(
              STYLES.membership,
              STYLES[
                `platform_${
                  PLATFORMS[m.overrideMembershipType || m.membershipType]
                }`
              ], // Use overridden membership type if available
              {
                [STYLES.crossSaveActive]: isCrossSavePrimary(m),
                [STYLES.crossSaveDisabled]: isCrossSaveSecondary(m),
              }
            )}
            onClick={() => onMembershipSelect(m)}
          >
            <span className={STYLES.membershipDisplayName}>
              {getDisplayName(m)}
            </span>
            {isCrossSavePrimary(m) ? <CrossSaveDisplay membership={m} /> : null}
          </div>
        );
      })}
    </div>
  );
};

export default MembershipSelect;
