import { getMembershipDataById, UserInfoCard } from "bungie-api-ts/user";
import { stringify } from "simple-query-string";

import { bungieAuthedFetch } from "./bungie-api";
import {
  BUNGIE_OAUTH_AUTHORIZE_URL,
  BUNGIE_OAUTH_CLIENT_ID,
  BUNGIE_OAUTH_CLIENT_SECRET,
  BUNGIE_OAUTH_TOKEN_URL,
} from "./config";
import { debug } from "./debug";
import eventEmitter, { EVENTS } from "./events";
import ga from "./ga";

const ACCESS_TOKEN_STORAGE_KEY = "bungieAccessToken";
const ACCESS_TOKEN_EXPIRY_STORAGE_KEY = "bungieAccessTokenExpiryTime";
const REFRESH_TOKEN_STORAGE_KEY = "bungieRefreshToken";
const REFRESH_TOKEN_EXPIRY_STORAGE_KEY = "bungieRefreshTokenExpiryTime";
const BUNGIE_MEMBERSHIP_ID_STORAGE_KEY = "bungieMembershipId";
const DESTINY_MEMBERSHIPS_STORAGE_KEY = "destinyMemberships";
const DESTINY_MEMBERSHIP_STORAGE_KEY = "destinyMembership";
const MANUAL_AUTHED_STORAGE_KEY = "manualAuthed";

eventEmitter.on(EVENTS.UNAUTHED_FETCH_ERROR, () => {
  // If we get 401 from an "authenticated" request, assume the access token is invalid
  debug("Clearing invalid access token");
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
});

const clearStorage = () => {
  debug("clearStorage");
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_EXPIRY_STORAGE_KEY);
  localStorage.removeItem(BUNGIE_MEMBERSHIP_ID_STORAGE_KEY);
  localStorage.removeItem(DESTINY_MEMBERSHIPS_STORAGE_KEY);
};

const clearSelectedMembership = () => {
  debug("clearSelectedMembership");
  localStorage.removeItem(DESTINY_MEMBERSHIP_STORAGE_KEY);
};

export const hasManuallyAuthed = () => {
  return !!localStorage.getItem(MANUAL_AUTHED_STORAGE_KEY);
};

export const getAuthUrl = () =>
  `${BUNGIE_OAUTH_AUTHORIZE_URL}?${stringify({
    response_type: "code",
    client_id: BUNGIE_OAUTH_CLIENT_ID,
    client_secret: BUNGIE_OAUTH_CLIENT_SECRET,
  })}`;

// Attempt to prevent infinite navigation events
let hasNavigated = false;
const redirectToAuth = () => {
  debug("redirectToAuth");
  clearStorage();
  ga.event({
    category: "Auth",
    action: "Redirect for Bungie authentication",
    nonInteraction: true,
  });
  try {
    if (!hasNavigated) {
      window.location.assign(getAuthUrl());
    } else {
      debug("Prevented re-navigation");
      throw Error("Re-navigation attempt");
    }
    hasNavigated = true;
  } catch (e) {
    console.error(e);
  }
};

export const manualStartAuth = () => {
  debug("manualStartAuth");
  localStorage.setItem(MANUAL_AUTHED_STORAGE_KEY, "TRUE");
  redirectToAuth();
};

const autoSelectDestinyMembership = (destinyMemberships: UserInfoCard[]) => {
  debug("autoSelectMembership");
  // If there is only one membership, select it automatically
  if (destinyMemberships.length === 1) {
    setSelectedDestinyMembership(destinyMemberships[0]);
    return destinyMemberships[0];
  }

  const crossSavePrimaryMemberships = destinyMemberships.filter(
    (m) => m.crossSaveOverride === m.membershipType
  );
  const nonCrossSaveMemberships = destinyMemberships.filter(
    (m) => m.crossSaveOverride === 0
  );
  if (
    crossSavePrimaryMemberships.length === 1 &&
    nonCrossSaveMemberships.length === 0
  ) {
    setSelectedDestinyMembership(crossSavePrimaryMemberships[0]);
    return crossSavePrimaryMemberships[0];
  }
};

