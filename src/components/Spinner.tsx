import React from 'react'

import STYLES from './Spinner.module.scss'

const Spinner = () => {
  return (
    <div className={STYLES.anchor}>
      <div className={STYLES.spinner} />
    </div>
  )
}