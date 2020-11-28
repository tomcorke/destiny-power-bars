import React from "react";

import STYLES from "./GetTrackingPermission.module.scss";

interface GetTrackingPermissionProps {
  onGivePermission: () => void;
  onDenyPermission: () => void;
}

const GetTrackingPermission = ({
  onGivePermission,
  onDenyPermission,
}: GetTrackingPermissionProps) => {
  return (
    <div className={STYLES.getTrackingPermission}>
      <div className={STYLES.floater}>
        <div className={STYLES.text}>
          Destiny Power Bars would like to save some basic tracking cookies for
          Google Analytics. Is this ok?
        </div>
        <div className={STYLES.buttons}>
          <button className={STYLES.yes} onClick={onGivePermission}>
            yes
          </button>
          <button className={STYLES.no} onClick={onDenyPermission}>
            no
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetTrackingPermission;
