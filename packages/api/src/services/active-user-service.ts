import { User, UpdateUserAuth, UserInvitationConfirm } from '@databuilder/types/src/user'
import { logoutRest, updateUserAuthRest, validateSessionRest, acceptInvitationRest } from '../rest/user'
import { EventEmitter } from 'eventemitter3'
import { useCallback, useState } from 'react'
import useAsyncEffect from 'use-async-effect'
import { useServiceHook } from '../service-hook'

export enum ActiveUserServiceEvents {
  CHANGE = 'CHANGE',
  LOADED = 'LOADED',
  LOGOUT = 'LOGOUT',
}

export class ActiveUserService extends EventEmitter {
  private user: User | undefined = undefined
  private loading = false

  public isValid() {
    return !!this.user
  }

  public get(): User | undefined {
    return this.user
  }

  public async acceptInvitation(data: UserInvitationConfirm) {
    this.user = await acceptInvitationRest(data)
  }

  public async logout() {
    await logoutRest()
    this.user = undefined
    this.emit(ActiveUserServiceEvents.LOGOUT)
  }

  public async validateSession() {
    if (this.loading) {
      return await new Promise((resolve) => this.on(ActiveUserServiceEvents.LOADED, resolve))
    }

    if (!this.user) {
      this.loading = true
      this.user = await validateSessionRest()
      this.emit(ActiveUserServiceEvents.LOADED, this.user)
    } else {
      this.emit(ActiveUserServiceEvents.LOADED, this.user)
    }
  }

  public async updateAuth(data: UpdateUserAuth) {
    if (!this.user) {
      throw 'User not loaded'
    }
    await updateUserAuthRest(this.user?.id, data)
  }
}

export const activeUserService = new ActiveUserService()

export const useLogout = () => {
  return useCallback(async () => {
    await activeUserService.logout()
  }, [])
}

export const useActiveUser = () => {
  const [user, setUser] = useState(activeUserService.get())
  useServiceHook(activeUserService, ActiveUserServiceEvents.LOADED, (user) => setUser(user))
  if (!user) {
    throw 'user not loaded'
  }
  return { ...user, firstSession: true }
}

export const useValidateUserSession = () => {
  const [error, setError] = useState<boolean>(false)
  const [logout, setLogout] = useState<boolean>(false)
  const [loaded, setLoaded] = useState<boolean>(activeUserService.isValid())
  useServiceHook(activeUserService, ActiveUserServiceEvents.LOGOUT, () => setLogout(true))
  useServiceHook(activeUserService, ActiveUserServiceEvents.LOADED, () => setLoaded(true))
  useAsyncEffect(async (isMounted) => {
    if (!loaded) {
      try {
        await activeUserService.validateSession()
        setLoaded(true)
      } catch (e) {
        isMounted() && setError(e)
      }
    }
  }, [])
  return { loaded, error, logout }
}
