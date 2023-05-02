export const BUNGIE_OAUTH_AUTHORIZE_URL =
  "https://www.bungie.net/en/OAuth/Authorize";
export const BUNGIE_OAUTH_TOKEN_URL =
  "https://www.bungie.net/platform/app/oauth/token/";

const {
  VITE_BUNGIE_API_KEY,
  VITE_BUNGIE_OAUTH_CLIENT_ID,
  VITE_BUNGIE_OAUTH_CLIENT_SECRET,
} = import.meta.env;

console.log(import.meta.env);

if (
  import.meta.env &&
  (!VITE_BUNGIE_API_KEY ||
    !VITE_BUNGIE_OAUTH_CLIENT_ID ||
    !VITE_BUNGIE_OAUTH_CLIENT_SECRET)
) {
  throw Error("React env vars must be provided");
}

export const BUNGIE_API_KEY = VITE_BUNGIE_API_KEY || "";
export const BUNGIE_OAUTH_CLIENT_ID = VITE_BUNGIE_OAUTH_CLIENT_ID || "";
export const BUNGIE_OAUTH_CLIENT_SECRET = VITE_BUNGIE_OAUTH_CLIENT_SECRET || "";
