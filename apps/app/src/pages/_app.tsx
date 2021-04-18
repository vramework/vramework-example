import * as React from 'react'
import Head from 'next/head'
import intl from 'react-intl-universal'
import { inferAPIPrefix } from '@vramework/api/src/rest'
import { I18nContext } from '@vramework/api/src/contexts/i18n'

const MyApp: React.FunctionComponent<{ Component: React.FunctionComponent; pageProps: any }> = ({
  Component,
  pageProps,
}) => {
  inferAPIPrefix()

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
        <title>Vramework</title>
      </Head>
      <I18nContext.Provider value={intl as any}>
        <Component {...pageProps} />
      </I18nContext.Provider>
    </>
  )
}

export default MyApp
