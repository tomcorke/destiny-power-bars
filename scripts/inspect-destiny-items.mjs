import { readFile } from "node:fs/promises";
const API_ROOT = "https://www.bungie.net/Platform";
const USER_AGENT = "destiny-power-bars-manifest-inspector";
const ITEM_SLOTS = new Map([
  [1498876634, "kinetic"],
  [2465295065, "energy"],
  [953998645, "power"],
  [3448274439, "head"],
  [3551918588, "gloves"],
  [14239492, "chest"],
  [20886954, "legs"],
  [1585787867, "classItem"],
]);
const ARMOR_STATS = new Set([
  2996146975, // Mobility
  392767087, // Resilience
  1943323491, // Recovery
  1735777505, // Discipline
  144602215, // Intellect
  4244567218, // Strength
]);

const readApiKey = async () => {
  if (process.env.BUNGIE_API_KEY) return process.env.BUNGIE_API_KEY;
  const env = await readFile(
    new URL("../.env.development", import.meta.url),
    "utf8"
  );
  const value = env.match(/^VITE_BUNGIE_API_KEY=(.*)$/m)?.[1]?.trim();
  if (!value)
    throw new Error("Set BUNGIE_API_KEY or add it to .env.development.");
  return value.replace(/^['"]|['"]$/g, "");
};

const bungieFetch = async (path, apiKey, token) => {
  const response = await fetch(`${API_ROOT}${path}`, {
    headers: {
      "X-API-Key": apiKey,
      Authorization: `Bearer ${token}`,
      "User-Agent": USER_AGENT,
    },
  });
  const body = await response.json();
  if (!response.ok || body.ErrorCode !== 1) {
    throw new Error(
      `Bungie request failed: ${body.ErrorStatus || response.status}`
    );
  }
  return body.Response;
};

const getContent = async (path) => {
  const response = await fetch(`https://www.bungie.net${path}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok)
    throw new Error(`Manifest download failed: ${response.status}`);
  return response.json();
};

const profile = (membershipType, membershipId, components, apiKey, token) =>
  bungieFetch(
    `/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components.join(",")}`,
    apiKey,
    token
  );

const getItemEntries = (profileData) => {
  const entries = new Map();
  for (const [characterId, inventory] of Object.entries(
    profileData.characterInventories?.data ?? {}
  )) {
    for (const item of inventory.items ?? [])
      entries.set(item.itemInstanceId, { ...item, characterId });
  }
  for (const [characterId, inventory] of Object.entries(
    profileData.characterEquipment?.data ?? {}
  )) {
    for (const item of inventory.items ?? [])
      entries.set(item.itemInstanceId, { ...item, characterId });
  }
  for (const item of profileData.profileInventory?.data?.items ?? []) {
    entries.set(item.itemInstanceId, item);
  }
  return [...entries.values()].filter((item) => item.itemInstanceId);
};

const makeItemSummary = (item, data, itemDefinitions, objectiveDefinitions) => {
  const id = item.itemInstanceId;
  const instance = data.itemComponents?.instances?.data?.[id];
  const definition = itemDefinitions[item.itemHash];
  if (!instance || !definition) return undefined;

  const sockets = data.itemComponents?.sockets?.data?.[id]?.sockets ?? [];
  const objectives =
    data.itemComponents?.objectives?.data?.[id]?.objectives ?? [];
  const plugDefinitions = sockets
    .map((socket) => itemDefinitions[socket.plugHash])
    .filter(Boolean);
  const enhancedTraitCount = plugDefinitions.filter(
    (plug) =>
      plug.plug?.plugCategoryHash === 7906839 && plug.inventory?.tierType === 3
  ).length;
  const stats = data.itemComponents?.stats?.data?.[id]?.stats ?? {};
  const armorStatTotal = Object.entries(stats).reduce(
    (sum, [hash, stat]) =>
      sum + (ARMOR_STATS.has(Number(hash)) ? stat.value : 0),
    0
  );
  const objectiveProgress = objectives
    .map(({ objectiveHash, progress, completionValue, complete }) => {
      const objective = objectiveDefinitions[objectiveHash];
      return {
        name: objective?.displayProperties?.name,
        progress,
        completionValue,
        complete,
      };
    })
    .filter((objective) => objective.name);

  return {
    name: definition.displayProperties?.name,
    itemType: definition.itemTypeDisplayName,
    slot: ITEM_SLOTS.get(item.bucketHash),
    gearTier: instance.gearTier,
    power: instance.primaryStat?.value,
    itemLevel: instance.itemLevel,
    crafted: Boolean(item.state & 8),
    masterwork: Boolean(item.state & 4),
    enhancedTraitCount,
    armorEnergyCapacity: instance.energy?.energyCapacity,
    armorStatTotal:
      ITEM_SLOTS.has(item.bucketHash) &&
      ![1498876634, 2465295065, 953998645].includes(item.bucketHash)
        ? armorStatTotal
        : undefined,
    itemStatCount: Object.keys(stats).length,
    objectives: objectiveProgress,
  };
};

const main = async () => {
  const token = process.env.BUNGIE_ACCESS_TOKEN;
  if (!token) throw new Error("Set BUNGIE_ACCESS_TOKEN for this process.");
  const apiKey = await readApiKey();
  const membershipId = process.env.BUNGIE_MEMBERSHIP_ID;
  const membershipType = Number(process.env.BUNGIE_MEMBERSHIP_TYPE);
  if (!membershipId || !Number.isInteger(membershipType)) {
    throw new Error(
      "Set BUNGIE_MEMBERSHIP_ID and BUNGIE_MEMBERSHIP_TYPE for this process."
    );
  }

  const components = [200, 201, 205, 102, 300, 301, 304, 305, 309];
  const data = await profile(
    membershipType,
    membershipId,
    components,
    apiKey,
    token
  );
  const manifest = await bungieFetch("/Destiny2/Manifest/", apiKey, token);
  const paths = manifest.jsonWorldComponentContentPaths.en;
  const [itemDefinitions, objectiveDefinitions] = await Promise.all([
    getContent(paths.DestinyInventoryItemDefinition),
    getContent(paths.DestinyObjectiveDefinition),
  ]);

  const items = getItemEntries(data)
    .map((item) =>
      makeItemSummary(item, data, itemDefinitions, objectiveDefinitions)
    )
    .filter(Boolean);
  const byTier = Object.groupBy(items, (item) => item.gearTier ?? "unknown");
  const meaningfulObjectives = items.flatMap((item) =>
    item.objectives.map((objective) => ({ item: item.name, ...objective }))
  );
  const signals = {
    withPower: items.filter((item) => item.power !== undefined).length,
    withGearTier: items.filter((item) => item.gearTier !== undefined).length,
    crafted: items.filter((item) => item.crafted).length,
    masterwork: items.filter((item) => item.masterwork).length,
    withEnhancedTraits: items.filter((item) => item.enhancedTraitCount > 0)
      .length,
    withArmorEnergy: items.filter(
      (item) => item.armorEnergyCapacity !== undefined
    ).length,
    withItemStats: items.filter((item) => item.itemStatCount > 0).length,
    withObjectives: items.filter((item) => item.objectives.length > 0).length,
  };
  const progressionItems = items
    .filter(
      (item) =>
        item.gearTier > 0 ||
        item.crafted ||
        item.masterwork ||
        item.enhancedTraitCount ||
        item.armorEnergyCapacity !== undefined
    )
    .sort((a, b) => (b.gearTier ?? 0) - (a.gearTier ?? 0));
  const reportItems = process.argv.includes("--full")
    ? items
    : progressionItems.slice(0, 16);

  console.log(
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        manifestVersion: manifest.version,
        membershipType,
        profileMintedAt: data.responseMintedTimestamp,
        itemCount: items.length,
        signals,
        gearTierCounts: Object.fromEntries(
          Object.entries(byTier).map(([tier, values]) => [tier, values.length])
        ),
        items: reportItems,
        objectiveSamples: meaningfulObjectives.slice(0, 30),
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
