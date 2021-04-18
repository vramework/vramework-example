import * as React from 'react'
import styles from './header.module.css'

export const Header: React.FunctionComponent = () => {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div style={{ width: 90, height: 25 }}>
          LOGO
        </div>
        <div className={styles.menu_button}>
        </div>
      </div>
    </header>
  )
}