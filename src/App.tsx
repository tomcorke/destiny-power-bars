import React, { useState, useEffect } from 'react'

import { auth, hasValidAuth, hasSelectedDestinyMembership, setSelectedDestinyMembership } from './services/bungie-auth'
import { CharacterData } from './types'

import { getCharacterData } from './services/utils'
import CharacterDisplay from './components/CharacterDisplay'
import MembershipSelect from './components/MembershipSelect'

import 'normalize.css'
import STYLES from './App.module.scss'
import { UserInfoCard } from 'bungie-api-ts/user';
import LoadingSpinner from './components/LoadingSpinner';

let characterDataRefreshTimer: NodeJS.Timeout | undefined

const App = () => {

  const [isAuthed, setIsAuthed] = useState<boolean>(hasValidAuth())
  useEffect(() => {
    const doAuth = async () => {
      const authResult = await auth()
      if (authResult) setIsAuthed(true)
    }
    if (!isAuthed) doAuth()
  })

  const [hasMembership, setHasMembership] = useState<boolean>(hasSelectedDestinyMembership())
  const [isFetchingManifest, setIsFetchingManifest] = useState<boolean>(false)
  const [isFetchingCharacterData, setIsFetchingCharacterData] = useState<boolean>(false)

  const [characterData, setCharacterData] = useState<CharacterData[] | undefined>(undefined)
  useEffect(() => {
    const doGetCharacterData = () => getCharacterData(setCharacterData, setIsFetchingCharacterData, setIsFetchingManifest)
    if (isAuthed && hasMembership) {
      if (!characterDataRefreshTimer) {
        characterDataRefreshTimer = setInterval(doGetCharacterData, 10000)
      }
      doGetCharacterData()
    }
  }, [isAuthed, hasMembership])

  const onSelectMembership = (membership: UserInfoCard) => {
    setSelectedDestinyMembership(membership)
    setHasMembership(true)
  }

  if (characterData && characterData.length > 0) {
    return (
      <div className={STYLES.App}>
        <MembershipSelect onMembershipSelect={onSelectMembership} />
        <div className={STYLES.charactersContainer}>
          <div className={STYLES.characters}>
            {characterData.map(c => <CharacterDisplay key={c.id} data={c} />)}
          </div>
        </div>
      </div>
    )
  }

  let status = ''
  if (!isAuthed) {
    status = 'Authenticating...'
  } else if (isFetchingManifest || isFetchingCharacterData) {
    status = 'Fetching data...'
  } else if (!hasMembership) {
    status = 'Waiting for Destiny platform selection...'
  } else if (!characterData || characterData.length === 0) {
    status = 'No character data'
  }

  return (
    <div className={STYLES.App}>
      <LoadingSpinner status={status} />
      <MembershipSelect onMembershipSelect={onSelectMembership} />
    </div>
  )

}

export default App;
