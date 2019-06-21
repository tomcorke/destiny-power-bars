import { PowerBySlot, JoinedItemDefinition, CharacterData } from "../types";
import { ITEM_SLOT_BUCKETS, ITEM_TYPE_WEAPON, CLASS_NAMES, ITEM_TYPE_ARMOR, CLASS_TYPE_ALL, ITEM_TIER_TYPE_EXOTIC, ITEM_SLOT_GROUP_WEAPONS, ITEM_SLOT_GROUP_ARMOR, ITEM_BUCKET_SLOTS } from "../constants";
import { getProfile, DestinyItemComponent, DestinyCharacterComponent } from "bungie-api-ts/destiny2";
import { bungieAuthedFetch, getManifest } from "./bungie-api";
import { getSelectedDestinyMembership, auth } from "./bungie-auth";

export const getOverallPower = (powerBySlot: PowerBySlot) =>
  Object.values(powerBySlot)
    .reduce((sum, power) => sum + power, 0)
  / Object.keys(ITEM_SLOT_BUCKETS).length

export const getDropEfficiency = (maxPowerBySlot: PowerBySlot, dropPowerIncrease: number = 0) => {
  const base = getOverallPower(maxPowerBySlot)
  const dropPower = Math.floor(base + dropPowerIncrease)
  const overallPerSlotChanges = Object.keys(ITEM_SLOT_BUCKETS)
    .reduce((changes, slotName) => ({
      ...changes,
      [slotName]: Math.max(0, getOverallPower({ ...maxPowerBySlot, [slotName]: dropPower }) - base),
    }), {} as PowerBySlot)
  return getOverallPower(overallPerSlotChanges)
}

const getBasicProfile = (membershipType: number, membershipId: string) => getProfile(bungieAuthedFetch, {
  membershipType: membershipType,
  destinyMembershipId: membershipId,
  components: [
    200, // DestinyComponentType.Characters,
    205, // DestinyComponentType.CharacterEquipment,
  ]
})

const getFullProfile = (membershipType: number, membershipId: string) => getProfile(bungieAuthedFetch, {
  membershipType: membershipType,
  destinyMembershipId: membershipId,
  components: [
    200, // DestinyComponentType.Characters,
    201, // DestinyComponentType.CharacterInventories,
    205, // DestinyComponentType.CharacterEquipment,
    102, // DestinyComponentType.ProfileInventories,
    300, // DestinyComponentType.ItemInstances,
  ]
})

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
        maxPowerBySlot: Object.keys(ITEM_SLOT_BUCKETS)
          .reduce((slots, slotName) => ({ ...slots, [slotName]: character.light }), {} as { [key: string]: number })
      }
    }

    const characterIds = Object.keys(characters)
    const characterData = characterIds.map(id => getDataForCharacterId(id))
    return characterData
  }
};

const mergeItems = <T extends { [key: string]: { items: DestinyItemComponent[] } }>(characterItemMap: T) => {
  return Object.values(characterItemMap)
    .reduce((allItems, characterItems) => allItems.concat(characterItems.items), [] as DestinyItemComponent[])
}

const isItemEquippableByCharacter = (item: JoinedItemDefinition, character: DestinyCharacterComponent) => {
  if (!item.instanceData) return false
  if (item.instanceData.canEquip) return true // If the game says we can equip it, let's believe it
  if (item.instanceData.cannotEquipReason === 16) return true // Only reason is that it's in your vault
  if (item.instanceData.equipRequiredLevel > character.baseCharacterLevel) return false
  // Let's ignore the rest for now
  return true
}