const handleTokenResponse = async (tokenResponse: Response) => {
  debug("handleTokenResponse");
  if (tokenResponse.status === 200) {
    const data = await tokenResponse.json();

    const accessToken = data.access_token as string;
    const tokenDuration = data.expires_in as number;
    const expiryTime = Date.now() + tokenDuration * 1000;

    const refreshToken = data.refresh_token as string;
    const refreshTokenDuration = data.refresh_expires_in as number;
    const refreshExpiryTime = Date.now() + refreshTokenDuration * 1000;

    const bungieMembershipId = data.membership_id as string;

    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem(
      ACCESS_TOKEN_EXPIRY_STORAGE_KEY,
      expiryTime.toString()
    );
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    localStorage.setItem(
      REFRESH_TOKEN_EXPIRY_STORAGE_KEY,
      refreshExpiryTime.toString()
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
      ga.event({
        category: "Errors",
        action: `Destiny membership fetch error, status: ${destinyMembershipsResponse.ErrorStatus}`,
        nonInteraction: true,
      });
      return {
        authSuccess: false,
        error: `Status code ${destinyMembershipsResponse.ErrorStatus} from memberships endpoint`,
      };
    }

    const destinyMemberships =
      destinyMembershipsResponse.Response.destinyMemberships;
    localStorage.setItem(
      DESTINY_MEMBERSHIPS_STORAGE_KEY,
      JSON.stringify(destinyMemberships)
    );

    // If has stored membership and the membership ID is not in the new list
    // of memberships then clear it
    const selectedMembership = getSelectedDestinyMembership();
    if (
      selectedMembership &&
      !destinyMemberships.some(
        (m) => m.membershipId === selectedMembership.membershipId
      )
    ) {
      clearSelectedMembership();
    }

    autoSelectDestinyMembership(destinyMemberships);

    return { accessToken, authSuccess: true };
  } else {
    if (tokenResponse.status !== 200) {
      ga.event({
        category: "Auth",
        action: `Status code ${tokenResponse.status} from authentication request`,
        nonInteraction: true,
      });
      return {
        authSuccess: false,
        error: `Status code ${tokenResponse.status} from authentication request`,
      };
    }
  }
};

const fetchAccessToken = async (authCode: string) => {
  debug("fetchAccessToken");
  debug("Fetching Bungie API access token for authentication code");
  ga.event({
    category: "Auth",
    action: "Oauth token request",
    nonInteraction: true,
  });
  const tokenResponse = await fetch(BUNGIE_OAUTH_TOKEN_URL, {
    body: stringify({
      grant_type: "authorization_code",
      code: authCode,
      client_id: BUNGIE_OAUTH_CLIENT_ID,
      client_secret: BUNGIE_OAUTH_CLIENT_SECRET,
    }),
    cache: "no-cache",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
    redirect: "follow",
    referrer: "no-referrer",
  });
  return await handleTokenResponse(tokenResponse);
};

const refreshAccessToken = async () => {
  debug("refreshAccessToken");
  debug("Refreshing Bungie API access token");
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  ga.event({
    category: "Auth",
    action: "Oauth token refresh",
    nonInteraction: true,
  });
  const tokenResponse = await fetch(BUNGIE_OAUTH_TOKEN_URL, {
    body: stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: BUNGIE_OAUTH_CLIENT_ID,
      client_secret: BUNGIE_OAUTH_CLIENT_SECRET,
    }),
    cache: "no-cache",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
    redirect: "follow",
    referrer: "no-referrer",
  });
  const handleResult = await handleTokenResponse(tokenResponse);
  if (!handleResult || !handleResult.authSuccess) {
    // If refreshing failed, clear all auth details so we don't attempt repeated refreshes
    clearStorage();
  }
  return handleResult;
};

