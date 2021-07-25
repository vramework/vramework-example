import { Config, Services, SingletonServices } from './api'
import pino from "pino"
import { JWTService } from '@vramework/core/dist/services/jwt-service'
import { AWSSecrets } from '@vramework/aws/dist/aws-secrets'
import { S3Content } from '@vramework/aws/dist/s3-content'
import { LocalContent } from '@vramework/core/dist/services/local-content'
import { DatabasePostgresPool } from '@vramework/postgres/dist/database-postgres-pool'
import { VrameworkSessionService } from '@vramework/core/dist/services/vramework-session-service'

import '@vramework-example/functions/generated/schemas'
import { Session } from 'inspector'
import { DatabasePostgresClient } from '@vramework/postgres/dist/database-postgres-client'
import { exactlyOneResult } from '@vramework/postgres/dist/database-utils'
import { CoreUserSession } from '@vramework/core/dist/user-session'

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

  const jwt = new JWTService<CoreUserSession>(async () => {
    const { rows: jwtSecrets } = await databasePool.query<any>('SELECT * FROM app."jwt_secret"')
    return jwtSecrets
  }, logger)
  promises.push(jwt.init())

  const sessionService = new VrameworkSessionService(jwt, async (apiKey: string) => {
    const result = await databasePool.query<CoreUserSession>('SELECT user_id, org_id FROM app."user_auth" WHERE api_key = $1', [apiKey])
    return exactlyOneResult(result.rows, new Error())
  })

  let content: LocalContent | S3Content
  if (process.env.NODE_ENV === 'production' || process.env.PRODUCTION_SERVICES) {
    content = new S3Content(config, logger, {} as any)
  } else {
    content = new LocalContent(config, logger)
  }

  const email = {
    sendGreedingCard: console.log
  }

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