import { ACCOUNT_WIDE_CHARACTER_ID } from "../../../constants";
import { createCharacterDataProcessor } from "./helpers";

export default createCharacterDataProcessor(
  ({ manifest, character, records }) => {
    if (character.characterId === ACCOUNT_WIDE_CHARACTER_ID) {
      return { title: { name: "Maximum power", gildedCount: 1 } };
    }

    const definition =
      manifest.DestinyRecordDefinition[character.titleRecordHash || ""];

    const name =
      definition?.titleInfo?.titlesByGenderHash[character.genderHash];

    const gildingHash = definition?.titleInfo?.gildingTrackingRecordHash;
    // const gildingDefinition =
    //   (gildingHash && manifest.DestinyRecordDefinition[gildingHash]) || undefined;
    const gildingRecord =
      gildingHash && records && records!.records[gildingHash];
    const gildedCount = (gildingRecord && gildingRecord.completedCount) || 0;

    return { title: { name, gildedCount } };
  }
);
