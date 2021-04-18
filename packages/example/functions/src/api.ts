
import { CoreConfig } from '@vramework/backend-common/src/config'
import { CoreServices } from '@vramework/backend-common/src/services'
import { CoreUserSession } from '@vramework/backend-common/src/user-session'

import { Email } from './services/email'
import { Slack } from './services/slack'
import { JWTManager } from './services/jwt-manager'
import { S3File } from './services/file-s3'
import { CoreAPIRoute } from '@vramework/backend-common/src/routes'
import { PGDatabase } from './services/database-postgres'
import { LocalSecretService } from './services/secret-local'

export type Config = CoreConfig & {
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
  slack: {
    hooks: {
      error: string | null
    }
  }
}

export type Services = CoreServices & {
  secrets: LocalSecretService
  email: Email
  database: PGDatabase
  slack: Slack
  jwt: JWTManager
  files: S3File
}

export type UserSession = CoreUserSession & {
  userId: string
}

export type APIFunction<In, Out> = (
  services: Services,
  { config, data, session }: { config: Config; data: In; session?: UserSession },
) => Promise<Out>

export type APIRoute<In, Out> = CoreAPIRoute<In, Out> & {
  func: APIFunction<In, Out>
}

export type APIRoutes = APIRoute<unknown, unknown>[]
