import * as React from 'react'
import styles from './auth.module.css'

export const AuthHeader: React.FunctionComponent = () => {
  return (
    <div className={styles.auth_header}>
      <span style={{ width: 135, height: 37.5 }}>
          LOGO
      </span>
    </div>
  )
}
