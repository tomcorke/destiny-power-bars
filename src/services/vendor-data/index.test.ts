import { describe, expect, it } from "vitest";

import { ManifestData } from "../bungie-api";

import {
  joinSalesToDefinitionsAndInstances,
  substituteStringVariables,
} from ".";

describe("substituteStringVariables", () => {
  const stringVariables = {
    characterStringVariables: {
      char1: { integerValuesByHash: { 1: 10 } },
    },
    profileStringVariables: { integerValuesByHash: { 1: 99, 2: 20 } },
  };

  it("prefers character values over profile values", () => {
    expect(
      substituteStringVariables(
        "Rank {var:1} / {var:2}",
        stringVariables,
        "char1"
      )
    ).toBe("Rank 10 / 20");
  });

  it("falls back to profile values for other characters", () => {
    expect(
      substituteStringVariables("Rank {var:1}", stringVariables, "char2")
    ).toBe("Rank 99");
  });

  it("leaves unknown variables in place", () => {
    expect(substituteStringVariables("{var:3}", undefined, "char1")).toBe(
      "{var:3}"
    );
  });
});

describe("joinSalesToDefinitionsAndInstances", () => {
  const manifest = {
    DestinyInventoryItemDefinition: {
      100: { inventory: { bucketTypeHash: 0 } },
    },
  } as unknown as ManifestData;

  it("joins sales with definitions and computes power", () => {
    const [sale] = joinSalesToDefinitionsAndInstances(
      manifest,
      { a: { itemHash: 100 } as never },
      { a: { itemLevel: 195, quality: 3 } as never }
    );
    expect(sale?.power).toBe(1953);
    expect(sale?.itemDef).toBe(manifest.DestinyInventoryItemDefinition[100]);
  });

  it("drops sales without a definition or instance", () => {
    expect(
      joinSalesToDefinitionsAndInstances(
        manifest,
        { a: { itemHash: 404 } as never, b: { itemHash: 100 } as never },
        {}
      )
    ).toEqual([]);
  });
});
