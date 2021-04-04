import * as React from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import '@databuilder/dom/styles/normalize.css'
import '@databuilder/dom/styles/webapp-global.css'
import '@databuilder/dom/styles/font.css'
import Head from 'next/head'
import intl from 'react-intl-universal'
import { inferAPIPrefix } from '@databuilder/api/src/rest'
import { I18nContext } from '@databuilder/api/src/contexts/i18n'
import { Routes, RoutesContext } from '@databuilder/api/src/contexts/routes'
import { useSetupI18n } from '@databuilder/api/src/hooks/setup-i18n'
import { useThemeColors } from '@databuilder/api/src/hooks/theme-colors'
import { ModalProvider } from '@databuilder/dom/src/components/modal/modal'
import '@iconscout/unicons/css/line.css'

import en from '../../public/i18n/en.locale.json'
import enFields from '../../public/i18n/en-fields.locale.json'
import de from '../../public/i18n/de.locale.json'
import deFields from '../../public/i18n/de-fields.locale.json'
import { useFamily } from '@databuilder/api/src/services/family-service'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const MyApp: React.FunctionComponent<{ Component: React.FunctionComponent; pageProps: any }> = ({
  Component,
  pageProps,
}) => {
  inferAPIPrefix()
  useSetupI18n({ en: { ...en, ...enFields }, de: { ...de, ...deFields } })
  const themeColors = useThemeColors()

  const family = useFamily()
  const appRoutes = React.useMemo(() => {
    const routes: Routes = [
      {
        route: '/dashboard',
        title: 'Dashboard',
        subTitle: 'Dashboard',
        icon: 'uil uil-dashboard',
      },
    ]
    return routes
  }, [family])

  const [menuOpen, setMenuOpen] = React.useState<boolean>(false)
  const router = useRouter()
  useEffect(() => {
    router.events.on('routeChangeComplete', () => setMenuOpen(false))
  }, [router.events])

  return (
    <>
      <Head>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <title>Data Builder</title>
        <style>{themeColors}</style>
      </Head>
      <RoutesContext.Provider value={{ routes: appRoutes, menuOpen, setMenuOpen }}>
        <I18nContext.Provider value={intl as any}>
          <ModalProvider>
            <Component {...pageProps} />
          </ModalProvider>
        </I18nContext.Provider>
      </RoutesContext.Provider>
    </>
  )
}

export default MyApp
