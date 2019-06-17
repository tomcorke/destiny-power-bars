import React from 'react'

import STYLES from './LoadingSpinner.module.scss'

interface LoadingSpinnerProps {
  status: string
}

const LoadingSpinner = ({ status }: LoadingSpinnerProps) => {
  return (
    <div className={STYLES.loadingSpinnerContainer}>
      <div className={STYLES.anchor}>
        <div className={STYLES.spinnerLarge} />
        <div className={STYLES.spinnerSmall} />
        <div className={STYLES.status}>{status}</div>
      </div>
    </div>
  )
}

export default LoadingSpinner