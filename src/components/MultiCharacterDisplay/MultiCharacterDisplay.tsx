import React, { useCallback, useContext, useMemo, useState } from "react";

import { CharacterDataContext } from "../../contexts/CharacterDataContext";
import {
  loadCharacterDisplayOrder,
  saveCharacterDisplayOrder,
} from "../../services/utils";
import CharacterDisplay from "../CharacterDisplay";

import STYLES from "./MultiCharacterDisplay.module.scss";

export const MultiCharacterDisplay = () => {
  const { characterData } = useContext(CharacterDataContext);

  const defaultCharacterDisplayOrder = useMemo(
    () =>
      characterData
        ? Object.values(characterData.characters).map((c) => c.characterId)
        : [],
    [characterData]
  );

  const isValidCharacterDisplayOrder = useCallback(
    (characterIds: string[]) =>
      characterData &&
      Object.values(characterData.characters).length === characterIds.length &&
      characterIds.every((id) =>
        Object.keys(characterData.characters).includes(id)
      ) &&
      Object.keys(characterData.characters).every((id) =>
        characterIds.includes(id)
      ),
    [characterData]
  );
  const [draggingCharacterId, setDraggingCharacterId] = useState<
    string | undefined
  >(undefined);
  const [characterDisplayOrder, setCharacterDisplayOrder] = useState<
    string[] | undefined
  >(loadCharacterDisplayOrder());
  const dropOnCharacterId = useCallback(
    (dropCharacterId: string) => {
      if (!draggingCharacterId || draggingCharacterId === dropCharacterId) {
        return;
      }
      const currentCharacterOrder =
        characterDisplayOrder && characterDisplayOrder.length > 0
          ? characterDisplayOrder
          : defaultCharacterDisplayOrder;

      const swappedOrder = currentCharacterOrder.slice();
      swappedOrder.splice(
        currentCharacterOrder.indexOf(draggingCharacterId),
        1,
        dropCharacterId
      );
      swappedOrder.splice(
        currentCharacterOrder.indexOf(dropCharacterId),
        1,
        draggingCharacterId
      );

      saveCharacterDisplayOrder(swappedOrder);
      setCharacterDisplayOrder(swappedOrder);
    },
    [
      draggingCharacterId,
      characterDisplayOrder,
      setCharacterDisplayOrder,
      defaultCharacterDisplayOrder,
    ]
  );

  let useCharacterOrder = characterData
    ? Object.keys(characterData.characters)
    : [];

  if (
    characterData &&
    Object.keys(characterData.characters).length > 0 &&
    characterDisplayOrder &&
    characterDisplayOrder.length > 0
  ) {
    // Validate that character IDs in display order match
    if (isValidCharacterDisplayOrder(characterDisplayOrder)) {
      useCharacterOrder = characterDisplayOrder;
    } else {
      setCharacterDisplayOrder(undefined);
    }
  }

  return (
    <div className={STYLES.charactersContainer}>
      <div className={STYLES.characters}>
        {useCharacterOrder.map((characterId) => (
          <CharacterDisplay
            key={characterId}
            characterId={characterId}
            onDragStart={() => setDraggingCharacterId(characterId)}
            onDragEnd={() => setDraggingCharacterId(undefined)}
            onDragDrop={() => dropOnCharacterId(characterId)}
          />
        ))}
      </div>
    </div>
  );
};
