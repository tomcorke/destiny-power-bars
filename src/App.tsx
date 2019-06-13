import React, { useState, useEffect } from 'react';

import {
  getProfile,
  searchDestinyPlayer,
  DestinyItemComponent,
  DestinyItemInstanceComponent,
  DestinyInventoryItemDefinition,

} from 'bungie-api-ts/destiny2'

import { auth, hasValidAuth, DESTINY_MEMBERSHIP_ID_STORAGE_KEY } from './bungie-auth';
import { getManifest, bungieAuthedFetch } from './bungie-api';

import './App.css';

type JoinedItemDefinition = DestinyItemComponent & {
  instanceData?: DestinyItemInstanceComponent
  itemDefinition?: DestinyInventoryItemDefinition
}
interface CharacterData {
  id: string
  className: string
  itemsBySlot: { [key: string]: JoinedItemDefinition[] }
  maxPowerBySlot: PowerBySlot
  overallPower: number
}
interface PowerBySlot { [key: string]: number }

const ITEM_SLOTS = {
  kinetic: 1498876634,
  energy: 2465295065,
  power: 953998645,
  head: 3448274439,
  gloves: 3551918588,
  chest: 14239492,
  legs: 20886954,
  classItem: 1585787867,
}

const getOverallPower = (powerBySlot: PowerBySlot) =>
  Object.values(powerBySlot)
    .reduce((sum, power) => sum + power, 0)
  / Object.keys(ITEM_SLOTS).length

const getDropEfficiency = (maxPowerBySlot: PowerBySlot, dropPowerIncrease: number = 0) => {
  const base = getOverallPower(maxPowerBySlot)
  const dropPower = Math.floor(base + dropPowerIncrease)
  const overallPerSlotChanges = Object.keys(ITEM_SLOTS)
    .reduce((changes, slotName) => ({
      ...changes,
      [slotName]: Math.max(0, getOverallPower({ ...maxPowerBySlot, [slotName]: dropPower }) - base),
    }), {} as PowerBySlot)
  return getOverallPower(overallPerSlotChanges)
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
      const destinyMembershipId = localStorage.getItem(DESTINY_MEMBERSHIP_ID_STORAGE_KEY) as string
      const profile = await getProfile(bungieAuthedFetch, {
        membershipType: 4,
        destinyMembershipId,
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
      const characterEquipments = profile.Response.characterEquipment.data
      const characterInventories = profile.Response.characterInventories.data
      const profileInventories = profile.Response.profileInventory.data
      const itemInstances = profile.Response.itemComponents.instances.data

      const manifest = await manifestPromise

      const CLASS_TYPE_ALL = 3
      const classNames = ['titan', 'hunter', 'warlock']
      const ITEM_TYPE_ARMOR = 2
      const ITEM_TYPE_WEAPON = 3

      if (characters && characterEquipments && characterInventories && profileInventories && itemInstances && manifest) {

        const mergeItems = <T extends { [key: string]: { items: DestinyItemComponent[] } }>(characterItemMap: T) => {
          return Object.values(characterItemMap)
            .reduce((allItems, characterItems) => allItems.concat(characterItems.items), [] as DestinyItemComponent[])
        }

        const allCharacterItems = mergeItems(characterInventories).concat(mergeItems(characterEquipments))
        const allCharacterWeapons = allCharacterItems.filter(i => {
          const itemDefinition = i.itemHash && manifest.DestinyInventoryItemDefinition[i.itemHash]
          return itemDefinition && itemDefinition.itemType === ITEM_TYPE_WEAPON
        })

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

          const characterItems = mapAndFilterItems(
            characterInventories[id].items
              .concat(characterEquipments[id].items)
              .concat(allCharacterWeapons)
          )
          const profileItems = mapAndFilterItems(profileInventories.items)
            .filter(i => i.itemDefinition && (i.itemDefinition.classType === CLASS_TYPE_ALL || i.itemDefinition.classType === cData.classType))

          const combinedItems = characterItems.concat(profileItems)
          const armor = combinedItems.filter(i => i.itemDefinition && i.itemDefinition.itemType === ITEM_TYPE_ARMOR)
          const weapons = combinedItems.filter(i => i.itemDefinition && i.itemDefinition.itemType === ITEM_TYPE_WEAPON)

          ;(window as any).weapons = weapons
          ;(window as any).armor = armor

          const itemsBySlot = Object.entries(ITEM_SLOTS)
            .reduce((slots, [slotName, slotBucketHash]) => ({
              ...slots,
              [slotName]: combinedItems
                .filter(i => i.itemDefinition && i.itemDefinition.inventory.bucketTypeHash === slotBucketHash)
            }), {} as { [key: string]: JoinedItemDefinition[] })

          const maxPowerBySlot = Object.entries(itemsBySlot)
            .reduce((slots, [slotName, items]) => {
              return {
                ...slots,
                [slotName]: Math.max(...items
                  .map(i => i.instanceData ? i.instanceData.primaryStat.value : 0))
              }
            }, {} as { [key: string]: number })

          const overallPower = getOverallPower(maxPowerBySlot)

          return {
            id,
            className,
            itemsBySlot,
            maxPowerBySlot,
            overallPower,
          }
        }

        const characterIds = Object.keys(characters)
        console.log({ characters, equipments: characterEquipments, inventories: characterInventories })
        const characterData = characterIds.map(id => getCharacterData(id))
        setCharacterData(characterData)

        console.log(characterData)
      }

    }
    getCharacterData()

  }, [isAuthed])

  interface BarProps {
    min: number
    max: number
    value: number
    label: string
  }
  const Bar = ({ min, max, value, label }: BarProps) => {
    const range = max - min
    const perc = Math.floor(((value - min) / range) * 1000) / 10
    return <div style={{width: '100%', backgroundColor: '#999'}}>
      <div style={{width: `${perc}%`, backgroundColor: 'red', height: '20px', margin: '1px', color: 'white'}}>{label}</div>
    </div>
  }

  let characterDisplay: JSX.Element | null = null
  if (characterData && characterData.length > 0) {
    return <div style={{margin: '2em'}}>
      {characterData.map(c => (
        <div style={{maxWidth: '400px'}}>
          <div>{c.className} ({c.overallPower})</div>
          {Object.entries(c.maxPowerBySlot).map(([slotName, power]) =>
            <Bar min={650} max={750} value={power} label={`${slotName} (${power})`} />
          )}
        </div>
      ))}
    </div>
  }

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
