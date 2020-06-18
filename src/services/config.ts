export const BUNGIE_OAUTH_AUTHORIZE_URL =
  "https://www.bungie.net/en/OAuth/Authorize";
export const BUNGIE_OAUTH_TOKEN_URL =
  "https://www.bungie.net/platform/app/oauth/token/";

const {
  REACT_APP_BUNGIE_API_KEY,
  REACT_APP_BUNGIE_OAUTH_CLIENT_ID,
  REACT_APP_BUNGIE_OAUTH_CLIENT_SECRET,
} = process.env;

if (
  !REACT_APP_BUNGIE_API_KEY ||
  !REACT_APP_BUNGIE_OAUTH_CLIENT_ID ||
  !REACT_APP_BUNGIE_OAUTH_CLIENT_SECRET
) {
  throw Error("React env vars must be provided");
}

export const BUNGIE_API_KEY = REACT_APP_BUNGIE_API_KEY;
export const BUNGIE_OAUTH_CLIENT_ID = REACT_APP_BUNGIE_OAUTH_CLIENT_ID;
export const BUNGIE_OAUTH_CLIENT_SECRET = REACT_APP_BUNGIE_OAUTH_CLIENT_SECRET;
