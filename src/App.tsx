import React, { useState, useEffect } from 'react';

import { getProfile, searchDestinyPlayer, DestinyItemComponent, DestinyItemInstanceComponent, DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2'

import { auth, hasValidAuth } from './bungie-auth';
import { getManifest, bungieAuthedFetch } from './bungie-api';

import './App.css';

type JoinedItemDefinition = DestinyItemComponent & {
  instanceData?: DestinyItemInstanceComponent
  itemDefinition?: DestinyInventoryItemDefinition
}
interface CharacterData {
  id: string
  className: string
  items: JoinedItemDefinition[]
}

const App = () => {

  const [isAuthed, setIsAuthed] = useState<boolean>(hasValidAuth())
  useEffect(() => {
    const doAuth = async () => {
      const authResult = await auth()
      if (authResult) setIsAuthed(true)
    }
    if (!isAuthed) doAuth()
  })

  const [isFetchingManifest, setIsFetchingManifest] = useState<boolean>(false)
  const [isFetchingCharacterData, setIsFetchingCharacterData] = useState<boolean>(false)
  const [characterData, setCharacterData] = useState<CharacterData[]>([])
  useEffect(() => {
    const getCharacterData = async () => {

      if (!isAuthed) return

      setIsFetchingManifest(true)
      const manifestPromise = getManifest()
      manifestPromise.finally(() => setIsFetchingManifest(false))

      setIsFetchingCharacterData(true)
      const profileResults = await searchDestinyPlayer(bungieAuthedFetch, { membershipType: 4, displayName: 'Shot%232975' })
      const membershipId = profileResults.Response[0].membershipId
      const profile = await getProfile(bungieAuthedFetch, {
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
      setIsFetchingCharacterData(false)

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
              const instanceData = item.itemInstanceId ? itemInstances[item.itemInstanceId] : undefined
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
        const characterData = characterIds.map(id => getCharacterData(id))
        setCharacterData(characterData)
      }

    }
    getCharacterData()

  }, [isAuthed])

  return (
    <div>
      <div>{isAuthed ? 'Authed' : 'Not authed'}</div>
      <div>{isFetchingManifest && 'Fetching manifest...'}</div>
      <div>{isFetchingCharacterData && 'Fetching character data...'}</div>
      <div>{characterData && characterData.length > 0 ? `Has character data (${characterData.length})` : 'No character data' }</div>

    </div>
  )

}

export default App;
