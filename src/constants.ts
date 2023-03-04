import {
  D2SeasonInfo,
  D2CalculatedSeason,
} from "./data/d2ai-module/d2-season-info";

export const ITEM_SLOT_KINETIC = "kinetic";
export const ITEM_SLOT_ENERGY = "energy";
export const ITEM_SLOT_POWER = "power";
export const ITEM_SLOT_HEAD = "head";
export const ITEM_SLOT_GLOVES = "gloves";
export const ITEM_SLOT_CHEST = "chest";
export const ITEM_SLOT_LEGS = "legs";
export const ITEM_SLOT_CLASS_ITEM = "classItem";

export const ITEM_SLOT_BUCKETS = {
  [ITEM_SLOT_KINETIC]: 1498876634,
  [ITEM_SLOT_ENERGY]: 2465295065,
  [ITEM_SLOT_POWER]: 953998645,
  [ITEM_SLOT_HEAD]: 3448274439,
  [ITEM_SLOT_GLOVES]: 3551918588,
  [ITEM_SLOT_CHEST]: 14239492,
  [ITEM_SLOT_LEGS]: 20886954,
  [ITEM_SLOT_CLASS_ITEM]: 1585787867,
};

export const ITEM_BUCKET_SLOTS = Object.entries(ITEM_SLOT_BUCKETS).reduce(
  (buckets, [slot, bucket]) => ({ ...buckets, [bucket]: slot }),
  {} as { [bucket: number]: string }
);

export const ITEM_SLOT_GROUP_WEAPONS = [
  ITEM_SLOT_KINETIC,
  ITEM_SLOT_ENERGY,
  ITEM_SLOT_POWER,
];
export const ITEM_SLOT_GROUP_ARMOR = [
  ITEM_SLOT_HEAD,
  ITEM_SLOT_GLOVES,
  ITEM_SLOT_CHEST,
  ITEM_SLOT_LEGS,
  ITEM_SLOT_CLASS_ITEM,
];

export const ORDERED_ITEM_SLOTS = [
  ...ITEM_SLOT_GROUP_WEAPONS,
  ...ITEM_SLOT_GROUP_ARMOR,
];

export const ITEM_TIER_TYPE_EXOTIC = 6;

export const ITEM_TYPE_ARMOR = 2;
export const ITEM_TYPE_WEAPON = 3;

export const CLASS_TYPE_ALL = 3;

export const CLASS_TITAN = "titan";
export const CLASS_HUNTER = "hunter";
export const CLASS_WARLOCK = "warlock";

export const CLASS_NAMES = [CLASS_TITAN, CLASS_HUNTER, CLASS_WARLOCK];

export const ITEM_TYPE_ARTIFACT = 28;
export const ARTIFACT_INVENTORY_BUCKET_HASH = 1506418338;

export const POWER_SYMBOL = "✧";
export const BUNGIE_POWER_COLOR = "#DDCB59";
export const BUNGIE_COLOUR_SOLAR = "ef621d";
export const BUNGIE_COLOUR_ARC = "7abce9";
export const BUNGIE_COLOUR_VOID = "b085df";

const season = D2SeasonInfo[D2CalculatedSeason];

export const ITEM_POWER_SOFT_CAP = season.softCap;
export const ITEM_POWER_POWERFUL_CAP = season.powerfulCap;
export const ITEM_POWER_PINNACLE_CAP = season.pinnacleCap;

export const LEGENDARY_STORY_ITEM_POWER = 1770;
export const LEGENDARY_ACTIVITY_MODIFIER_HASH = 36103086;
export const LEGENDARY_ACTIVITY_MODIFIER_ICON =
  "https://www.bungie.net/common/destiny2_content/icons/2aed4ad5b28d1cc13451aa6424ce5dda.png";

// How much above your current power do pinnacles drop when above the powerful cap
export const ITEM_POWER_PINNACLE_DROP_OFFSET_WEAK = 1;
export const ITEM_POWER_PINNACLE_DROP_OFFSET = 2;
