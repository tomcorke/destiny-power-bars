import { getMembershipDataById } from 'bungie-api-ts/user'
import { bungieAuthedFetch } from './bungie-api';

const isDev = process.env.NODE_ENV === 'development'
export const BUNGIE_API_KEY = isDev ? 'f7f184669f044a89b560fc5f71ed5d60' : 'd94be1e34632448fafdaf77c7afbb501'
const BUNGIE_OAUTH_AUTHORIZE_URL = 'https://www.bungie.net/en/OAuth/Authorize'
const BUNGIE_OAUTH_CLIENT_ID = isDev ? '26087' : '27213'
const BUNGIE_OAUTH_TOKEN_URL = 'https://www.bungie.net/platform/app/oauth/token/'

export const ACCESS_TOKEN_STORAGE_KEY = 'bungieAccessToken'
export const ACCESS_TOKEN_EXPIRY_STORAGE_KEY = 'bungieAccessTokenExpiryTime'
export const BUNGIE_MEMBERSHIP_ID_STORAGE_KEY = 'bungieMembershipId'
export const DESTINY_MEMBERSHIP_ID_STORAGE_KEY = 'destinyMembershipId'

const clearStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY);
  localStorage.removeItem(BUNGIE_MEMBERSHIP_ID_STORAGE_KEY);
  localStorage.removeItem(DESTINY_MEMBERSHIP_ID_STORAGE_KEY);
}

const getAuthUrl = () => `${BUNGIE_OAUTH_AUTHORIZE_URL}?response_type=code&client_id=${BUNGIE_OAUTH_CLIENT_ID}`

const redirectToAuth = () => {
  console.log('Redirect to auth')
  clearStorage()
  window.location.replace(getAuthUrl())
}

const handleTokenResponse = async (tokenResponse: Response, redirect: boolean = false) => {
  console.log('handleTokenResponse')
  clearStorage()
  if (tokenResponse.status === 200) {
    const data = await tokenResponse.json()
    console.log(data)
    const accessToken = data.access_token as string
    const tokenDuration = data.expires_in as number
    const expiryTime = Date.now() + (tokenDuration * 1000)
    const bungieMembershipId = data.membership_id as string

    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
    localStorage.setItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY, expiryTime.toString())
    localStorage.setItem(BUNGIE_MEMBERSHIP_ID_STORAGE_KEY, bungieMembershipId)

    const destinyMemberships = await getMembershipDataById(bungieAuthedFetch, { membershipId: bungieMembershipId, membershipType: 254 })
    const destinyMembershipId = destinyMemberships.Response.destinyMemberships[0].membershipId
    localStorage.setItem(DESTINY_MEMBERSHIP_ID_STORAGE_KEY, destinyMembershipId)

    return { accessToken, membershipId: destinyMembershipId }
  } else {
    //return redirectToAuth()
  }
}

const fetchAuthToken = async (authCode: string) => {
  console.log('fetchAuthToken', authCode)
  clearStorage()
  const tokenResponse = await fetch(BUNGIE_OAUTH_TOKEN_URL, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    redirect: 'follow',
    referrer: 'no-referrer',
    body: `grant_type=authorization_code&code=${authCode}&client_id=${BUNGIE_OAUTH_CLIENT_ID}`
  })
  return await handleTokenResponse(tokenResponse)
}

export const hasValidAuth = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  const accessTokenExpiryTime = parseInt(localStorage.getItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY) || '-1', 10)
  const bungieMembershipId = localStorage.getItem(BUNGIE_MEMBERSHIP_ID_STORAGE_KEY)
  const destinyMembershipId = localStorage.getItem(DESTINY_MEMBERSHIP_ID_STORAGE_KEY)
  if (!accessToken || Date.now() >= accessTokenExpiryTime || !bungieMembershipId || !destinyMembershipId) return false
  return true
}

export const auth = async () => {
  const codeRegex = /code=([a-f0-9]+)/
  const codeInQuery = codeRegex.exec(window.location.search)
  let authCode = codeInQuery && codeInQuery[1]

  if (authCode && !hasValidAuth()) {
    console.log('Fetching access token with auth code')
    await fetchAuthToken(authCode)
  }

  if (authCode) {
    window.location.search = ''
  }

  if (!hasValidAuth()) {
    console.log('Redirecting to fresh authentication for missing or expired access token')
    clearStorage()
    return redirectToAuth()
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) as string
  const membershipId = localStorage.getItem(DESTINY_MEMBERSHIP_ID_STORAGE_KEY) as string

  return { accessToken, membershipId }
}