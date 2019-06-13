import { get, set, del } from 'idb-keyval'

import { BUNGIE_API_KEY, ACCESS_TOKEN_STORAGE_KEY } from './bungie-auth';
import { getProfile, searchDestinyPlayer, HttpClientConfig, DestinyComponentType, getDestinyManifest, DestinyManifest, DestinyInventoryItemDefinition, DestinyItemComponent } from 'bungie-api-ts/destiny2'

export const bungieAuthedFetch = async (config: HttpClientConfig) => {
  //const url = `https://www.bungie.net/Platform${path}`
const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  const headers: { [key: string]: string } = { 'x-api-key': BUNGIE_API_KEY }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  console.log(config)
  const url = `${config.url}${
    config.params
      ? '?' + Object.entries(config.params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
      : ''
    }`
  const response = await fetch(url, { headers })
  return response.json()
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

export const getManifest = async (): Promise<ManifestData> => {
  const manifest = await getDestinyManifest(bungieAuthedFetch)
  const localStorageManifestVersion = localStorage.getItem(MANIFEST_VERSION_KEY)
  if (manifest.Response.version === localStorageManifestVersion && !window.location.search.includes('updateManifest')) {
    try {
      return await getCachedManifestData()
    } catch (e) {
      console.error(e)
    }
  }
  return getRemoteManifestData(manifest.Response)
}