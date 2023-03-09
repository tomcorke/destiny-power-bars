import {
  getManifest as apiGetManifest,
  GetManifestResult,
} from "../bungie-api";

export const getManifest = async () => {
  let manifestResult: GetManifestResult | undefined;
  try {
    manifestResult = await apiGetManifest();

    if (!manifestResult || !manifestResult.manifest) {
      return;
    }

    const { manifest } = manifestResult;
    return manifest;
  } catch (e) {
    console.error(e);
    return;
  }
};
