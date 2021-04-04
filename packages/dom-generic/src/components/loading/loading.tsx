import * as React from 'react'
import styles from './loading.module.css'

export const Loading: React.FunctionComponent<{ absolute?: boolean }> = ({ absolute = true }) => {
  return (
    <div className={absolute ? styles.absolute_wrapper : styles.wrapper}>
      <div style={{ width: 180, height: 50 }} className={styles.logo}>
        LOGO
      </div>
    </div>
  )
}
