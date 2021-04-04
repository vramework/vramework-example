import { useI18n } from '@databuilder/api/src/contexts/i18n'
import { ParentRoute, Route, useRoutes } from '@databuilder/api/src/contexts/routes'
import { useLogout } from '@databuilder/api/src/services/active-user-service'
import { useRouter } from 'next/router'
import * as React from 'react'
import styles from './sidebar.module.css'
import cx from 'classnames'

function isParentRoute(route: Route | ParentRoute): route is ParentRoute {
  return (route as ParentRoute).routes !== undefined
}

const LeafRoute: React.FunctionComponent<Route> = ({ route, title, icon, disabled }) => {
  const router = useRouter()
  return (
    <li
      className={cx(styles.item, {
        [styles.active]: window.location.href.includes(route),
        [styles.disabled]: disabled,
      })}
      onClick={() => !disabled && router.push(route)}
    >
      {icon && <i className={icon} />}
      {title}
    </li>
  )
}

const MobileLeafRoute: React.FunctionComponent<Route> = ({ title, subTitle, icon, route }) => {
  const router = useRouter()
  return (
    <li
      className={cx(styles.mobile_item, {
        [styles.active]: window.location.href.includes(route),
      })}
      onClick={() => router.push(route)}
    >
      <h3>{title}</h3>
      <p>{subTitle}</p>
      {icon && <i className={icon} />}
    </li>
  )
}

export const SideBar: React.FunctionComponent = () => {
  const i18n = useI18n()
  const logout = useLogout()
  const { routes, menuOpen } = useRoutes()

  const Desktop = (
    <nav className={styles.desktop_navigation}>
      <ul className={styles.items}>
        {routes.map((route) => {
          if (isParentRoute(route)) {
            return (
              <li className={styles.item_parent} key={route.title}>
                <div>{route.title}</div>
                <ul key={route.title} className={styles.sub_items}>
                  {route.routes.map((route) => (
                    <LeafRoute key={route.route} {...route} />
                  ))}
                </ul>
              </li>
            )
          } else {
            return <LeafRoute key={route.route} {...route} />
          }
        })}
        <li className={styles.item} onClick={logout}>
          <i className="uil uil-signout" />
          {i18n.get('nav.logout')}
        </li>
      </ul>
    </nav>
  )

  let Mobile: React.ReactElement | null = (
    <nav className={styles.mobile_navigation}>
      <ul className={styles.mobile_items}>
        {routes.map((route) => {
          if (isParentRoute(route)) {
            return route.routes.map((route) => <MobileLeafRoute key={route.route} {...route} />)
          } else {
            return <MobileLeafRoute key={route.route} {...route} />
          }
        })}
      </ul>
    </nav>
  )

  if (menuOpen !== true) {
    Mobile = null
  }

  return (
    <>
      {Desktop}
      {Mobile}
    </>
  )
}
