import React, { useState, useEffect } from 'react'
import { UserInfoCard } from 'bungie-api-ts/user';

import { auth, hasValidAuth, hasSelectedDestinyMembership, setSelectedDestinyMembership } from './services/bungie-auth'
import { CharacterData } from './types'

import { getCharacterData } from './services/utils'
import CharacterDisplay from './components/CharacterDisplay'
import MembershipSelect from './components/MembershipSelect'
import LoadingSpinner from './components/LoadingSpinner';
import { getManifest } from './services/bungie-api';

import 'normalize.css'
import STYLES from './App.module.scss'

let characterDataRefreshTimer: number | undefined

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

  const [hasManifestData, setHasManifestData] = useState<boolean>(false)
  useEffect(() => {
    (async () => {
      await getManifest()
      setHasManifestData(true)
    })();
  })

  const [isFetchingCharacterData, setIsFetchingCharacterData] = useState<boolean>(false)
  const [characterData, setCharacterData] = useState<CharacterData[] | undefined>(undefined)
  useEffect(() => {
    const doGetCharacterData = (returnEarlyResults: boolean = false) => getCharacterData(setCharacterData, setIsFetchingCharacterData, returnEarlyResults)
    if (isAuthed && hasMembership && !isFetchingCharacterData) {
      if (!characterDataRefreshTimer) {
        characterDataRefreshTimer = setInterval(doGetCharacterData, 10000)
        doGetCharacterData(true)
      }
    }
  }, [isAuthed, hasMembership, hasManifestData, isFetchingCharacterData])

  const onSelectMembership = (membership: UserInfoCard) => {
    setSelectedDestinyMembership(membership)
    setHasMembership(true)
  }

  let status = ''
  if (!isAuthed) {
    status = 'Authenticating...'
  } else if (!hasMembership) {
    status = 'Waiting for Destiny platform selection...'
  } else if (!hasManifestData) {
    status = 'Fetching Destiny item manifest...'
  } else if (!characterData || characterData.length === 0) {
    if (isFetchingCharacterData) {
      status = 'Fetching character data...'
    } else {
      status = 'No character data'
    }
  }

  (window as any).characterData = characterData

  if (characterData && characterData.length > 0) {
    return (
      <div className={STYLES.App}>
        <MembershipSelect onMembershipSelect={onSelectMembership} />
        <div className={STYLES.charactersContainer}>
          <div className={STYLES.characters}>
            {characterData.map(c => <CharacterDisplay key={c.id} data={c} />)}
          </div>
        </div>
        {status && <LoadingSpinner status={status} /> }
      </div>
    )
  }

  return (
    <div className={STYLES.App}>
      <LoadingSpinner status={status} />
      <MembershipSelect onMembershipSelect={onSelectMembership} />
    </div>
  )

}

export default App;