const maxItemPower = (items: JoinedItemDefinition[] = []) =>
  Math.max(...items.map(i => i.instanceData ? i.instanceData.primaryStat.value : 0))

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

    const fullProfile = await getFullProfile(
      destinyMembership.membershipType,
      destinyMembership.membershipId,
    )
    setIsFetchingCharacterData(false)

    if (!fullProfile
      || !fullProfile.Response
      || !fullProfile.Response.characters || !fullProfile.Response.characters.data
      || !fullProfile.Response.characterEquipment || !fullProfile.Response.characterEquipment.data
      || !fullProfile.Response.characterInventories || !fullProfile.Response.characterInventories.data
      || !fullProfile.Response.profileInventory || !fullProfile.Response.profileInventory.data
      || !fullProfile.Response.itemComponents || !fullProfile.Response.itemComponents.instances || !fullProfile.Response.itemComponents.instances.data) return

    const characters = fullProfile.Response.characters.data
    const characterEquipments = fullProfile.Response.characterEquipment.data
    const characterInventories = fullProfile.Response.characterInventories.data
    const profileInventories = fullProfile.Response.profileInventory.data
    const itemInstances = fullProfile.Response.itemComponents.instances.data

    const manifest = await pendingManifest

    if (!manifest) return

    const allCharacterItems = mergeItems(characterInventories)
      .concat(mergeItems(characterEquipments))
      .concat(profileInventories.items)
    console.log(
      allCharacterItems
        .filter(i => i.itemInstanceId && itemInstances[i.itemInstanceId] && itemInstances[i.itemInstanceId].primaryStat && itemInstances[i.itemInstanceId].primaryStat.value === 750)
        .map(i => manifest.DestinyInventoryItemDefinition[i.itemHash])
    )
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
      const equippableItems = combinedItems.filter(i => isItemEquippableByCharacter(i, character))

      interface ItemBySlot { [slotName: string]: JoinedItemDefinition }
      interface ItemsBySlot { [slotName: string]: JoinedItemDefinition[] }
      interface PowerBySlot { [slotName: string]: number }

      const getItemsBySlot = (items: JoinedItemDefinition[], itemFilter?: (item: JoinedItemDefinition) => boolean) => {
        return Object.entries(ITEM_SLOT_BUCKETS)
          .reduce((slots, [slotName, slotBucketHash]) => ({
            ...slots,
            [slotName]: items
              .filter(item => item.itemDefinition && item.itemDefinition.inventory.bucketTypeHash === slotBucketHash)
              .filter(item => !itemFilter || itemFilter(item))
          }), {} as ItemsBySlot)
      }
      const equippableItemsBySlot = getItemsBySlot(equippableItems)

      const exoticItemsBySlot = getItemsBySlot(equippableItems, item => !!(item.itemDefinition && item.itemDefinition.inventory.tierType === ITEM_TIER_TYPE_EXOTIC))
      const nonExoticItemsBySlot = getItemsBySlot(equippableItems, item => !!(item.itemDefinition && item.itemDefinition.inventory.tierType !== ITEM_TIER_TYPE_EXOTIC))

      const nonExoticMaxPowerItemsBySlot = Object.keys(ITEM_SLOT_BUCKETS)
        .reduce((slots, slotName) => {
          const maxPower = maxItemPower(nonExoticItemsBySlot[slotName])
          const maxPowerItems = nonExoticItemsBySlot[slotName].filter(i => i.instanceData && i.instanceData.primaryStat.value === maxPower)
          return {
            ...slots,
            [slotName]: maxPowerItems
          }
        }, {} as ItemsBySlot)

      const exoticMaxPowerItemsBySlot = Object.keys(ITEM_SLOT_BUCKETS)
        .reduce((slots, slotName) => {
          const maxPower = maxItemPower(exoticItemsBySlot[slotName])
          if (maxPower < maxItemPower(nonExoticMaxPowerItemsBySlot[slotName])) return slots
          const maxPowerItems = exoticItemsBySlot[slotName].filter(i => i.instanceData && i.instanceData.primaryStat.value === maxPower)
          return {
            ...slots,
            [slotName]: maxPowerItems
          }
        }, {} as ItemsBySlot)

      const groupedMaxPowerItems = {
        weapons: ITEM_SLOT_GROUP_WEAPONS.reduce((slots, slotName) => ({ ...slots, [slotName]: nonExoticMaxPowerItemsBySlot[slotName] }), {} as ItemsBySlot),
        exoticWeapons: ITEM_SLOT_GROUP_WEAPONS.reduce((allItems, slotName) => allItems.concat(exoticMaxPowerItemsBySlot[slotName]), [] as JoinedItemDefinition[]),
        armor: ITEM_SLOT_GROUP_ARMOR.reduce((slots, slotName) => ({ ...slots, [slotName]: nonExoticMaxPowerItemsBySlot[slotName] }), {} as ItemsBySlot),
        exoticArmor: ITEM_SLOT_GROUP_ARMOR.reduce((allItems, slotName) => allItems.concat(exoticMaxPowerItemsBySlot[slotName]), [] as JoinedItemDefinition[]),
      }

      const findBestExotic = (nonExoticItemsBySlot: ItemsBySlot, exoticItems: JoinedItemDefinition[]): ItemsBySlot => {
        let maxPower = 0
        let bestExotic: JoinedItemDefinition | undefined
        let bestExoticSlot: string | undefined
        // Try every exotic
        exoticItems.forEach(item => {
          const itemSlot = item && item.itemDefinition &&  ITEM_BUCKET_SLOTS[item.itemDefinition.inventory.bucketTypeHash]
          const itemInstance = item && item.instanceData
          if (!itemSlot || !itemInstance) return
          const totalPowerWithItem = Object.entries(nonExoticItemsBySlot)
            .reduce((totalPower, [slotName, items]) => {
              if (slotName === itemSlot) return totalPower + itemInstance.primaryStat.value
              return totalPower + maxItemPower(items)
            }, 0)
          if (totalPowerWithItem > maxPower) {
            maxPower = totalPowerWithItem
            bestExotic = item
            bestExoticSlot = itemSlot
          }
        })

        if (!bestExotic || !bestExoticSlot) return nonExoticItemsBySlot

        return { ...nonExoticItemsBySlot, [bestExoticSlot]: [bestExotic] }
      }

      const maxPowerEquippableWeaponsBySlot = findBestExotic(groupedMaxPowerItems.weapons, groupedMaxPowerItems.exoticWeapons)
      const maxPowerEquippableArmorBySlot = findBestExotic(groupedMaxPowerItems.armor, groupedMaxPowerItems.exoticArmor)

      const maxPowerEquippableItems = {
        ...maxPowerEquippableWeaponsBySlot,
        ...maxPowerEquippableArmorBySlot,
      }

      const getMaxPowerBySlot = (itemsBySlot: ItemsBySlot) => {
        return Object.entries(itemsBySlot)
          .reduce((slots, [slotName, items]) => {
            return {
              ...slots,
              [slotName]: maxItemPower(items)
            }
          }, {} as PowerBySlot)
      }

      const maxPowerBySlot = getMaxPowerBySlot(maxPowerEquippableItems)

      const getBestItemForSlot = (slotName: string) => {
        const maxPowerForSlot = maxPowerBySlot[slotName]
        const maxPowerItemsForSlot = equippableItemsBySlot[slotName].filter(i => i.instanceData && i.instanceData.primaryStat.value === maxPowerForSlot)
        if (maxPowerItemsForSlot.length === 1) return maxPowerItemsForSlot[0]
        const equippedItems = maxPowerItemsForSlot.filter(i => characterEquipments[id].items.some(ci => ci.itemInstanceId === i.itemInstanceId))
        if (equippedItems.length === 1) return equippedItems[0]
        return maxPowerItemsForSlot[0]
      }

      const bestItemBySlot = Object.keys(ITEM_SLOT_BUCKETS)
        .reduce((slots, slotName) => ({
          ...slots,
          [slotName]: getBestItemForSlot(slotName),
        }), {} as ItemBySlot)

      const overallPower = getOverallPower(maxPowerBySlot)

      return {
        character,
        id,
        className,
        equippableItemsBySlot,
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