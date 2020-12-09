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
};

const isCrossSavePrimary = (membership: UserInfoCard) => {
  return (
    membership.crossSaveOverride &&
    membership.crossSaveOverride === membership.membershipType
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

export interface MembershipSelectProps {
  onMembershipSelect: (membership: UserInfoCard) => any;
  api: RequiredApi;
}

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

  return (
    <div className={STYLES.membershipSelect}>
      {destinyMemberships
        .filter((m) => !isCrossSaveSecondary(m))
        .filter((m) => m.membershipType !== 4)
        .map((m) => {
          return (
            <div
              key={m.membershipId}
              className={classnames(
                STYLES.membership,
                STYLES[`platform_${PLATFORMS[m.membershipType]}`],
                {
                  [STYLES.crossSaveActive]: isCrossSavePrimary(m),
                  [STYLES.crossSaveDisabled]: isCrossSaveSecondary(m),
                }
              )}
              onClick={() => onMembershipSelect(m)}
            >
              <span className={STYLES.membershipDisplayName}>
                {m.displayName}
              </span>
              {isCrossSavePrimary(m) ? (
                <CrossSaveDisplay membership={m} />
              ) : null}
            </div>
          );
        })}
    </div>
  );
};

export default MembershipSelect;
