import classnames from "classnames";
import React from "react";

import STYLES from "./CharacterHeader.module.scss";

const FALLBACK_EMBLEM_PATH =
  "/common/destiny2_content/icons/9dc4f3283ee9f9fc3d3499e9f9f1756c.jpg";

const titleCase = (text: string) =>
  text.substr(0, 1).toUpperCase() + text.substr(1);

type CharacterHeaderProps = {
  emblemBackgroundPath?: string;
  multiEmblemBackgroundPaths?: string[];
  useMultiEmblems?: boolean;
  className: string;
  title?: string;
  titleGildedCount?: number;
  hasRedactedEquippableItems?: boolean;
  roundedPower: number;
  summableArtifactBonusPower: number;
};

export const CharacterHeader = ({
  emblemBackgroundPath,
  multiEmblemBackgroundPaths,
  useMultiEmblems,
  className,
  title,
  titleGildedCount,
  hasRedactedEquippableItems,
  roundedPower,
  summableArtifactBonusPower,
}: CharacterHeaderProps) => (
  <div className={STYLES.CharacterHeader}>
    {useMultiEmblems ? (
      <div className={STYLES.multiEmblemWrapper}>
        {multiEmblemBackgroundPaths?.map((path, index) => (
          <img
            key={index}
            className={STYLES[`multiEmblem${index + 1}`]}
            src={`https://www.bungie.net${path || FALLBACK_EMBLEM_PATH}`}
            alt=""
          />
        ))}
      </div>
    ) : (
      <div className={STYLES.emblemWrapper}>
        <img
          className={STYLES.emblemImage}
          src={`https://www.bungie.net${
            emblemBackgroundPath || FALLBACK_EMBLEM_PATH
          }`}
          alt=""
        />
      </div>
    )}
    <div
      className={classnames(STYLES.name, {
        [STYLES.withTitle]: !!title,
      })}
    >
      {titleCase(className)}
    </div>
    {title && (
      <div
        className={classnames(STYLES.title, {
          [STYLES.gilded]: titleGildedCount && titleGildedCount > 0,
        })}
      >
        {title}
        {titleGildedCount && titleGildedCount > 0 ? (
          <div className={STYLES.gildedCount}>
            {titleGildedCount > 1 ? titleGildedCount : ""}
          </div>
        ) : null}
      </div>
    )}
    <div
      className={classnames(STYLES.power, {
        [STYLES.hasRedacted]: !!hasRedactedEquippableItems,
      })}
    >
      {roundedPower + summableArtifactBonusPower}
    </div>
    <div className={STYLES.headerOverlayBar} />
  </div>
);

export default CharacterHeader;
