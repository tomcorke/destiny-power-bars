import { PowerBySlot, JoinedItemDefinition, CharacterData } from "../types";
import { ITEM_SLOT_BUCKET_HASHES } from "../constants";
import { getProfile, DestinyItemComponent } from "bungie-api-ts/destiny2";
import { bungieAuthedFetch, getManifest } from "./bungie-api";
import { getSelectedDestinyMembership, auth } from "./bungie-auth";

export const getOverallPower = (powerBySlot: PowerBySlot) =>
  Object.values(powerBySlot)
    .reduce((sum, power) => sum + power, 0)
  / Object.keys(ITEM_SLOT_BUCKET_HASHES).length

export const getDropEfficiency = (maxPowerBySlot: PowerBySlot, dropPowerIncrease: number = 0) => {
  const base = getOverallPower(maxPowerBySlot)
  const dropPower = Math.floor(base + dropPowerIncrease)
  const overallPerSlotChanges = Object.keys(ITEM_SLOT_BUCKET_HASHES)
    .reduce((changes, slotName) => ({
      ...changes,
      [slotName]: Math.max(0, getOverallPower({ ...maxPowerBySlot, [slotName]: dropPower }) - base),
    }), {} as PowerBySlot)
  return getOverallPower(overallPerSlotChanges)
}

const CLASS_TYPE_ALL = 3
const CLASS_NAMES = ['titan', 'hunter', 'warlock']
const ITEM_TYPE_ARMOR = 2
const ITEM_TYPE_WEAPON = 3

const getBasicProfile = (membershipType: number, membershipId: string) => getProfile(bungieAuthedFetch, {
  membershipType: membershipType,
  destinyMembershipId: membershipId,
  components: [
    200, // DestinyComponentType.Characters,
    205, // DestinyComponentType.CharacterEquipment,
  ]
})

const getAdditionalProfile = (membershipType: number, membershipId: string) => getProfile(bungieAuthedFetch, {
  membershipType: membershipType,
  destinyMembershipId: membershipId,
  components: [
    201, // DestinyComponentType.CharacterInventories,
    102, // DestinyComponentType.ProfileInventories,
    300, // DestinyComponentType.ItemInstances,
    307, // DestinyComponentType.ItemCommonData
  ]
})

const getCombinedProfile = async (membershipType: number, membershipId: string, pendingBasicProfile?: ReturnType<typeof getBasicProfile>) => {
  const actualPendingBasicProfile = pendingBasicProfile || getBasicProfile(membershipType, membershipId)
  const pendingAdditionalProfile = getAdditionalProfile(membershipType, membershipId)
  const [basicProfile, additionalProfile] = await Promise.all([actualPendingBasicProfile, pendingAdditionalProfile])
  if (!basicProfile || !basicProfile.Response) return undefined
  if (!additionalProfile || !additionalProfile.Response) return undefined
  return { ...basicProfile.Response, ...additionalProfile.Response }
}

export const getBasicCharacterData = async (pendingBasicProfile: ReturnType<typeof getBasicProfile>) => {
  const profile = await pendingBasicProfile
  if (!profile || !profile.Response || !profile.Response.characters) return
  const characters = profile.Response.characters.data

  if (characters) {
    const getDataForCharacterId = (id: string): CharacterData => {
      const character = characters[id]
      const className = CLASS_NAMES[character.classType]
      return {
        character,
        id,
        className,
        overallPower: character.light,
        maxPowerBySlot: Object.keys(ITEM_SLOT_BUCKET_HASHES)
          .reduce((slots, slotName) => ({ ...slots, [slotName]: character.light }), {} as { [key: string]: number })
      }
    }

    const characterIds = Object.keys(characters)
    const characterData = characterIds.map(id => getDataForCharacterId(id))
    return characterData
  }
};

