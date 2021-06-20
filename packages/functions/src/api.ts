import { CoreConfig } from '@vramework/backend-common/src/config'
import { CoreSingletonServices } from '@vramework/backend-common/src/services'
import { CoreAPIPermission } from '@vramework/backend-common/src/routes'
import { ContentService } from '@vramework/backend-common/src/services/content/content'
import { DatabasePostgresClient } from '@vramework/backend-common/src/services/database/database-postgres-client'
import { DatabasePostgresPool } from '@vramework/backend-common/src/services/database/database-postgres-pool'
import { EmailService } from '@vramework/backend-common/src/services/email/email'
import { JWTManager } from '@vramework/backend-common/src/services/jwt/jwt-manager'
import { SecretService } from '@vramework/backend-common/src/services/secrets/secrets'
import { Logger } from 'pino'
import { CoreUserSession } from '../../../vramework/backend-common/src/user-session'

export type Config = CoreConfig & {
  awsRegion: string
}

export type SingletonServices = CoreSingletonServices & {
  secrets: SecretService
  email: EmailService
  content: ContentService
  databasePool: DatabasePostgresPool
  logger: Logger
  jwt: JWTManager<CoreUserSession>
  config: Config
}

export type Services = SingletonServices & {
  database: DatabasePostgresClient<string>
}

export type APIFunction<In, Out> = (services: Services, data: In, session: CoreUserSession) => Promise<Out>
export type APIFunctionSessionless<In, Out> = (services: Services, data: In, session: Partial<CoreUserSession> & { orgId: string }) => Promise<Out>

export type APIRoute<In, Out> = {
  type: 'post' | 'get' | 'delete' | 'patch' | 'head'
  route: string
  schema: string | null
  requiresSession?: undefined | true
  func: APIFunction<In, Out>,
  permissions?: Record<string, CoreAPIPermission<In>[] | CoreAPIPermission<In>>
} | {
  type: 'post' | 'get' | 'delete' | 'patch' | 'head'
  route: string
  schema: string | null
  requiresSession: false
  func: APIFunctionSessionless<In, Out>
}

export type APIRoutes = Array<APIRoute<any, any>>