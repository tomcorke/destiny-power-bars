import React from "react";

import { BuildStamp } from "./BuildStamp";
import { SocialLinks } from "./SocialLinks";

import STYLES from "./Footer.module.scss";

export const Footer = () => {
  return (
    <div className={STYLES.footer}>
      <div className={STYLES.copy}>Destiny Power Bars &copy; Tom Corke.</div>
      <SocialLinks />
      <BuildStamp />
    </div>
  );
};
