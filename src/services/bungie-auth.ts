import { getMembershipDataById, UserInfoCard } from "bungie-api-ts/user";
import { bungieAuthedFetch } from "./bungie-api";

const isDev = process.env.NODE_ENV === "development";
export const BUNGIE_API_KEY = isDev
  ? "f7f184669f044a89b560fc5f71ed5d60"
  : "d94be1e34632448fafdaf77c7afbb501";
const BUNGIE_OAUTH_AUTHORIZE_URL = "https://www.bungie.net/en/OAuth/Authorize";
const BUNGIE_OAUTH_CLIENT_ID = isDev ? "26087" : "27213";
const BUNGIE_OAUTH_TOKEN_URL =
  "https://www.bungie.net/platform/app/oauth/token/";

const ACCESS_TOKEN_STORAGE_KEY = "bungieAccessToken";
const ACCESS_TOKEN_EXPIRY_STORAGE_KEY = "bungieAccessTokenExpiryTime";
const BUNGIE_MEMBERSHIP_ID_STORAGE_KEY = "bungieMembershipId";
const DESTINY_MEMBERSHIPS_STORAGE_KEY = "destinyMemberships";
const DESTINY_MEMBERSHIP_STORAGE_KEY = "destinyMembership";

const clearStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY);
  localStorage.removeItem(BUNGIE_MEMBERSHIP_ID_STORAGE_KEY);
  localStorage.removeItem(DESTINY_MEMBERSHIPS_STORAGE_KEY);
  localStorage.removeItem(DESTINY_MEMBERSHIP_STORAGE_KEY);
};

const getAuthUrl = () =>
  `${BUNGIE_OAUTH_AUTHORIZE_URL}?response_type=code&client_id=${BUNGIE_OAUTH_CLIENT_ID}`;

const redirectToAuth = () => {
  console.log("Redirect to auth");
  clearStorage();
  window.location.replace(getAuthUrl());
};

const handleTokenResponse = async (
  tokenResponse: Response,
  redirect: boolean = false
) => {
  console.log("handleTokenResponse");
  clearStorage();
  if (tokenResponse.status === 200) {
    const data = await tokenResponse.json();
    const accessToken = data.access_token as string;
    const tokenDuration = data.expires_in as number;
    const expiryTime = Date.now() + tokenDuration * 1000;
    const bungieMembershipId = data.membership_id as string;

    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem(
      ACCESS_TOKEN_EXPIRY_STORAGE_KEY,
      expiryTime.toString()
    );
    localStorage.setItem(BUNGIE_MEMBERSHIP_ID_STORAGE_KEY, bungieMembershipId);

    // 254 = all memberships
    const destinyMembershipsResponse = await getMembershipDataById(
      bungieAuthedFetch,
      { membershipId: bungieMembershipId, membershipType: 254 }
    );

    if (
      !destinyMembershipsResponse ||
      !destinyMembershipsResponse.Response ||
      (destinyMembershipsResponse.ErrorStatus &&
        destinyMembershipsResponse.ErrorStatus !== "Success")
    ) {
      return {
        authSuccess: false,
        error: `Status code ${destinyMembershipsResponse.ErrorStatus} from memberships endpoint`
      };
    }

    const destinyMemberships =
      destinyMembershipsResponse.Response.destinyMemberships;
    localStorage.setItem(
      DESTINY_MEMBERSHIPS_STORAGE_KEY,
      JSON.stringify(destinyMemberships)
    );

    // If there is only one membership, select it automatically
    if (destinyMemberships.length === 1) {
      setSelectedDestinyMembership(destinyMemberships[0]);
    }

    return { accessToken, authSuccess: true };
  } else {
    if (tokenResponse.status !== 200) {
      return {
        authSuccess: false,
        error: `Status code ${tokenResponse.status} from authentication request`
      };
    }
    // return redirectToAuth()
  }
};

const fetchAuthToken = async (authCode: string) => {
  console.log("fetchAuthToken", authCode);
  clearStorage();
  const tokenResponse = await fetch(BUNGIE_OAUTH_TOKEN_URL, {
    body: `grant_type=authorization_code&code=${authCode}&client_id=${BUNGIE_OAUTH_CLIENT_ID}`,
    cache: "no-cache",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST",
    redirect: "follow",
    referrer: "no-referrer"
  });
  return await handleTokenResponse(tokenResponse);
};

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const hasValidAuth = () => {
  const accessToken = getAccessToken();
  const accessTokenExpiryTime = parseInt(
    localStorage.getItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY) || "-1",
    10
  );
  const bungieMembershipId = localStorage.getItem(
    BUNGIE_MEMBERSHIP_ID_STORAGE_KEY
  );
  if (
    !accessToken ||
    Date.now() >= accessTokenExpiryTime ||
    !bungieMembershipId
  ) {
    return false;
  }
  return true;
};

export const getDestinyMemberships = () => {
  const destinyMembershipsString = localStorage.getItem(
    DESTINY_MEMBERSHIPS_STORAGE_KEY
  );
  try {
    if (destinyMembershipsString) {
      return JSON.parse(destinyMembershipsString) as UserInfoCard[];
    }
  } catch (e) {
    console.error(`Error loading destiny memberships`, e.message);
  }
  return undefined;
};

export const hasDestinyMemberships = () => {
  return !!getDestinyMemberships();
};

export const getSelectedDestinyMembership = () => {
  const destinyMembershipString = localStorage.getItem(
    DESTINY_MEMBERSHIP_STORAGE_KEY
  );
  try {
    if (destinyMembershipString) {
      return JSON.parse(destinyMembershipString) as UserInfoCard;
    }
  } catch (e) {
    console.error("Error loading destiny membership", e.message);
  }
  return undefined;
};

export const hasSelectedDestinyMembership = () => {
  return !!getSelectedDestinyMembership();
};

export const setSelectedDestinyMembership = (membership: UserInfoCard) => {
  localStorage.setItem(
    DESTINY_MEMBERSHIP_STORAGE_KEY,
    JSON.stringify(membership)
  );
};

export const auth = async () => {
  const queryParams = new URLSearchParams(window.location.search);
  const authCode = queryParams.get("code");

  if (authCode && !hasValidAuth()) {
    console.log("Fetching access token with auth code");
    const authResponse = await fetchAuthToken(authCode);
    if (authResponse && authResponse.authSuccess === false) {
      console.error(authResponse.error);
      return false;
    }
  }

  if (authCode) {
    window.location.replace(
      `${window.location.origin}${window.location.pathname}`
    );
  }

  if (hasValidAuth() && hasDestinyMemberships()) {
    return true;
  }

  console.log(
    "Redirecting to fresh authentication for missing or expired access token, or missing destiny memberships"
  );
  clearStorage();
  redirectToAuth();
};
