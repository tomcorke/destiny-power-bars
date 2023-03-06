import { BungieMembershipType } from "bungie-api-ts/destiny2";
import { setItemLockState } from "./bungie-api";
import eventEmitter, { EVENTS } from "./events";

const lockedItemIds: string[] = [];

const LOCAL_STORAGE_ITEM_LOCKING_ENABLED = "itemLockingEnabled";
const LOCAL_STORAGE_LOCKED_ITEM_IDS = "lockedItemInstanceIds";

// Init lockedItemIds from local storage to prevent re-locking items between sessions
const storedLockedItemIds = localStorage.getItem(LOCAL_STORAGE_LOCKED_ITEM_IDS);
if (storedLockedItemIds) {
  try {
    // Prune the list on load, so we don't keep IDs that are very old and fill up local storage
    // 200 items should be enough to prevent re-locking of items which are relevant
    const latestIds = storedLockedItemIds.split(",").slice(-200);
    latestIds.forEach((id) => lockedItemIds.push(id));
  } catch (err) {
    console.warn(
      `Error while initialising already locked item instance IDs: ${err}`
    );
    // Something went wrong, the value is likely dodgy so we should clear it.
    localStorage.removeItem(LOCAL_STORAGE_LOCKED_ITEM_IDS);
  }
}

eventEmitter.on(EVENTS.ITEM_ALREADY_LOCKED, () => {
  // Add to local storage list
  localStorage.setItem(LOCAL_STORAGE_LOCKED_ITEM_IDS, lockedItemIds.join(","));
});

eventEmitter.on(EVENTS.ITEM_LOCKED, () => {
  // Add to local storage list
  localStorage.setItem(LOCAL_STORAGE_LOCKED_ITEM_IDS, lockedItemIds.join(","));
});

let itemLockingEnabled =
  localStorage.getItem(LOCAL_STORAGE_ITEM_LOCKING_ENABLED) === "TRUE";

export const setItemLockingEnabled = (value: boolean) => {
  itemLockingEnabled = value;
  localStorage.setItem(
    LOCAL_STORAGE_ITEM_LOCKING_ENABLED,
    value ? "TRUE" : "FALSE"
  );
};

(window as any).enableItemLocking = () => setItemLockingEnabled(true);
(window as any).disableItemLocking = () => setItemLockingEnabled(false);

export const lockItems = async (
  character: { characterId: string; membershipType: BungieMembershipType },
  items: {
    itemInstanceId?: string;
    state?: number;
    itemDefinition?: { displayProperties?: { name?: string; icon?: string } };
    instanceData?: { primaryStat?: { value: number } };
  }[]
) => {
  if (!itemLockingEnabled) {
    return;
  }

  for (const item of items) {
    const itemInstanceId = item.itemInstanceId;
    const name = item.itemDefinition?.displayProperties?.name;
    const state = item.state;
    const power = item.instanceData?.primaryStat?.value;

    if (!itemInstanceId || !name || state === undefined) {
      continue;
    }
    if (lockedItemIds.includes(itemInstanceId)) {
      continue;
    }

    const characterId = "characterId" in item ? item.characterId : undefined;
    if (characterId && characterId !== character.characterId) {
      // console.log(
      //   `Not locking item ${itemInstanceId}: ${name} for character ID ${character.characterId} because item is associated with inventory of character ID ${characterId}`
      // );
      continue;
    }

    const payload = {
      state: true,
      itemId: itemInstanceId,
      characterId: character.characterId,
      membershipType: character.membershipType,
    };

    // Add to list early to prevent multiple attempts on the same item
    lockedItemIds.push(itemInstanceId);

    const isLocked = (state && state & 1) === 1;
    if (isLocked) {
      // console.log(`Item ${itemInstanceId}: ${name} is already locked`);
      eventEmitter.emit(EVENTS.ITEM_ALREADY_LOCKED, {
        itemInstanceId,
      });
      continue;
    }
    console.log(`Attempting to lock item ${itemInstanceId}: ${name}`);

    setItemLockState(payload)
      .then(() => {
        console.log(`Locked item ${itemInstanceId}: ${name}`);

        eventEmitter.emit(EVENTS.ITEM_LOCKED, {
          itemInstanceId,
          name,
          icon: item.itemDefinition?.displayProperties?.icon,
          power,
        });
      })
      .catch((err) => {
        const index = lockedItemIds.indexOf(itemInstanceId);
        lockedItemIds.splice(index, 1);
        console.error(err);
      });
  }
};
