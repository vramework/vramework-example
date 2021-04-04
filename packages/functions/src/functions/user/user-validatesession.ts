import { UserAuth } from '@databuilder/types/generated/db-types'
import { JustID } from '@databuilder/types/src/generic'
import { Routes } from '@databuilder/types/src/routes'
import { APIFunction, APIRoute } from '../../api'
import { EmployeeNotFoundError, UserNotFoundError } from '../../errors'
import { exactlyOneResult } from '../../services/database/pg-utils'

const userValidateSession: APIFunction<void, JustID> = async ({ database }, { session }) => {
  const result = await database.query<UserAuth>(
    `
    SELECT id, role
    FROM ${database.schema}.user_auth
    WHERE id = $1
  `,
    [session!.userId],
  )
  const user = exactlyOneResult(result.rows, new UserNotFoundError())
  if (user.role === 'employee') {
    const result = await database.query<JustID>(
      `
      SELECT id as employee_id
      FROM ${database.schema}.employee
      WHERE user_id = $1
    `,
      [user.id],
    )
    const employee = exactlyOneResult(result.rows, new EmployeeNotFoundError())
    return { ...user, ...employee }
  }
  return user
}

export const route: APIRoute<void, JustID> = {
  type: 'get',
  route: Routes.USER_VALIDATE_SESSION,
  func: userValidateSession,
  schema: null,
}
