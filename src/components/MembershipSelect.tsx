import { UserInfoCard } from "bungie-api-ts/user";
import classnames from "classnames";
import React from "react";

import { PartialApi } from "../services/api";
import { logOut } from "../services/bungie-auth";
import STYLES from "./MembershipSelect.module.scss";

export interface RequiredApi extends PartialApi {
  bungieAuth: {
    getDestinyMemberships: () => UserInfoCard[] | undefined;
  };
}

const defaultOnLogout = () => logOut();

const PLATFORMS: { [key: number]: string } = {
  1: "xbox",
  2: "psn",
  3: "steam",
  4: "blizzard",
  5: "stadia"
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

interface CrossSaveDisplayProps {
  membership: UserInfoCard;
}

const CrossSaveDisplay = ({ membership }: CrossSaveDisplayProps) => {
  if (membership.applicableMembershipTypes.length === 0) {
    return null;
  }
  return (
    <div className={STYLES.crossSaveDisplay}>
      <div className={STYLES.crossSaveIcon} />
      {membership.applicableMembershipTypes.map(m => {
        return (
          <div
            className={classnames(
              STYLES.crossSaveMembershipIcon,
              STYLES[`crossSaveMembershipType_${PLATFORMS[m]}`]
            )}
          />
        );
      })}
    </div>
  );
};

interface MembershipSelectProps {
  onMembershipSelect: (membership: UserInfoCard) => any;
  api: RequiredApi;
  onLogout?: () => void;
}

const MembershipSelect = ({
  onMembershipSelect,
  api,
  onLogout = defaultOnLogout
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
        .filter(m => !isCrossSaveSecondary(m))
        .map(m => {
          return (
            <div
              key={m.membershipId}
              className={classnames(
                STYLES.membership,
                STYLES[`platform_${PLATFORMS[m.membershipType]}`],
                {
                  [STYLES.crossSaveActive]: isCrossSavePrimary(m),
                  [STYLES.crossSaveDisabled]: isCrossSaveSecondary(m)
                }
              )}
              onClick={() => onMembershipSelect(m)}
            >
              <span className={STYLES.membershipDisplayName}>
                {m.displayName}
              </span>
              {isCrossSavePrimary(m) && <CrossSaveDisplay membership={m} />}
            </div>
          );
        })}
      <button
        className={STYLES.logOut}
        onClick={() => onLogout()}
        title="Log out"
      >
        <div className={STYLES.logOutIcon} />
        <div className={STYLES.logOutText}>Log out</div>
      </button>
    </div>
  );
};

export default MembershipSelect;
