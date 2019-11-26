import React from "react";

import { BuildStamp } from "./BuildStamp";
import { SocialLinks } from "./SocialLinks";

import STYLES from "./Footer.module.scss";

export const Footer = () => {
  return (
    <div className={STYLES.footer}>
      <SocialLinks />
      <BuildStamp />
    </div>
  );
};