export const getCharacterData = async (
  setCharacterData: (state: CharacterData[]) => any,
  setIsFetchingCharacterData: (state: boolean) => any,
  returnBasicCharacterData: boolean = false
) => {
  try {

    const isAuthed = await auth()
    if (!isAuthed) return

    const pendingManifest = getManifest()

    setIsFetchingCharacterData(true)

    const destinyMembership = getSelectedDestinyMembership()
    if (!destinyMembership) return

    const pendingBasicProfile = getBasicProfile(destinyMembership.membershipType, destinyMembership.membershipId)
    pendingBasicProfile.catch(() => {})

    // Flag lets this be disabled to prevent setting after full profile is returned
    let shouldSetBasicCharacterData = true
    // Produce basic data if flag is set
    if (returnBasicCharacterData) {
      const pendingBasicCharacterData = getBasicCharacterData(pendingBasicProfile)
        .catch(e => {});
      (async () => {
        const basicCharacterData = await pendingBasicCharacterData
        if (basicCharacterData && shouldSetBasicCharacterData) { setCharacterData(basicCharacterData) }
      })();
    }

    const fullProfile = await getCombinedProfile(
      destinyMembership.membershipType,
      destinyMembership.membershipId,
      pendingBasicProfile,
    )
    setIsFetchingCharacterData(false)

    if (!fullProfile
      || !fullProfile.characters || !fullProfile.characters.data
      || !fullProfile.characterEquipment || !fullProfile.characterEquipment.data
      || !fullProfile.characterInventories || !fullProfile.characterInventories.data
      || !fullProfile.profileInventory || !fullProfile.profileInventory.data
      || !fullProfile.itemComponents || !fullProfile.itemComponents.instances || !fullProfile.itemComponents.instances.data) return

    const characters = fullProfile.characters.data
    const characterEquipments = fullProfile.characterEquipment.data
    const characterInventories = fullProfile.characterInventories.data
    const profileInventories = fullProfile.profileInventory.data
    const itemInstances = fullProfile.itemComponents.instances.data

    const manifest = await pendingManifest

    if (!manifest) return

    const mergeItems = <T extends { [key: string]: { items: DestinyItemComponent[] } }>(characterItemMap: T) => {
      return Object.values(characterItemMap)
        .reduce((allItems, characterItems) => allItems.concat(characterItems.items), [] as DestinyItemComponent[])
    }

    const allCharacterItems = mergeItems(characterInventories).concat(mergeItems(characterEquipments))
    const allCharacterWeapons = allCharacterItems.filter(i => {
      const itemDefinition = i.itemHash && manifest.DestinyInventoryItemDefinition[i.itemHash]
      return itemDefinition && itemDefinition.itemType === ITEM_TYPE_WEAPON
    })

    const getDataForCharacterId = (id: string): CharacterData => {
      const character = characters[id]
      const className = CLASS_NAMES[character.classType]

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
        .filter(i => i.itemDefinition && (i.itemDefinition.classType === CLASS_TYPE_ALL || i.itemDefinition.classType === character.classType))

      const combinedItems = characterItems.concat(profileItems)
      const armor = combinedItems.filter(i => i.itemDefinition && i.itemDefinition.itemType === ITEM_TYPE_ARMOR)
      const weapons = combinedItems.filter(i => i.itemDefinition && i.itemDefinition.itemType === ITEM_TYPE_WEAPON)

      ;(window as any).weapons = weapons
      ;(window as any).armor = armor

      const itemsBySlot = Object.entries(ITEM_SLOT_BUCKET_HASHES)
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

      const getBestItemForSlot = (slotName: string) => {
        const maxPowerForSlot = maxPowerBySlot[slotName]
        const maxPowerItemsForSlot = itemsBySlot[slotName].filter(i => i.instanceData && i.instanceData.primaryStat.value === maxPowerForSlot)
        if (maxPowerItemsForSlot.length === 1) return maxPowerItemsForSlot[0]
        const equippedItems = maxPowerItemsForSlot.filter(i => characterEquipments[id].items.some(ci => ci.itemInstanceId === i.itemInstanceId))
        if (equippedItems.length === 1) return equippedItems[0]
        return maxPowerItemsForSlot[0]
      }

      const bestItemBySlot = Object.keys(ITEM_SLOT_BUCKET_HASHES)
        .reduce((slots, slotName) => ({
          ...slots,
          [slotName]: getBestItemForSlot(slotName),
        }), {} as { [key: string]: JoinedItemDefinition })

      const overallPower = getOverallPower(maxPowerBySlot)

      return {
        character,
        id,
        className,
        itemsBySlot,
        maxPowerBySlot,
        overallPower,
        bestItemBySlot,
      }
    }

    const characterIds = Object.keys(characters)
    const characterData = characterIds.map(id => getDataForCharacterId(id))
    shouldSetBasicCharacterData = false
    setCharacterData(characterData)

  } catch (e) {
    console.error(`Error fetching manifest and character data`, e)
    setIsFetchingCharacterData(false)
    return
  }

}