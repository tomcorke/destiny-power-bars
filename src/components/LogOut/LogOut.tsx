import React, { useContext } from "react";

import { AuthenticationContext } from "../../contexts/AuthenticationContext";

import STYLES from "./LogOut.module.scss";

export const LogOut = () => {
  const { logOut } = useContext(AuthenticationContext);

  return (
    <button
      className={STYLES.logOutButton}
      onClick={() => logOut()}
      title="Log out"
    >
      <div className={STYLES.logOutIcon} />
      <div className={STYLES.logOutText}>Log out</div>
    </button>
  );
};
