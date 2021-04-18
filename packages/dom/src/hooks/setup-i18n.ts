import * as React from 'react'
import intl from 'react-intl-universal'
import { useRouter } from 'next/router'

export const useSetupI18n = (locales: Record<string, Record<string, string>>) => {
  const router = useRouter()
  const firstLoad = React.useRef<boolean>(true)
  if (firstLoad.current) {
    const currentLocale = router.locale || 'en'

    intl.init({
      currentLocale,
      locales,
    })

    // i18n missing floods console
    console.warn = () => { }

    const defaultGet = intl.get.bind(intl)
    intl.get = (key: string, args?: any) => {
      if (typeof window !== 'undefined' && window.location.href.includes('debugI18n')) {
        return '.'
      }
      const value = defaultGet(key.toLowerCase(), args)
      return value ? value : `%${key}%`
    }
      ; (intl as any).getOptional = (key: string, args?: any) => {
        return defaultGet(key.toLowerCase(), args)
      }
    firstLoad.current = false
  }
}
