import React, { useContext } from "react";

import { SettingsContext } from "../../contexts/SettingsContext";
import ForceRefresh from "../ForceRefresh";
import LogOut from "../LogOut";
import MembershipSelect from "../MembershipSelect";
import Settings from "../Settings";

import STYLES from "./CombinedHeader.module.scss";

const CombinedHeader = () => {
  const { settings } = useContext(SettingsContext);

  return (
    <div className={STYLES.combinedHeader}>
      <ForceRefresh />
      {!settings.hideMembershipSelector && <MembershipSelect />}
      <LogOut />
      <Settings />
    </div>
  );
};

export default CombinedHeader;
