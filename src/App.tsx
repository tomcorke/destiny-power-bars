import React, { useState, useEffect } from 'react'

import { auth, hasValidAuth, hasSelectedDestinyMembership, setSelectedDestinyMembership } from './services/bungie-auth'
import { CharacterData } from './types'

import { getCharacterData } from './services/utils'
import CharacterDisplay from './components/CharacterDisplay'
import MembershipSelect from './components/MembershipSelect'

import 'normalize.css'
import STYLES from './App.module.scss'
import { UserInfoCard } from 'bungie-api-ts/user';

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
      setInterval(doGetCharacterData, 10000)
      doGetCharacterData()
    }
  }, [isAuthed, hasMembership])

  if (characterData && characterData.length > 0) {
    return <div className={STYLES.App}>
      <MembershipSelect onMembershipSelect={() => {}} />

      <div className={STYLES.charactersContainer}>
        <div className={STYLES.characters}>
          {characterData.map(c => <CharacterDisplay key={c.id} data={c} />)}
        </div>
      </div>
    </div>
  }

  return (
    <div className={STYLES.App}>
      <div className={STYLES.loadingStatus}>
        <ul>
          <li>{isAuthed ? 'Authenticated' : 'Not authenticated'}</li>
          {isFetchingManifest && <li>Fetching manifest...</li>}
          {isFetchingCharacterData && <li>Fetching character data...</li>}
          {characterData
            ? <li>{`Has character data (${characterData.length} characters)`}</li>
            : <li>No character data</li> }
          {isAuthed && !hasMembership && <li>Waiting for Destiny membership select...</li>}
        </ul>
      </div>

      <MembershipSelect onMembershipSelect={(membership: UserInfoCard) => {
        setSelectedDestinyMembership(membership)
        setHasMembership(true)
      }} />
    </div>
  )

}

export default App;
