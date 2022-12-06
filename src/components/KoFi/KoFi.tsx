import React from "react";

import kofiIcon from "../../images/icons/Ko-fi_Icon_RGBforDarkBg_sm.png";

import STYLES from "./KoFi.module.scss";

const KoFi = () => {
  return (
    <div className={STYLES.kofiContainer}>
      <a
        className={STYLES.link}
        href="https://ko-fi.com/tomcorke"
        /* eslint-disable-next-line react/jsx-no-target-blank */
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          height="36"
          style={{ border: "0px", height: "36px" }}
          src={kofiIcon}
          alt="Buy Me a Coffee at ko-fi.com"
        />
        <span>Buy me a coffee</span>
      </a>
    </div>
  );
};

export default KoFi;
