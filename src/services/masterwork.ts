import { SelectedJoinedItemDefinition } from "../types";

// From destiny-api-ts ItemState.Masterwork
const ITEM_STATE_MASTERWORK = 4;

export const isMasterwork = (item: SelectedJoinedItemDefinition) => {
  // tslint:disable-next-line:no-bitwise
  if (item.state && item.state & ITEM_STATE_MASTERWORK) {
    return true;
  }

  return false;
};
