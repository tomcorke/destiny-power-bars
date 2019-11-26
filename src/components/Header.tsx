import React from "react";

import STYLES from "./Header.module.scss";

export const Header = () => (
  <div className={STYLES.headerContainer}>
    <div className={STYLES.header}>Destiny Power Bars</div>
    <div className={STYLES.subHeader}>
      by{" "}
      <a
        className={STYLES.author}
        href="https://twitter.com/corke_tom"
        rel="noreferrer noopener"
        target="_blank"
      >
        Tom Corke
      </a>
    </div>
  </div>
);
