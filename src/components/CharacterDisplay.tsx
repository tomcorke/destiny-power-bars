import classnames from "classnames";
import React, { useState } from "react";

import { PowerBarsCharacterData } from "../types";
import STYLES from "./CharacterDisplay.module.scss";
import { CharacterLinks } from "./characterDisplay/CharacterLinks";
import { PowerBars } from "./characterDisplay/PowerBars";
import { PowerDetails } from "./characterDisplay/PowerDetails";
import { PowerHints } from "./characterDisplay/PowerHints";

const titleCase = (text: string) =>
  text.substr(0, 1).toUpperCase() + text.substr(1);

const rgbString = ({
  red,
  green,
  blue
}: {
  red: number;
  green: number;
  blue: number;
}) => `rgb(${red},${green},${blue})`;

export const CharacterDisplayBodyWrapper = (
  backgroundColor: string,
  children: JSX.Element,
  onDragStart?: () => void,
  onDragEnd?: () => void,
  onDragDrop?: () => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(0);

  return (
    <div
      className={classnames(STYLES.characterDisplayWrapper, {
        [STYLES.dragging]: isDragging,
        [STYLES.dragOver]: isDraggingOver > 0
      })}
      style={{ backgroundColor }}
      onDragStart={() => {
        setIsDragging(true);
        onDragStart?.();
      }}
      onDragEnd={() => {
        setIsDragging(false);
        onDragEnd?.();
      }}
      onDragEnter={() => setIsDraggingOver(isDraggingOver + 1)}
      onDragOver={e => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onDragLeave={() => setIsDraggingOver(Math.max(isDraggingOver - 1, 0))}
      onDrop={() => {
        setIsDraggingOver(0);
        onDragDrop?.();
      }}
      draggable={true}
    >
      {children}
      <div className={STYLES.dragOverlay}>
        <span>Drag to reorder</span>
      </div>
    </div>
  );
};

interface CharacterDisplayProps {
  data: PowerBarsCharacterData;
  onDragStart?: (characterId: string) => void;
  onDragEnd?: (characterId: string) => void;
  onDragDrop?: (characterId: string) => void;
}

const CharacterDisplay = ({
  data,
  onDragStart,
  onDragEnd,
  onDragDrop
}: CharacterDisplayProps) => {
  const roundedPower = Math.floor(data.overallPower);

  const summableArtifactBonusPower = data.artifactData
    ? data.artifactData.bonusPower
    : 0;

  return CharacterDisplayBodyWrapper(
    rgbString(data.character.emblemColor),
    <div className={STYLES.characterDisplay}>
      <div className={STYLES.header}>
        <img
          className={STYLES.emblemBackground}
          src={`https://www.bungie.net${data.character.emblemBackgroundPath}`}
          alt=""
        />
        <div
          className={classnames(STYLES.name, {
            [STYLES.withTitle]: !!data.title
          })}
        >
          {titleCase(data.className)}
        </div>
        {data.title && <div className={STYLES.title}>{data.title}</div>}
        <div className={STYLES.power}>
          {roundedPower + summableArtifactBonusPower}
        </div>
        <div className={STYLES.headerOverlayBar} />
      </div>

      <div className={STYLES.content}>
        <PowerDetails {...data} />
        <PowerBars {...data} />
        <PowerHints {...data} />
      </div>

      <CharacterLinks
        membershipType={data.character.membershipType}
        membershipId={data.character.membershipId}
        characterId={data.character.characterId}
      />
    </div>,
    () => onDragStart?.(data.character.characterId),
    () => onDragEnd?.(data.character.characterId),
    () => onDragDrop?.(data.character.characterId)
  );
};

export default CharacterDisplay;
