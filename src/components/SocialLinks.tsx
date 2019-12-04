import React from "react";

import { Kofi } from "./KoFi";

import { ReactComponent as GitHubLogo } from "../images/icons/github.svg";
import { ReactComponent as TwitterLogo } from "../images/icons/twitter.svg";

import STYLES from "./SocialLinks.module.scss";

export const SocialLinks = () => (
  <div className={STYLES.socialLinks}>
    <div className={STYLES.link}>
      <Kofi />
    </div>
    <a
      className={STYLES.link}
      href="https://www.twitter.com/corke_tom"
      target="_blank"
      rel="noreferrer noopener"
    >
      <TwitterLogo
        width={20}
        height={20}
        style={{ fill: "rgba(255,255,255,0.8)" }}
      />
    </a>
    <a
      className={STYLES.link}
      href="https://github.com/tomcorke/destiny-power-bars"
      target="_blank"
      rel="noreferrer noopener"
    >
      <GitHubLogo
        width={20}
        height={20}
        style={{ fill: "rgba(255,255,255,0.8)" }}
      />
    </a>
  </div>
);
