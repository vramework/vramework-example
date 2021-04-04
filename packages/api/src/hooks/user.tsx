import { UpdateUserAuth, UserAuth } from '@databuilder/types/src/user'
import { getUserAuthRest, updateUserAuthRest } from '../rest/user'
import { useGenericGetUpdate } from './generic-crud'

export const useUserAuth = (id: string) => {
  return useGenericGetUpdate<UpdateUserAuth & UserAuth>(id, 'userAuth', getUserAuthRest, updateUserAuthRest, {
    currentPassword: '',
    newPassword: '',
  })
}
