import { Secrets } from './services/secrets/secrets'
import { Email } from './services/email/email'
import { PGDatabase } from './services/database/pg-database'
import { Slack } from './services/notification/slack'
import { PinoLogger } from './services/logger/pino'
import { JWTManager } from './services/jwt/jwt-manager'
import * as DB from '@databuilder/types/generated/db-types'

export interface Config {
  domain: string
  authFlag: {
    required: boolean
    value: string
  }
  server: {
    port: number
  }
  postgres: {
    user: string
    host: string
    password: string
    port?: number
    database: string
    schema: string
  }
  secrets: {
    cloudfrontContentId: string
    cloudfrontContentPrivateKey: string
  }
  cookie: {
    name: string
  },
  slack: {
    hooks: {
      error: string | null
    }
  }
}

export interface Services {
  logger: PinoLogger
  secrets: Secrets
  email: Email
  database: PGDatabase
  slack: Slack
  jwt: JWTManager
  files: S3Files
}

export interface UserSession {
  role: DB.Role
  userId: string
  familyId?: string
  families?: string[]
}

export type APIFunction<In, Out> = (
  services: Services,
  { config, data, session }: { config: Config; data: In; session?: UserSession },
) => Promise<Out>
export interface APIRoute<In, Out> {
  type: 'post' | 'get' | 'delete' | 'patch' | 'head'
  route: string
  func: APIFunction<In, Out>
  schema: string | null
  requiresSession?: false
  requiresAuthFlag?: true
  requiresRole?: DB.Role
  requiresFamilyPermissions?: boolean
}

const verifyRoutes = (routes: APIRoute<any, any>[]) => {
  const paths = new Map()
  for (const type of ['get', 'patch', 'delete', 'post', 'head']) {
    paths.set(type, new Set<string[]>())
  }
  routes.forEach((route) => {
    const routes = paths.get(route.type)
    if (routes.has(route.route)) {
      throw `Duplicate route: ${JSON.stringify(route)}`
    }
    routes.add(route.route)
  })
}


import { route as userForgotPasswordRoute } from './functions/user/user-forgotpassword'
import { route as userPasswordReset } from './functions/user/user-passwordreset'
import { route as userValidateSession } from './functions/user/user-validatesession'
import { route as userEmailConfirmRoute } from './functions/user/user-emailconfirm'
import { getUserAuthRoute, patchUserAuthRoute } from './functions/user/user-auth-crud'

import { S3Files } from './services/file/s3-files'
import { uploadImageRoute } from './functions/image-upload'

export const getRoutes = (): APIRoute<any, any>[] => {
  const routes = [
    userForgotPasswordRoute,
    userPasswordReset,
    userValidateSession,
    userEmailConfirmRoute,
    getUserAuthRoute,
    patchUserAuthRoute,
    uploadImageRoute,
  ]
  verifyRoutes(routes)
  return routes
}
