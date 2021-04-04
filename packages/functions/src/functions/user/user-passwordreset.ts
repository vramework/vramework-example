import { Routes } from '@databuilder/types/src/routes'
import { UserPasswordReset } from '@databuilder/types/src/user'
import { genSalt, hash as createHash } from 'bcryptjs'
import { APIFunction, APIRoute } from '../../api'
import { InvalidPasswordError, ResetHashExpiredError, HashNotFoundError } from '../../errors'
import { validatePassword } from '../../password-check'
import { exactlyOneResult } from '../../services/database/pg-utils'

const userPasswordReset: APIFunction<UserPasswordReset, void> = async ({ database, jwt }, { data }) => {
  try {
    await jwt.verifyJWTHash(data.hash)
  } catch (e) {
    throw new ResetHashExpiredError()
  }
  if (!validatePassword(data.password)) {
    throw new InvalidPasswordError()
  }
  const salt = await genSalt()
  const passwordHash = await createHash(data.password, salt)
  const result = await database.query(
    `
    UPDATE ${database.schema}.user_auth
    SET (salt, password_hash, reset_password_hash, reset_password_expiry, password_last_updated_at) = ($1, $2, null, null, $3)
    WHERE reset_password_hash=$4
    RETURNING id
  `,
    [salt, passwordHash, new Date(), data.hash],
  )
  // TODO: Send Email
  exactlyOneResult(result.rows, new HashNotFoundError())
}

export const route: APIRoute<UserPasswordReset, void> = {
  type: 'post',
  route: Routes.USER_RESET_PASSWORD,
  func: userPasswordReset,
  schema: 'UserPasswordReset',
  requiresSession: false,
}
