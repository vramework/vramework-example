import { Services } from '../api'
import { exactlyOneResult } from '../services/database/pg-utils'
import { compare as compareHash, genSalt, hash as createHash } from 'bcryptjs'
import { InvalidPasswordError, MissingPasswordError } from '../errors'
import * as DB from '@databuilder/types/generated/db-types'
import { UserAlreadyExists } from '../errors'
import { UserSignup, UserSignupResult, UserInvitation } from '@databuilder/types/src/user'
import { v4 as uuid } from 'uuid'
import { Role } from '@databuilder/types/generated/db-types'
import { validatePassword } from '../password-check'

export const validateUser = async (
  { database }: Services,
  user: string,
  password: string,
  role: Role,
  requiredEmailConfirmation: boolean = false
): Promise<string> => {
  const result = await database.query<Pick<DB.UserAuth, 'passwordHash' | 'id'>>(
    `
      SELECT id, password_hash
      FROM ${database.schema}."user_auth"
      WHERE "user_auth".email=$1 and role=$2 ${requiredEmailConfirmation ? 'and email_confirmed_at is not null' : ''}
    `,
    [user.toLowerCase(), role],
  )
  const { id, passwordHash } = exactlyOneResult(result.rows, new InvalidPasswordError())
  if (!passwordHash) {
    throw new MissingPasswordError()
  }
  const isValid = await compareHash(password, passwordHash)
  if (!isValid) {
    throw new InvalidPasswordError()
  }
  return id
}

export const insertUserAuth = async (
  data: UserSignup & { role: DB.Role },
  services: Services,
): Promise<{ user: UserSignupResult; sendConfirmEmail: () => void }> => {
  if (!validatePassword(data.password)) {
    throw new InvalidPasswordError()
  }

  const salt = await genSalt()
  const passwordHash = await createHash(data.password, salt)

  const expiresIn = 1 * 24 * 60 * 60
  const { hash: emailConfirmationHash } = await services.jwt.encodeJWTHash(expiresIn)

  try {
    const result = await services.database.query<{ id: string }>(
      `
        INSERT INTO ${services.database.schema}."user_auth"
        (email, email_confirmation_hash, password_hash, salt, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
      [data.email.toLowerCase(), emailConfirmationHash, passwordHash, salt, data.role],
    )
    const { id } = exactlyOneResult(result.rows, new UserAlreadyExists())
    const jwt = await services.jwt.encodeSessionAsync({ userId: id, role: data.role })
    return {
      user: { id, jwt },
      sendConfirmEmail: () => services.email.sendConfirmEmail(data.role, data.email, emailConfirmationHash),
    }
  } catch (e) {
    if (e.constraint === 'user_auth_email_key') {
      throw new UserAlreadyExists()
    }
    throw e
  }
}

export const inviteUser = async (
  data: UserInvitation & { role: DB.Role; invitedBy: string },
  services: Services,
): Promise<{ hash: string; userId: string }> => {
  const expiresIn = 1 * 24 * 60 * 60
  const { hash } = await services.jwt.encodeJWTHash(expiresIn)

  const salt = await genSalt()
  const passwordHash = await createHash(uuid(), salt)

  try {
    const result = await services.database.query<{ hash: string; id: string }>(
      `
        INSERT INTO ${services.database.schema}."user_auth"
        (role, email, invitation_hash, invitation_made_by, invitation_made_at, salt, password_hash)
        VALUES ($2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
      [data.role, data.email.toLowerCase(), hash, data.invitedBy, new Date(), salt, passwordHash],
    )
    const { id } = exactlyOneResult(result.rows, new UserAlreadyExists())
    return { hash, userId: id }
  } catch (e) {
    if (e.constraint === 'user_auth_email_key') {
      throw new UserAlreadyExists()
    }
    throw e
  }
}
