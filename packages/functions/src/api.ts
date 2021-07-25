import { Logger } from 'pino'

import { CoreConfig } from '@vramework/core/dist/config'
import { CoreSingletonServices } from '@vramework/core/dist/services'
import { DatabasePostgresClient } from '@vramework/postgres/dist/database-postgres-client'
import { DatabasePostgresPool } from '@vramework/postgres/dist/database-postgres-pool'
import { JWTService } from '@vramework/core/dist/services/jwt-service'
import { CoreUserSession } from '@vramework/core/dist/user-session'
import { ContentService } from '@vramework/core/dist/services'
import { LocalSecretService } from '@vramework/core/dist/services/local-secrets'

export type Config = CoreConfig & {
  awsRegion: string
}

export type UserSession = CoreUserSession & {
  isPaidMember: boolean
}

export type SingletonServices = CoreSingletonServices & {
  secrets: LocalSecretService
  content: ContentService
  databasePool: DatabasePostgresPool
  logger: Logger
  jwt: JWTService<UserSession>
  config: Config
}

export interface Email {
    sendEmail: (args: { template: string, from: string, to: string, body: string }) => Promise<boolean>
}

export type Services = SingletonServices & {
  email: Email
  database: DatabasePostgresClient<string>
}

export type APIFunction<In, Out> = (services: Services, data: In, session: UserSession) => Promise<Out>
export type APIFunctionSessionless<In, Out> = (services: Services, data: In, session: Partial<UserSession>) => Promise<Out>

export type APIPermission<Data> = (services: Services, data: Data, session: UserSession) => Promise<boolean>

export type APIRoute<In, Out> = {
  type: 'post' | 'get' | 'delete' | 'patch' | 'head'
  route: string
  schema: string | null
  requiresSession?: undefined | true
  func: APIFunction<In, Out>,
  permissions?: Record<string, APIPermission<In>[] | APIPermission<In>>
} | {
  type: 'post' | 'get' | 'delete' | 'patch' | 'head'
  route: string
  schema: string | null
  requiresSession: false
  func: APIFunctionSessionless<In, Out>
}

export type APIRoutes = Array<APIRoute<any, any>>