import React from "react";

import ForceRefresh from "../ForceRefresh";
import LogOut from "../LogOut";
import MembershipSelect from "../MembershipSelect";
import Settings from "../Settings";

import STYLES from "./CombinedHeader.module.scss";

const CombinedHeader = () => {
  return (
    <div className={STYLES.combinedHeader}>
      <ForceRefresh />
      <MembershipSelect />
      <LogOut />
      <Settings />
    </div>
  );
};

export default CombinedHeader;
