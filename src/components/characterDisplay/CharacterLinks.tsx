import classnames from "classnames";
import React, { useState } from "react";

import STYLES from "./CharacterLinks.module.scss";

interface CharacterLinksProps {
  membershipType: number;
  membershipId: string;
  characterId: string;
  onImageExportClick?: () => Promise<any>;
}

interface LinkOptions {
  text?: string;
  tags?: string[];
}

/* eslint-disable react/jsx-no-target-blank */
const link = (url: string, { text, tags = [] }: LinkOptions = {}) => {
  const linkText = text || new URL(url).hostname;
  return (
    <li>
      <a
        href={url}
        target="_blank"
        rel="noopener"
        className={classnames(...tags.map(tag => STYLES[`link_tag_${tag}`]))}
      >
        <span className={STYLES.linkText}>{linkText}</span>
      </a>
    </li>
  );
};

const RAID_AND_DUNGEON_REPORT_PLATFORMS: { [key: number]: string } = {
  1: "xb",
  2: "ps",
  3: "pc",
  4: "pc",
  5: "stadia"
};

export const CharacterLinks = ({
  membershipType,
  membershipId,
  characterId,
  onImageExportClick
}: CharacterLinksProps) => {
  const [isHidden, setHidden] = useState(false);

  return (
    <div
      className={classnames(STYLES.characterLinks, { [STYLES.hide]: isHidden })}
    >
      <div className={STYLES.content}>
        <ul>
          {link("https://www.destinyitemmanager.com", {
            text: "Destiny Item Manager",
            tags: ["dim"]
          })}
          {link(
            `https://braytech.org/${membershipType}/${membershipId}/${characterId}/now`,
            { text: "Braytech", tags: ["braytech"] }
          )}
          {link("https://destinysets.com/", {
            text: "Destiny Sets",
            tags: ["destinysets"]
          })}
          {link(
            `https://www.d2checklist.com/${membershipType}/${membershipId}/milestones`,
            { text: "D2 Checklist", tags: ["d2checklist"] }
          )}
          {link(
            `https://guardianstats.com/profile/${membershipId}`,
            { text: "Guardianstats", tags: ["guardianstats"] }
          )}
          {link(
            `https://raid.report/${RAID_AND_DUNGEON_REPORT_PLATFORMS[membershipType]}/${membershipId}`,
            { text: "Raid Report", tags: ["raidreport"] }
          )}
          {link(
            `https://dungeon.report/${RAID_AND_DUNGEON_REPORT_PLATFORMS[membershipType]}/${membershipId}`,
            { text: "Dungeon Report", tags: ["dungeonreport"] }
          )}
          {onImageExportClick && (
            <li>
              <span
                className={STYLES.link}
                onClick={async () => {
                  setHidden(true);
                  await onImageExportClick();
                  setHidden(false);
                }}
              >
                <span className={STYLES.linkText}>Export image</span>
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
