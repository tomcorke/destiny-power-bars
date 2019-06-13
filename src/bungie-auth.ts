// API KEY STUFF

const getAuthUrl = () => `${OAUTH_URL}?response_type=code&client_id=${OAUTH_CLIENTID}`

const redirectToAuth = () => window.location.replace(getAuthUrl())
const fetchAuthToken = async () => {
  const tokenResponse = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    redirect: 'follow',
    referrer: 'no-referrer',
    body: `grant_type=authorization_code&code=${authCode}&client_id=${OAUTH_CLIENTID}`
  })
  if (tokenResponse.status === 200) {
    const data = await tokenResponse.json()
    accessToken = data.access_token as string
    isFetchingToken = false
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
    window.location.replace(`${window.location.origin}${window.location.pathname}`)
  } else {
    isFetchingToken = false
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    redirectToAuth()
  }
}

export const ACCESS_TOKEN_STORAGE_KEY = 'bungieAccessToken'
let accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)

const query = window.location.search
const code = /code=([a-f0-9]+)/.exec(query)
const authCode = code && code[1]

let isFetchingToken = false
if (authCode) {
  isFetchingToken = true
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  fetchAuthToken()
}

const isAuthed = accessToken && !isFetchingToken

if (!isAuthed && !isFetchingToken) {
  redirectToAuth()
}

export default {}