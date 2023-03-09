import classnames from "classnames";
import React, { useRef, useState } from "react";

import { PowerBarsCharacterData } from "../types";

import STYLES from "./CharacterDisplay.module.scss";
import CharacterHeader from "./characterDisplay/CharacterHeader";
import { CharacterLinks } from "./characterDisplay/CharacterLinks";
import { PowerBars } from "./characterDisplay/PowerBars";
import { PowerDetails } from "./characterDisplay/PowerDetails";
import { PowerHints } from "./characterDisplay/PowerHints";

const BLACK_RGB = { red: 0, green: 0, blue: 0 };
const FALLBACK_EMBLEM_RGB = { red: 0, green: 4, blue: 15 };

const rgbString = ({
  red,
  green,
  blue,
}: {
  red: number;
  green: number;
  blue: number;
} = BLACK_RGB) => `rgb(${red},${green},${blue})`;

const useRenderElementImage = (className: string) => {
  const elementRef = useRef(null);
  const renderElementImage = async () => {
    if (elementRef.current) {
      try {
        const domToImage = (await import(
          /* webpackChunkName: "dom-to-image" */ "dom-to-image"
        )) as any;
        const { saveAs } = await import(
          /* webpackChunkName: "file-saver" */ "file-saver"
        );
        const blob = await domToImage.toBlob(elementRef.current);
        saveAs(blob, `destiny-power-bars-${className}.png`);
      } catch (e) {
        console.error("Error capturing image of character display", e);
      }
    }
  };
  return [elementRef, renderElementImage] as const;
};

export const CharacterDisplayBodyWrapper = (
  backgroundColor: string,
  children: JSX.Element,
  ref?: React.MutableRefObject<null>,
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
        [STYLES.dragOver]: isDraggingOver > 0,
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
      onDragOver={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onDragLeave={() => setIsDraggingOver(Math.max(isDraggingOver - 1, 0))}
      onDrop={() => {
        setIsDraggingOver(0);
        onDragDrop?.();
      }}
      draggable={true}
      ref={ref}
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
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragDrop?: () => void;
  addClasses?: string[];
}

const CharacterDisplay = ({
  data,
  onDragStart,
  onDragEnd,
  onDragDrop,
  addClasses = [],
}: CharacterDisplayProps) => {
  const [elementRef, renderImage] = useRenderElementImage(data.className);

  const [useUnrestrictedPower, setUseUnrestrictedPower] = useState(true);

  const roundedPower =
    useUnrestrictedPower && data.unrestrictedOverallPower
      ? data.unrestrictedOverallPower
      : data.overallPower;

  const summableArtifactBonusPower = data.artifactData
    ? data.artifactData.bonusPower
    : 0;

  return CharacterDisplayBodyWrapper(
    rgbString(data.character.emblemColor || FALLBACK_EMBLEM_RGB),
    <div className={classnames(STYLES.characterDisplay, ...addClasses)}>
      <CharacterHeader
        emblemBackgroundPath={data.character.emblemBackgroundPath}
        className={data.className}
        hasRedactedEquippableItems={data.hasRedactedEquippableItems}
        roundedPower={roundedPower}
        summableArtifactBonusPower={summableArtifactBonusPower}
        title={data.title}
        titleGildedCount={data.titleGildedCount}
      />

      <div className={STYLES.content}>
        <PowerDetails {...data} useUnrestrictedPower={useUnrestrictedPower} />
        <PowerBars {...data} useUnrestrictedPower={useUnrestrictedPower} />
        <PowerHints
          {...data}
          useUnrestrictedPower={useUnrestrictedPower}
          onChangeUseUnrestrictedPower={(newValue) =>
            setUseUnrestrictedPower(newValue)
          }
        />
      </div>

      <CharacterLinks
        membershipType={data.character.membershipType}
        membershipId={data.character.membershipId}
        characterId={data.character.characterId}
        onImageExportClick={renderImage}
      />
    </div>,
    elementRef,
    onDragStart,
    onDragEnd,
    onDragDrop
  );
};

export default CharacterDisplay;
