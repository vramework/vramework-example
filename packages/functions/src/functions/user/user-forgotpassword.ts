import { UserForgotPassword } from '@databuilder/types/src/user'
import { APIFunction, APIRoute } from '../../api'
import * as DB from '@databuilder/types/generated/db-types'
import { Routes } from '@databuilder/types/src/routes'

const userForgotPassword: APIFunction<UserForgotPassword, void> = async (
  { database, email: emailService, logger, jwt },
  { data },
) => {
  const result = await database.query<Pick<DB.UserAuth, 'id' | 'email' | 'role'>>(
    `
        SELECT id, email, role
        FROM ${database.schema}."user_auth"
        WHERE email=$1
      `,
    [data.email.toLowerCase()],
  )
  if (result.rowCount === 0) {
    logger.warn(`User reset attempted on non existant email: ${data.email}`)
    // Returning blank since password reset should always be opaque
    return
  }
  const { id, email, role } = result.rows[0]
  if (!email) {
    logger.warn(`User reset attempted on an account with an email`)
    // Returning blank since password reset should always be opaque
    return
  }
  const expiresIn = 1 * 24 * 60 * 60
  const { hash, expiresAt } = await jwt.encodeJWTHash(expiresIn)
  await database.query(
    `
        UPDATE ${database.schema}.user_auth
        SET (reset_password_hash, reset_password_expiry) = ('${hash}', $1)
        WHERE id = $2
      `,
    [expiresAt, id],
  )
  await emailService.sendResetPassword(role, email, '', hash)
}

export const route: APIRoute<UserForgotPassword, void> = {
  type: 'post',
  route: Routes.USER_FORGOT_PASSWORD,
  func: userForgotPassword,
  schema: 'UserForgotPassword',
  requiresSession: false,
}
