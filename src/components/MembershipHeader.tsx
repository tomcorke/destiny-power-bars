import React from "react";
import classnames from "classnames";

import MembershipSelect, { MembershipSelectProps } from "./MembershipSelect";
import { logOut } from "../services/bungie-auth";

import STYLES from "./MembershipHeader.module.scss";

const defaultOnLogout = () => logOut();

type MembershipHeaderProps = MembershipSelectProps & {
  isFetchingCharacterData: boolean;
  onRefreshClick: () => void;
  onLogout?: () => void;
};

const MembershipHeader = ({
  isFetchingCharacterData,
  onRefreshClick,
  onLogout = defaultOnLogout,
  ...props
}: MembershipHeaderProps) => {
  return (
    <div className={STYLES.membershipHeader}>
      <button
        className={classnames(STYLES.hardRefreshButton, {
          [STYLES.disabled]: isFetchingCharacterData,
        })}
        onClick={onRefreshClick}
      >
        <div className={STYLES.hardRefreshIcon} />
        <div className={STYLES.hardRefreshText}>Force Refresh</div>
      </button>
      <div className={STYLES.membershipSelect}>
        <MembershipSelect {...props} />
      </div>
      <button
        className={STYLES.logOutButton}
        onClick={() => onLogout()}
        title="Log out"
      >
        <div className={STYLES.logOutIcon} />
        <div className={STYLES.logOutText}>Log out</div>
      </button>
    </div>
  );
};

export default MembershipHeader;
