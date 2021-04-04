import * as React from 'react'
import styles from './header.module.css'
import { MenuButton } from '@databuilder/dom/src/components/menubutton/menubutton'
import { useRoutes } from '@databuilder/api/src/contexts/routes'

export const Header: React.FunctionComponent = () => {
  const { menuOpen, setMenuOpen } = useRoutes()

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div style={{ width: 90, height: 25 }}>
          LOGO
        </div>
        <div className={styles.menu_button}>
          <MenuButton open={menuOpen} setOpen={setMenuOpen} />
        </div>
      </div>
    </header>
  )
}