export const getAccessToken = () => {
  debug("getAccessToken");
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

const hasValidAccessToken = () => {
  const accessToken = getAccessToken();
  const accessTokenExpiryTime = parseInt(
    localStorage.getItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY) || "-1",
    10
  );

  return accessToken && accessTokenExpiryTime > Date.now();
};

const hasValidRefreshToken = () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  const refreshTokenExpiryTime = parseInt(
    localStorage.getItem(REFRESH_TOKEN_EXPIRY_STORAGE_KEY) || "-1",
    10
  );

  return refreshToken && refreshTokenExpiryTime > Date.now();
};

export const hasValidAuth = () => {
  const accessTokenIsValid = hasValidAccessToken();

  const bungieMembershipId = localStorage.getItem(
    BUNGIE_MEMBERSHIP_ID_STORAGE_KEY
  );
  const destinyMemberships = getDestinyMemberships();
  if (!accessTokenIsValid || !bungieMembershipId || !destinyMemberships) {
    return false;
  }
  return true;
};

export const getDestinyMemberships = () => {
  debug("getDestinyMemberships");
  const destinyMembershipsString = localStorage.getItem(
    DESTINY_MEMBERSHIPS_STORAGE_KEY
  );
  try {
    if (destinyMembershipsString) {
      return JSON.parse(destinyMembershipsString) as UserInfoCard[];
    }
  } catch (e) {
    ga.event({
      category: "Data",
      action: "Error loading destiny memberships from local storage",
      nonInteraction: true,
    });
    console.error(`Error loading destiny memberships`, e.message);
  }
  return undefined;
};

export const hasDestinyMemberships = () => {
  return !!getDestinyMemberships();
};

export const getSelectedDestinyMembership = () => {
  debug("getSelectedDestinyMembership");
  const destinyMembershipString = localStorage.getItem(
    DESTINY_MEMBERSHIP_STORAGE_KEY
  );
  try {
    if (destinyMembershipString) {
      return JSON.parse(destinyMembershipString) as UserInfoCard;
    }
    const memberships = getDestinyMemberships();
    if (memberships) {
      const autoSelectedMembership = autoSelectDestinyMembership(memberships);
      return autoSelectedMembership;
    }
  } catch (e) {
    ga.event({
      category: "Data",
      action: "Error loading destiny membership from local storage",
      nonInteraction: true,
    });
    console.error("Error loading destiny membership", e.message);
  }
  return undefined;
};

export const hasSelectedDestinyMembership = () => {
  return !!getSelectedDestinyMembership();
};

export const setSelectedDestinyMembership = (membership: UserInfoCard) => {
  debug("setSelectedDestinyMembership");
  localStorage.setItem(
    DESTINY_MEMBERSHIP_STORAGE_KEY,
    JSON.stringify(membership)
  );
};

export const auth = async (): Promise<boolean> => {
  debug("auth");
  const queryParams = new URLSearchParams(window.location.search);
  const authCode = queryParams.get("code");

  if (authCode && !hasValidAuth()) {
    debug("Fetching access token with auth code");
    const authResponse = await fetchAccessToken(authCode);
    if (authResponse && authResponse?.authSuccess === false) {
      console.error(authResponse.error);
      return false;
    }
  }

  if (authCode) {
    window.history.replaceState(
      {},
      document.title,
      `${window.location.origin}${window.location.pathname}`
    );
  }

  if (hasValidAuth() && hasDestinyMemberships()) {
    return true;
  }

  const isAccessTokenValid = hasValidAccessToken();
  const isRefreshTokenValid = hasValidRefreshToken();

  if (!isAccessTokenValid && isRefreshTokenValid) {
    await refreshAccessToken();
    return auth();
  }

  if (hasManuallyAuthed()) {
    debug(
      "Redirecting to fresh authentication for missing or expired access token, or missing destiny memberships"
    );
    redirectToAuth();
  }

  return false;
};

export const logOut = async () => {
  debug("logOut");
  localStorage.removeItem(MANUAL_AUTHED_STORAGE_KEY);
  clearStorage();
  eventEmitter.emit(EVENTS.LOG_OUT);
};
