import { describe, expect, it } from "vitest";

import {
  isNotNull,
  loadCharacterDisplayOrder,
  saveCharacterDisplayOrder,
  shuffleInPlace,
} from "./utils";

describe("character display order", () => {
  it("round trips through local storage", () => {
    saveCharacterDisplayOrder(["b", "a"]);
    expect(loadCharacterDisplayOrder()).toEqual(["b", "a"]);
  });

  it("ignores unparseable stored values", () => {
    localStorage.setItem("characterDisplayOrder", "{");
    expect(loadCharacterDisplayOrder()).toBeUndefined();
  });
});

describe("shuffleInPlace", () => {
  it("keeps every element", () => {
    const values = [1, 2, 3, 4, 5];
    shuffleInPlace(values);
    expect([...values].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("isNotNull", () => {
  it("filters out nulls", () => {
    expect([1, null, 2].filter(isNotNull)).toEqual([1, 2]);
  });
});
