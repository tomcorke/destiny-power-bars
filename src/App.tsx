import React from 'react';
import logo from './logo.svg';
import './App.css';

import { get, set, del } from 'idb-keyval'
import { API_KEY, ACCESS_TOKEN_STORAGE_KEY } from './bungie-auth';
import { getProfile, searchDestinyPlayer, HttpClientConfig, DestinyComponentType, getDestinyManifest, DestinyManifest, DestinyInventoryItemDefinition, DestinyItemComponent } from 'bungie-api-ts/destiny2'
import { isObject } from 'util';

const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || ''

const bungieGet = async (config: HttpClientConfig) => {
  //const url = `https://www.bungie.net/Platform${path}`
  const headers = { 'x-api-key': API_KEY, Authorization: accessToken && `Bearer ${accessToken}` }
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
  const localStorageManifestVersion = localStorage.getItem(MANIFEST_VERSION_KEY)
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
const getManifest = async (): Promise<ManifestData> => {
  const manifest = await getDestinyManifest(bungieGet)
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

class App extends React.Component {

  componentWillMount() {
    (async () => {
      const manifestPromise = getManifest()
      const profileResults = await searchDestinyPlayer(bungieGet, { membershipType: 4, displayName: 'Shot%232975' })
      const membershipId = profileResults.Response[0].membershipId
      const profile = await getProfile(bungieGet, {
        membershipType: 4,
        destinyMembershipId: membershipId,
        components: [
          200, // DestinyComponentType.Characters,
          205, // DestinyComponentType.CharacterEquipment,
          201, // DestinyComponentType.CharacterInventories,
          102, // DestinyComponentType.ProfileInventories,
          300, // DestinyComponentType.ItemInstances,
          307, // DestinyComponentType.ItemCommonData
        ]
      })

      const characters = profile.Response.characters.data
      const equipments = profile.Response.characterEquipment.data
      const inventories = profile.Response.characterInventories.data
      const profileInventories = profile.Response.profileInventory.data
      const itemInstances = profile.Response.itemComponents.instances.data
      const manifest = await manifestPromise

      const CLASS_TYPE_ALL = 3
      const classNames = ['titan', 'hunter', 'warlock']
      const ITEM_TYPE_ARMOR = 2
      const ITEM_TYPE_WEAPON = 3

      if (characters && equipments && inventories && profileInventories && itemInstances && manifest) {
        const getCharacterData = (id: string) => {
          const cData = characters[id]
          const className = classNames[cData.classType]

          const mapAndFilterItems = (items: DestinyItemComponent[]) => items
            .map(item => {
              const instanceData = item.itemInstanceId && itemInstances[item.itemInstanceId]
              const itemDefinition = manifest.DestinyInventoryItemDefinition[item.itemHash]
              return {
                ...item,
                instanceData,
                itemDefinition,
              }
            })
            .filter(i => i.instanceData && i.itemDefinition && [ITEM_TYPE_ARMOR, ITEM_TYPE_WEAPON].includes(i.itemDefinition.itemType))

          const characterItems = mapAndFilterItems(inventories[id].items.concat(equipments[id].items))
          const profileItems = mapAndFilterItems(profileInventories.items)
            .filter(i => i.itemDefinition && (i.itemDefinition.classType === CLASS_TYPE_ALL || i.itemDefinition.classType === cData.classType))

          const combinedItems = characterItems.concat(profileItems)
          const armor = combinedItems.filter(i => i.itemDefinition && i.itemDefinition.itemType === ITEM_TYPE_ARMOR)
          const weapons = combinedItems.filter(i => i.itemDefinition && i.itemDefinition.itemType === ITEM_TYPE_WEAPON)

          return {
            id,
            className,
            items: combinedItems,
            armor,
            weapons
          }
        }

        const characterIds = Object.keys(characters)
        console.log({ characters, equipments, inventories })
        console.log(characterIds.map(id => getCharacterData(id)))
      }

    })();
  }

  render() {
    return (
      <div className="App">
      </div>
    );
  }
}

export default App;
