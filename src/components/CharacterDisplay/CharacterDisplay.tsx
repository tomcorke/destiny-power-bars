import classnames from "classnames";
import React, { useContext, useRef, useState } from "react";

import { CharacterDataContext } from "../../contexts/CharacterDataContext";
import { SettingsContext } from "../../contexts/SettingsContext";
import CharacterHeader from "../characterDisplayComponents/CharacterHeader";
import { CharacterLinks } from "../characterDisplayComponents/CharacterLinks";
import { PowerBars } from "../characterDisplayComponents/PowerBars";
import { PowerDetails } from "../characterDisplayComponents/PowerDetails";
import { PowerHints } from "../characterDisplayComponents/PowerHints";

import STYLES from "./CharacterDisplay.module.scss";
import { ACCOUNT_WIDE_CHARACTER_ID } from "../../constants";
import VendorDisplay from "../VendorDisplay";

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
  onDragDrop?: () => void,
  isHidden?: boolean
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(0);

  return (
    <div
      className={classnames(STYLES.characterDisplayWrapper, {
        [STYLES.dragging]: isDragging,
        [STYLES.dragOver]: isDraggingOver > 0,
        [STYLES.hidden]: isHidden,
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
  characterId: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragDrop?: () => void;
  addClasses?: string[];
}

const CharacterDisplay = ({
  characterId,
  onDragStart,
  onDragEnd,
  onDragDrop,
}: CharacterDisplayProps) => {
  const { characterData } = useContext(CharacterDataContext);

  const { settings, setSetting } = useContext(SettingsContext);

  const data = characterData?.characters[characterId];

  const [elementRef, renderImage] = useRenderElementImage(
    data?.className || "undefined"
  );

  const isAccountCharacter = characterId === ACCOUNT_WIDE_CHARACTER_ID;

  const displayAccountPower = !!settings.displayAccountWidePower;
  const displayOnlyAccountPower = !!settings.displayOnlyAccountWidePower;

  const showThisCharacter =
    (!displayOnlyAccountPower && !isAccountCharacter) ||
    (!displayAccountPower && !isAccountCharacter) ||
    (displayOnlyAccountPower && displayAccountPower && isAccountCharacter) ||
    (!displayOnlyAccountPower && displayAccountPower);

  const isHidden = !showThisCharacter;

  const useUnrestrictedPower =
    settings.useMultipleExotics || isAccountCharacter;
  const setUseUnrestrictedPower = (newValue: boolean) =>
    setSetting("useMultipleExotics", newValue);

  if (!data) {
    return null;
  }

  const roundedPower =
    useUnrestrictedPower && data.unrestricted.overallPower
      ? data.unrestricted.overallPower
      : data.topItems.overallPower;

  const summableArtifactBonusPower =
    characterData.global.artifact?.bonusPower ?? 0;

  const uniqueEmblemPaths = Object.values(characterData.characters)
    .map((c) => c.emblem.emblemBackgroundPath)
    .slice(0, 3);

  const backgroundColour = isAccountCharacter
    ? FALLBACK_EMBLEM_RGB
    : data.emblem.emblemColor || FALLBACK_EMBLEM_RGB;

  return CharacterDisplayBodyWrapper(
    rgbString(backgroundColour),
    <div
      className={classnames(STYLES.characterDisplay, {
        [STYLES.darkerBackground]: settings.useDarkerCharacterBackground,
      })}
    >
      <CharacterHeader
        emblemBackgroundPath={data.emblem.emblemBackgroundPath}
        multiEmblemBackgroundPaths={uniqueEmblemPaths}
        useMultiEmblems={isAccountCharacter}
        className={data.className}
        hasRedactedEquippableItems={data.hasRedactedEquippableItems}
        roundedPower={roundedPower}
        summableArtifactBonusPower={summableArtifactBonusPower}
        title={data.title.name}
        titleGildedCount={data.title.gildedCount}
      />

      <div className={STYLES.content}>
        <PowerDetails
          characterId={characterId}
          useUnrestrictedPower={useUnrestrictedPower}
        />
        <PowerBars
          characterId={characterId}
          useUnrestrictedPower={useUnrestrictedPower}
        />
        {/*isAccountCharacter ? null : (
          <PowerHints
            characterId={characterId}
            useUnrestrictedPower={useUnrestrictedPower}
            onChangeUseUnrestrictedPower={(newValue) =>
              setUseUnrestrictedPower(newValue)
            }
          />
        )*/}
        <VendorDisplay characterId={characterId} />
      </div>

      {isAccountCharacter ? null : (
        <CharacterLinks
          membershipType={data.membershipType}
          membershipId={data.membershipId}
          characterId={data.characterId}
          onImageExportClick={renderImage}
        />
      )}
    </div>,
    elementRef,
    onDragStart,
    onDragEnd,
    onDragDrop,
    isHidden
  );
};

export default CharacterDisplay;
