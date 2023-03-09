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
