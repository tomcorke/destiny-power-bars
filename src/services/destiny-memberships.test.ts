import { UserInfoCard } from "bungie-api-ts/user";
import { beforeEach, describe, expect, it } from "vitest";

import {
  autoSelectDestinyMembership,
  getSelectedDestinyMembership,
  hasDestinyMemberships,
  storeDestinyMemberships,
} from "./destiny-memberships";

const membership = (
  membershipId: string,
  membershipType: number,
  crossSaveOverride: number
) => ({ membershipId, membershipType, crossSaveOverride }) as UserInfoCard;

beforeEach(() => localStorage.clear());

describe("autoSelectDestinyMembership", () => {
  it("selects the only membership", () => {
    const only = membership("1", 3, 0);
    expect(autoSelectDestinyMembership([only])).toEqual(only);
    expect(getSelectedDestinyMembership()).toEqual(only);
  });

  it("selects the cross save primary when every membership is cross saved", () => {
    const primary = membership("1", 3, 3);
    const secondary = membership("2", 1, 3);
    expect(autoSelectDestinyMembership([secondary, primary])).toEqual(primary);
  });

  it("selects nothing when a membership is outside cross save", () => {
    const memberships = [membership("1", 3, 3), membership("2", 1, 0)];
    expect(autoSelectDestinyMembership(memberships)).toBeUndefined();
    expect(getSelectedDestinyMembership()).toBeUndefined();
  });
});

describe("getSelectedDestinyMembership", () => {
  it("auto selects from stored memberships when none is selected", () => {
    const only = membership("1", 3, 0);
    storeDestinyMemberships([only]);
    expect(hasDestinyMemberships()).toBe(true);
    expect(getSelectedDestinyMembership()).toEqual(only);
  });

  it("returns undefined for unparseable stored memberships", () => {
    localStorage.setItem("destinyMemberships", "{");
    expect(hasDestinyMemberships()).toBe(false);
  });
});
