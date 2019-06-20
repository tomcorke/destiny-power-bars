import React from 'react'
import classnames from 'classnames'

import { CharacterData } from "../types";

import STYLES from './CharacterDisplay.module.scss'

interface CharacterDisplayProps {
  data: CharacterData
}

const titleCase = (text: string) => text.substr(0, 1).toUpperCase() + text.substr(1)

interface BarProps {
  min: number
  max: number
  value: number
  avgValue: number
  label: string
  icon?: string
}
const Bar = ({ min, max, value, avgValue, label, icon }: BarProps) => {
  const range = max - min
  const perc = Math.floor(((value - min) / range) * 1000) / 10
  const avgPerc = Math.floor(((avgValue - min) / range) * 1000) / 10
  // const plusTwoPerc = Math.floor(((avgValue + 2 - min) / range) * 1000) / 10
  // const plusFivePerc = Math.floor(((avgValue + 5 - min) / range) * 1000) / 10
  return (
    <div className={STYLES.barWrapper}>
      <div className={STYLES.iconWrapper}>{
        icon && <img className={STYLES.icon} src={`https://www.bungie.net${icon}`} alt={label} />
      }</div>
      <div className={STYLES.barContainer}>
        <div className={STYLES.filledBar} style={{width: `${perc}%`}}><span>{label}</span></div>
        <div className={STYLES.barLine} style={{left: `${avgPerc}%`}} />
      </div>
    </div>
  )
}

const CharacterDisplay = ({ data }: CharacterDisplayProps) => {

  const classItemNames: { [key: string]: string } = {
    warlock: 'Warlock Bond',
    hunter: 'Hunter Cloak',
    titan: 'Titan Mark',
  }
  const slotFullNames: { [key: string]: string } = {
    kinetic: 'Kinetic Weapon',
    energy: 'Energy Weapon',
    power: 'Power Weapon',
    head: 'Helmet',
    gloves: 'Gauntlets',
    chest: 'Chest Armor',
    legs: 'Leg Armor',
    classItem: classItemNames[data.className],
  }

  const rgbString = ({ red, green, blue }: {red:number, green: number, blue: number}) => `rgb(${red},${green},${blue})`

  // Round to 50s
  const minItemPower = Math.min(...Object.values(data.maxPowerBySlot))
  const minPowerToDisplay = Math.max(Math.floor(minItemPower/50)*50 - 50, 0)
  const maxItemPower = Math.max(...Object.values(data.maxPowerBySlot))
  const maxPowerToDisplay = Math.min(Math.ceil(maxItemPower/50)*50, 750)

  const roundedPower = Math.floor(data.overallPower)

  const range = maxPowerToDisplay - minPowerToDisplay
  const perc = Math.floor(((roundedPower - minPowerToDisplay) / range) * 1000) / 10

  return (
    <div className={classnames(STYLES.characterDisplay, STYLES[`class_${data.className}`])} style={{backgroundColor:rgbString(data.character.emblemColor)}}>
      <div className={STYLES.header}>
        <img className={STYLES.emblemBackground} src={`https://www.bungie.net${data.character.emblemBackgroundPath}`} alt='' />
        <div className={STYLES.name}>{titleCase(data.className)}</div>
        <div className={STYLES.power}>{roundedPower}</div>
      </div>
      <div className={STYLES.powerBars}>
        <div className={STYLES.powerRange}>
          <div className={STYLES.minPower}>{minPowerToDisplay}</div>
          <div className={STYLES.rangeLine} />
          <div className={STYLES.maxPower}>{maxPowerToDisplay}</div>
        </div>
        <div className={STYLES.bars}>
          {Object.entries(data.maxPowerBySlot).map(([slotName, power]) => {
            const bestItem = data.bestItemBySlot && data.bestItemBySlot[slotName]
            return (
              <Bar
                key={`${data.id}_${slotName}`}
                min={minPowerToDisplay}
                max={maxPowerToDisplay}
                value={power}
                avgValue={roundedPower}
                label={`${power} ${slotFullNames[slotName] || slotName}`}
                icon={bestItem && bestItem.itemDefinition && bestItem.itemDefinition.displayProperties.icon}
              />
            )
          })}
        </div>
        <div className={STYLES.powerLabel}>
          <div className={STYLES.indicator} style={{left: `${perc}%`}}>{roundedPower}</div>
        </div>
      </div>
    </div>
  )

}

export default CharacterDisplay