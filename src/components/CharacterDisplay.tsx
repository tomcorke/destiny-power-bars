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
}
const Bar = ({ min, max, value, avgValue, label }: BarProps) => {
  const range = max - min
  const perc = Math.floor(((value - min) / range) * 1000) / 10
  const avgPerc = Math.floor(((avgValue - min) / range) * 1000) / 10
  const plusTwoPerc = Math.floor(((avgValue + 2 - min) / range) * 1000) / 10
  const plusFivePerc = Math.floor(((avgValue + 5 - min) / range) * 1000) / 10
  return <div className={STYLES.barContainer}>
    <div className={STYLES.filledBar} style={{width: `${perc}%`}}><span>{label}</span></div>
    <div className={STYLES.barLine} style={{left: `${avgPerc}%`}} />
  </div>
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

  return (
    <div className={classnames(STYLES.characterDisplay, STYLES[`class_${data.className}`])} style={{backgroundColor:rgbString(data.character.emblemColor)}}>
      <div className={STYLES.header}>
        <img className={STYLES.emblemBackground} src={`https://www.bungie.net${data.character.emblemBackgroundPath}`} />
        <div className={STYLES.name}>{titleCase(data.className)}</div>
        <div className={STYLES.power}>{data.overallPower}</div>
      </div>
      <div className={STYLES.powerBars}>
        {Object.entries(data.maxPowerBySlot).map(([slotName, power]) =>
          <Bar min={650} max={750} value={power} avgValue={data.overallPower} label={`${power} ${slotFullNames[slotName] || slotName}`} />
        )}
      </div>
    </div>
  )

}

export default CharacterDisplay