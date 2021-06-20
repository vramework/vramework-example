import { Config, Services, SingletonServices } from './api'
import pino from "pino"
import { JWTManager } from '@vramework/backend-common/src/services/jwt/jwt-manager'
import { AWSSecrets } from '@vramework/backend-common/src/services/secrets/aws-secrets'
import { S3Content } from '@vramework/backend-common/src/services/content/s3-content'
import { LocalContent } from '@vramework/backend-common/src/services/content/local-content'
import { LocalEmail } from '@vramework/backend-common/src/services/email/local-email'
import { DatabasePostgresPool } from '@vramework/backend-common/src/services/database/database-postgres-pool'
import { VrameworkSessionService } from '@vramework/backend-common/src/services/session/vramework-session-service'

import '@enjamon/api/generated/schemas'
import { ContentService } from '@vramework/backend-common/src/services/content/content'
import { Session } from 'inspector'
import { DatabasePostgresClient } from '@vramework/backend-common/src/services/database/database-postgres-client'
import { exactlyOneResult } from '@vramework/backend-common/src/services/database/database-utils'
import { CoreUserSession } from '../../../vramework/backend-common/src/user-session'

export const setupServices = async (config: Config): Promise<SingletonServices> => {
  const logger = pino()
  if (config.logger.level) {
    logger.level = config.logger.level
  }

  const promises: Array<Promise<void>> = []

  const secrets = new AWSSecrets(config, logger)

  const pgConfig = await secrets.getPostgresCredentials()
  const databasePool = new DatabasePostgresPool(pgConfig, logger)
  await databasePool.init()

  const jwt = new JWTManager<CoreUserSession>(async () => {
    const { rows: jwtSecrets } = await databasePool.query<any>('SELECT * FROM app."jwt_secret"')
    return jwtSecrets
  }, logger)
  promises.push(jwt.init())

  const sessionService = new VrameworkSessionService(jwt, async (apiKey: string) => {
    const result = await databasePool.query<CoreUserSession>('SELECT user_id, org_id FROM app."user_auth" WHERE api_key = $1', [apiKey])
    return exactlyOneResult(result.rows, new Error())
  })

  let content: ContentService
  if (process.env.NODE_ENV === 'production' || process.env.PRODUCTION_SERVICES) {
    content = new S3Content(config, logger)
    await content.init(secrets)
  } else {
    content = new LocalContent(config, logger)
  }

  const email = new LocalEmail(logger)

  await Promise.all(promises)
  
  const singletonServices = { config, content, logger, secrets, databasePool, sessionService, jwt, email }

  const createSessionServices = (singletonServices: SingletonServices, session: Session): Services => {
    return {
      ...singletonServices,
      database: new DatabasePostgresClient(singletonServices.databasePool, logger)
    } as never as Services
  }

  return { ...singletonServices, createSessionServices } as never as SingletonServices
}