import * as React from 'react'
import styles from './menubutton.module.css'
import cx from 'classnames'

export const MenuButton: React.FunctionComponent<{ open: boolean; setOpen: (open: boolean) => void }> = ({
  open,
  setOpen,
}) => {
  return (
    <div className={cx(styles.wrapper, { [styles.open]: open })} onClick={() => setOpen(!open)}>
      <div className={styles.bar1}></div>
      <div className={styles.bar2}></div>
      <div className={styles.bar3}></div>
    </div>
  )
}
