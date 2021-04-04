import { createContext, useContext } from 'react'

export type GetI18n = (key: string, variables?: Record<string, any>) => string
export type GetOptionalI18n = (key: string, variables?: Record<string, any>) => undefined

export const I18nContext = createContext<{ get: GetI18n, getOptional: GetOptionalI18n }>({
  get: (key: string) => `$_${key}_$`,
  getOptional: (key: string) => undefined
})

export const useI18n = () => {
  return useContext(I18nContext)
}
