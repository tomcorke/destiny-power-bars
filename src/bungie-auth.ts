export const BUNGIE_API_KEY = 'f7f184669f044a89b560fc5f71ed5d60'
const BUNGIE_OAUTH_AUTHORIZE_URL = 'https://www.bungie.net/en/OAuth/Authorize'
const BUNGIE_OAUTH_CLIENT_ID = '26087'
const BUNGIE_OAUTH_TOKEN_URL = 'https://www.bungie.net/platform/app/oauth/token/'

export const ACCESS_TOKEN_STORAGE_KEY = 'bungieAccessToken'
export const ACCESS_TOKEN_EXPIRY_STORAGE_KEY = 'bungieAccessTokenExpiryTime'

const clearTokenStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY);
}

const getAuthUrl = () => `${BUNGIE_OAUTH_AUTHORIZE_URL}?response_type=code&client_id=${BUNGIE_OAUTH_CLIENT_ID}`

const redirectToAuth = () => {
  console.log('Redirect to auth')
  clearTokenStorage()
  window.location.replace(getAuthUrl())
}

const handleTokenResponse = async (tokenResponse: Response, redirect: boolean = false) => {
  console.log('handleTokenResponse')
  clearTokenStorage()
  if (tokenResponse.status === 200) {
    const data = await tokenResponse.json()
    console.log(data)
    const accessToken = data.access_token as string
    const tokenDuration = data.expires_in as number
    const expiryTime = Date.now() + (tokenDuration * 1000)
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
    localStorage.setItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY, expiryTime.toString())
    return { accessToken, expiryTime }
  } else {
    //return redirectToAuth()
  }
}

const fetchAuthToken = async (authCode: string) => {
  console.log('fetchAuthToken', authCode)
  clearTokenStorage()
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
  if (!accessToken || Date.now() >= accessTokenExpiryTime) return false
  return true
}

export const auth = async () => {
  const codeRegex = /code=([a-f0-9]+)/
  const codeInQuery = codeRegex.exec(window.location.search)
  let authCode = codeInQuery && codeInQuery[1]

  if (authCode && !hasValidAuth()) {
    console.log('Fetching access token with auth code')
    await fetchAuthToken(authCode)
    window.location.search = ''
  }

  if (!hasValidAuth()) {
    console.log('Redirecting to fresh authentication for missing or expired access token')
    clearTokenStorage()
    return redirectToAuth()
  }

  let accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  return { accessToken }
}