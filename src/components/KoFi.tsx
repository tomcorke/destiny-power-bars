import classnames from "classnames";
import React, { useEffect, useState } from "react";

import kofiIcon from "../images/Ko-fi_Icon_RGBforDarkBg_sm.png";

import STYLES from "./KoFi.module.scss";

export const Kofi = () => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const delay = setTimeout(() => setVisible(true), 10000);
    return () => clearTimeout(delay);
  }, []);

  return (
    <div
      className={classnames(STYLES.kofiContainer, {
        [STYLES.hidden]: !visible
      })}
    >
      {/* eslint-disable-next-line react/jsx-no-target-blank */}
      <a
        className={STYLES.link}
        href="https://ko-fi.com/tomcorke"
        target="_blank"
        rel="noopener"
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
