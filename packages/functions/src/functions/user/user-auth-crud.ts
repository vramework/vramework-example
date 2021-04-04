import { APIFunction, APIRoute } from '../../api'
import { exactlyOneResult } from '../../services/database/pg-utils'
import { UserNotFoundError } from '../../errors'
import { UpdateUserAuth } from '@databuilder/types/src/user'
import { JustID } from '@databuilder/types/src/generic'
import { Routes } from '@databuilder/types/src/routes'

export const getUserAuth: APIFunction<JustID, { email: string }> = async (services, { data }) => {
  const result = await services.database.query<{ email: string }>(
    `
        SELECT email
        FROM ${services.database.schema}.user_auth 
        WHERE id=$1
    `,
    [data.id],
  )
  return exactlyOneResult(result.rows, new UserNotFoundError())
}

export const patchUserAuth: APIFunction<UpdateUserAuth, void> = async (services, { data }) => {
  // TODO!
}

export const getUserAuthRoute: APIRoute<JustID, { email: string }> = {
  type: 'get',
  route: Routes.USER_AUTH,
  func: getUserAuth,
  schema: null,
}

export const patchUserAuthRoute: APIRoute<UpdateUserAuth, void> = {
  type: 'patch',
  route: Routes.USER_AUTH,
  func: patchUserAuth,
  schema: 'UpdateUserAuth',
}
