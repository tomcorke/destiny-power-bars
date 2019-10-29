import { UserInfoCard } from "bungie-api-ts/user";
import classnames from "classnames";
import React from "react";

import { PartialApi } from "../services/api";
import STYLES from "./MembershipSelect.module.scss";

export interface RequiredApi extends PartialApi {
  bungieAuth: {
    getDestinyMemberships: () => UserInfoCard[] | undefined;
  };
}

interface MembershipSelectProps {
  onMembershipSelect: (membership: UserInfoCard) => any;
  api: RequiredApi;
}

const MembershipSelect = ({
  onMembershipSelect,
  api
}: MembershipSelectProps) => {
  const destinyMemberships = api.bungieAuth.getDestinyMemberships();

  if (!destinyMemberships) {
    return null;
  }

  if (destinyMemberships.length === 0) {
    return <div>No destiny memberships!</div>;
  }

  const PLATFORMS: { [key: number]: string } = {
    1: "xbox",
    2: "psn",
    3: "steam",
    4: "blizzard",
    5: "stadia"
  };

  return (
    <div className={STYLES.membershipSelect}>
      {destinyMemberships.map(m => {
        return (
          <div
            key={m.membershipId}
            className={classnames(
              STYLES.membership,
              STYLES[`platform_${PLATFORMS[m.membershipType]}`]
            )}
            onClick={() => onMembershipSelect(m)}
          >
            {m.displayName}
          </div>
        );
      })}
    </div>
  );
};

export default MembershipSelect;
