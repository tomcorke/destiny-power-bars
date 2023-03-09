import React, { useCallback, useContext, useState } from "react";

import { CharacterDataContext } from "../../contexts/CharacterDataContext";
import {
  loadCharacterDisplayOrder,
  saveCharacterDisplayOrder,
} from "../../services/utils";
import CharacterDisplay from "../CharacterDisplay";

import STYLES from "./MultiCharacterDisplay.module.scss";

export const MultiCharacterDisplay = () => {
  const { characterData } = useContext(CharacterDataContext);

  const getDefaultCharacterDisplayOrder = useCallback(
    () =>
      characterData ? characterData.map((c) => c.character.characterId) : [],
    [characterData]
  );

  const isValidCharacterDisplayOrder = useCallback(
    (characterIds: string[]) =>
      characterData &&
      characterData.length === characterIds.length &&
      characterIds.every((id) =>
        characterData.some((c) => c.character.characterId === id)
      ) &&
      characterData.every((c) =>
        characterIds.includes(c.character.characterId)
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
          : getDefaultCharacterDisplayOrder();

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
      getDefaultCharacterDisplayOrder,
    ]
  );

  let useCharacterOrder = getDefaultCharacterDisplayOrder();
  if (
    characterData &&
    characterData.length > 0 &&
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

  const notUndefined = <T extends {}>(c: T | undefined): c is T => !!c;

  return (
    <div className={STYLES.charactersContainer}>
      <div className={STYLES.characters}>
        {useCharacterOrder
          .map((characterId) =>
            characterData.find((c) => c.character.characterId === characterId)
          )
          .filter(notUndefined)
          .map((c) => (
            <CharacterDisplay
              key={c.character.characterId}
              data={c}
              onDragStart={() =>
                setDraggingCharacterId(c!.character.characterId)
              }
              onDragEnd={() => setDraggingCharacterId(undefined)}
              onDragDrop={() => dropOnCharacterId(c!.character.characterId)}
            />
          ))}
      </div>
    </div>
  );
};
