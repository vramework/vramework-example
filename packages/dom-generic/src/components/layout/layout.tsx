import * as React from 'react'
import { Footer } from './footer'
import { Header } from './header'
import { SideBar } from './sidebar'
import styles from './layout.module.css'

export const Layout: React.FunctionComponent = ({
  children,
}) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <SideBar />
        <div className={styles.content_wrapper}>
          <div className={styles.content}>{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
