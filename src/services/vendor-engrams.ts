const VENDOR_ENGRAMS_API_ENDPOINT =
  "https://api.vendorengrams.xyz/getVendorDrops";

export interface VendorEngramsVendorData {
  vendorID: string;
  display: string;
  drop: string;
  shorthand: string;
  interval: string;
  nextRefresh: string;
}

export interface VendorEngramsData {
  data: VendorEngramsVendorData[];
  updateTimestamp: number;
}

export const VENDOR_ENGRAMS_DROP_NO_DATA = "0";
export const VENDOR_ENGRAMS_DROP_LOW = "1";
export const VENDOR_ENGRAMS_DROP_HIGH = "2";

const VENDOR_DISPLAY_NAMES: { [shorthand: string]: string } = {
  devrim: "Devrim Kay (EDZ)",
  sloane: "Sloane (Titan)",
  failsafe: "Failsafe (Nessus)",
  asher: "Asher Mir (Io)",
  zavala: "Zavala (Vanguard, Tower)",
  shaxx: "Shaxx (Crucible, Tower)",
  banshee: "Banshee-44 (Gunsmith, Tower)",
  // benedict: "Benedict",
  // saladin: "Lord Saladin (Iron Banner, Tower)",
  fanboy: "Brother Vance (Mercury)",
  bray: "Ana Bray (Mars)",
  werner: "Werner 99-40 (Tower, Nessus Barge)"
};
export const getVendorDisplayName = (shorthand: string) => {
  return VENDOR_DISPLAY_NAMES[shorthand] || shorthand;
};

let vendorEngramsData: VendorEngramsData | undefined;
let vendorEngramsRefreshTimer: number | NodeJS.Timeout | undefined;
let vendorEngramsRefreshPromise: Promise<VendorEngramsData> | undefined;

const VENDOR_ENGRAMS_REFRESH_DELAY = 5 * 60 * 1000;

const refreshVendorEngramsData = async () => {
  const response = await fetch(VENDOR_ENGRAMS_API_ENDPOINT);
  const jsonData = (await response.json()) as VendorEngramsVendorData[];
  const updateTimestamp = Date.now();
  const data = { data: jsonData, updateTimestamp };
  vendorEngramsData = data;
  return data;
};

export const getVendorEngramsData = async () => {
  if (vendorEngramsData) {
    return vendorEngramsData;
  }
  if (!vendorEngramsRefreshPromise) {
    vendorEngramsRefreshPromise = refreshVendorEngramsData();
  }
  if (!vendorEngramsRefreshTimer) {
    vendorEngramsRefreshTimer = setInterval(() => {
      refreshVendorEngramsData().catch(e =>
        console.warn("Error refreshing vendorengrams.xyz data", e)
      );
    }, VENDOR_ENGRAMS_REFRESH_DELAY);
  }
  return vendorEngramsRefreshPromise;
};
