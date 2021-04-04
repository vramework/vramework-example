import { Routes } from '@databuilder/types/src/routes'
import {
  User,
  UpdateUserAuth,
  UserForgotPassword,
  UserPasswordReset,
  UserInvitationConfirm,
} from '@databuilder/types/src/user'
import { post, get, patch } from '../rest'

export const validateSessionRest = async (): Promise<User> => {
  return await get<User>(Routes.USER_VALIDATE_SESSION)
}

export const acceptInvitationRest = async (data: UserInvitationConfirm): Promise<User> => {
  return await post<User>(Routes.USER_INVITATION_ACCEPT, data)
}

export const forgotPasswordRest = async (data: UserForgotPassword): Promise<void> => {
  return await post(Routes.USER_FORGOT_PASSWORD, data, false)
}

export const resetPasswordRest = async (data: UserPasswordReset): Promise<void> => {
  return await post(Routes.USER_RESET_PASSWORD, data, false)
}

export const getUserRest = async (id: string): Promise<User> => {
  return await get(Routes.USER, { id })
}

export const updateUserRest = async (id: string, data: Partial<User>): Promise<void> => {
  return await patch(`${Routes.USER}/${id}`, data)
}

export const getUserAuthRest = async (id: string): Promise<void> => {
  return await get(Routes.USER_AUTH.replace(':id', id))
}

export const updateUserAuthRest = async (id: string, data: UpdateUserAuth): Promise<void> => {
  return await patch(`${Routes.USER_AUTH}/${id}`, data)
}

export const logoutRest = async (): Promise<void> => {
  return await get(Routes.USER_LOGOUT, {}, false)
}

export const confirmEmailRest = async (hash: string): Promise<void> => {
  await post(Routes.USER_CONFIRM_EMAIL, { hash }, false)
}
