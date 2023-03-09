import { JoinedItemDefinition } from "./joined-item";

export const getItemScore = (
  item: JoinedItemDefinition,
  priorityItemIds: string[]
) => {
  let score = item.power;

  if (!score) {
    return 0;
  }

  if (!item.redacted) {
    // Add score for other things to prefer non-redacted items
    if (priorityItemIds.some((pi) => pi === item.itemInstanceId)) {
      // Prefer items currently equipped on character over items of equal level elsewhere
      score += 0.5;
    }
    if (item.isMasterwork) {
      score += 0.25;
    }
    if (item.location === 1) {
      // In inventory
      score += 0.125;
    }
  }

  return score;
};
