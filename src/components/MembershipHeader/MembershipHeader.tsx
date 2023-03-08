import React, { useContext } from "react";
import classnames from "classnames";

import MembershipSelect from "../MembershipSelect";

import STYLES from "./MembershipHeader.module.scss";
import { CharacterDataContext } from "../../contexts/CharacterDataContext";
import { AuthenticationContext } from "../../contexts/AuthenticationContext";

const MembershipHeader = () => {
  const { logOut } = useContext(AuthenticationContext);
  const { isFetchingCharacterData, forceRefresh } =
    useContext(CharacterDataContext);

  return (
    <div className={STYLES.membershipHeader}>
      <button
        className={classnames(STYLES.hardRefreshButton, {
          [STYLES.disabled]: isFetchingCharacterData,
        })}
        onClick={forceRefresh}
      >
        <div className={STYLES.hardRefreshIcon} />
        <div className={STYLES.hardRefreshText}>Force Refresh</div>
      </button>
      <div className={STYLES.membershipSelect}>
        <MembershipSelect />
      </div>
      <button
        className={STYLES.logOutButton}
        onClick={() => logOut()}
        title="Log out"
      >
        <div className={STYLES.logOutIcon} />
        <div className={STYLES.logOutText}>Log out</div>
      </button>
    </div>
  );
};

export default MembershipHeader;
