import { CHARACTER_DISPLAY_ORDER_STORAGE_KEY } from "../constants";

import { debug } from "./debug";

export const loadCharacterDisplayOrder = () => {
  debug("loadCharacterDisplayOrder");
  const storedValue = localStorage.getItem(CHARACTER_DISPLAY_ORDER_STORAGE_KEY);
  try {
    return storedValue ? JSON.parse(storedValue) : undefined;
  } catch (e) {
    return undefined;
  }
};

export const saveCharacterDisplayOrder = (characterOrder: string[]) => {
  debug("saveCharacterDisplayOrder");
  localStorage.setItem(
    CHARACTER_DISPLAY_ORDER_STORAGE_KEY,
    JSON.stringify(characterOrder)
  );
};

export const shuffleInPlace = <T>(array: T[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    // Select random element up to current index
    const j = Math.floor(Math.random() * (i + 1));
    // Swap position of elements
    [array[i], array[j]] = [array[j], array[i]];
  }
};

export const isNotNull = <T>(value: T | null): value is T => value !== null;
