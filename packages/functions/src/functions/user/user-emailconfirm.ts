import { Routes } from '@databuilder/types/src/routes'
import { UserEmailConfirm } from '@databuilder/types/src/user'
import { APIFunction, APIRoute } from '../../api'
import { ResetHashExpiredError, HashNotFoundError } from '../../errors'
import { exactlyOneResult } from '../../services/database/pg-utils'

const userEmailConfirm: APIFunction<UserEmailConfirm, void> = async ({ database, jwt }, { data }) => {
  try {
    await jwt.verifyJWTHash(data.hash)
  } catch (e) {
    throw new ResetHashExpiredError()
  }
  const result = await database.query(
    `
    UPDATE ${database.schema}.user_auth
    SET (email_confirmation_hash, email_confirmed_at) = (null, $1)
    WHERE email_confirmation_hash=$2
    RETURNING id
  `,
    [new Date(), data.hash],
  )
  exactlyOneResult(result.rows, new HashNotFoundError())
}

export const route: APIRoute<UserEmailConfirm, void> = {
  type: 'post',
  route: Routes.USER_CONFIRM_EMAIL,
  func: userEmailConfirm,
  schema: 'UserEmailConfirm',
  requiresSession: false,
}
