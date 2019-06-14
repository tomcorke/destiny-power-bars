import React, { useState, useEffect } from 'react';

import { auth, hasValidAuth } from './services/bungie-auth';
import { CharacterData } from './types';

import { getCharacterData } from './services/utils';
import CharacterDisplay from './components/CharacterDisplay';

import 'normalize.css'
import STYLES from './App.module.scss'

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
    const doGetCharacterData = () => getCharacterData(setCharacterData, setIsFetchingCharacterData, setIsFetchingManifest)
    if (isAuthed) {
      setInterval(doGetCharacterData, 10000)
      doGetCharacterData()
    }
  }, [isAuthed])

  let characterDisplay: JSX.Element | null = null
  if (characterData && characterData.length > 0) {
    return <div className={STYLES.App}>
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
          <li>{isAuthed ? 'Authed' : 'Not authed'}</li>
          <li>{isFetchingManifest && 'Fetching manifest...'}</li>
          <li>{isFetchingCharacterData && 'Fetching character data...'}</li>
          <li>{characterData && characterData.length > 0 ? `Has character data (${characterData.length})` : 'No character data' }</li>
        </ul>
      </div>
    </div>
  )

}

export default App;
