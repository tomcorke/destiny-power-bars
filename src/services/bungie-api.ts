import { get, set } from 'idb-keyval'

import { BUNGIE_API_KEY, getAccessToken } from './bungie-auth';
import { HttpClientConfig, getDestinyManifest, DestinyManifest, DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2'

export const bungieAuthedFetch = async (config: HttpClientConfig) => {
  try {
    const accessToken = getAccessToken()
    const headers: { [key: string]: string } = { 'x-api-key': BUNGIE_API_KEY }
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`
    console.log(config)
    const url = `${config.url}${
      config.params
        ? '?' + Object.entries(config.params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
        : ''
      }`
    const response = await fetch(url, { headers })
    return await response.json()
  } catch (e) {
    console.error(e)
    return {}
  }
}

const MANIFEST_VERSION_KEY = 'MANIFEST_VERSION'
const MANIFEST_IDB_KEY = 'MANIFEST_DATA'
interface ManifestData {
  DestinyInventoryItemDefinition: { [key: string]: DestinyInventoryItemDefinition | undefined }
}
const manifestPropertyWhitelist = ['DestinyInventoryItemDefinition']

const getCachedManifestData = async () => {
  console.log('Loading manifest data from IDB')
  const manifestData = await get(MANIFEST_IDB_KEY)
  console.log('Finished loading manifest data from IDB')
  return manifestData as ManifestData
}

const getRemoteManifestData = async (manifest: DestinyManifest) => {
  const version = manifest.version
  console.log('Fetching fresh manifest data')
  const manifestDataResponse = await fetch(`https://www.bungie.net${manifest.jsonWorldContentPaths.en}`)
  const manifestData = await manifestDataResponse.json()
  console.log('Pruning manifest data')
  Object.keys(manifestData).forEach(key => {
    if (!manifestPropertyWhitelist.includes(key)) delete manifestData[key]
  })
  console.log('Storing manifest data in IDB')
  await set(MANIFEST_IDB_KEY, manifestData)
  localStorage.setItem(MANIFEST_VERSION_KEY, version)
  return manifestData
}

let cachedManifestData: ManifestData | undefined

export const getManifest = async (): Promise<ManifestData> => {
  const manifest = await getDestinyManifest(bungieAuthedFetch)
  const localStorageManifestVersion = localStorage.getItem(MANIFEST_VERSION_KEY)
  if (manifest
    && manifest.Response
    && manifest.Response.version === localStorageManifestVersion
    && !window.location.search.includes('updateManifest')) {
      if (!cachedManifestData)
        cachedManifestData = await getCachedManifestData()
      return cachedManifestData
  }
  cachedManifestData = undefined
  const freshManifestData = await getRemoteManifestData(manifest.Response)
  cachedManifestData = freshManifestData
  return freshManifestData
}