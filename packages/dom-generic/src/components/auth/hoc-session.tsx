import * as React from 'react'
import { useValidateUserSession } from '@databuilder/api/src/services/active-user-service'
import { useRouter } from 'next/router'
import { Loading } from '../loading/loading'

export const SessionHOC: React.FunctionComponent = ({ children }) => {
  const router = useRouter()
  const { error, loaded, logout } = useValidateUserSession()
  if (error || logout) {
    // This shouldn't use the router, since we want the stores to all refresh
    router.push('/login/')
    return null
  }
  if (!loaded) {
    return <Loading />
  }
  return <>{children}</>
}
