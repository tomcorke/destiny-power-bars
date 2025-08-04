import { ARTIFACT_INVENTORY_BUCKET_HASH } from "../../../constants";
import { SeasonalArtifactData } from "../../../types";

import { createGlobalDataProcessor } from "./helpers";

export default createGlobalDataProcessor(
  ({
    allCharacterItems,
    itemInstances,
    profileProgression,
    manifest,
  }): { artifact: SeasonalArtifactData | undefined } => {
    const artifactItemComponent = allCharacterItems.find(
      (i) => i.bucketHash === ARTIFACT_INVENTORY_BUCKET_HASH
    );

    const artifactInstance =
      artifactItemComponent?.itemInstanceId &&
      itemInstances[artifactItemComponent.itemInstanceId];

    // if (
    //   artifactItemComponent &&
    //   profileProgression.seasonalArtifact &&
    //   artifactInstance
    // ) {
    //   const artifactDefinition =
    //     manifest.DestinyInventoryItemDefinition[
    //       artifactItemComponent.itemHash
    //     ]!;

    //   const artifactData = {
    //     bonusPower:
    //       profileProgression.seasonalArtifact.powerBonus ||
    //       artifactInstance.primaryStat.value,
    //     iconPath: artifactDefinition.displayProperties?.icon,
    //     name: artifactDefinition.displayProperties?.name || "Artifact",
    //     progressToNextLevel:
    //       profileProgression.seasonalArtifact?.powerBonusProgression
    //         ?.progressToNextLevel,
    //     nextLevelAt:
    //       profileProgression.seasonalArtifact?.powerBonusProgression
    //         ?.nextLevelAt,
    //   };

    //   return { artifact: artifactData };
    // }

    return { artifact: undefined };
  }
);
