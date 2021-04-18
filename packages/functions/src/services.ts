import { Config, Services } from "./api"
import { PGDatabase } from "./services/database-postgres"
import { S3File } from "./services/file-s3"
import { PinoLogger } from "./services/pino"
import { Slack } from "./services/slack"
import { LocalSecretService } from "./services/secret-local"
import { JWTManager } from "./services/jwt-manager"
import { Permissions } from "./services/permissions"
import { Email } from "./services/email"

export const setupServices = async (config: Config): Promise<Services> => {
    console.time('Setup Services')
    const slack = new Slack(config)
    const logger = new PinoLogger(slack) as any

    const promises: Array<Promise<void>> = []

    const secrets = new LocalSecretService(config, logger)

    const database = new PGDatabase(config, logger)
    await database.init()

    const jwt = new JWTManager(database, logger)
    promises.push(jwt.init())

    const files = new S3File(config, logger)
    promises.push(files.init(secrets))

    const permissions = new Permissions()
    const email = new Email()

    await Promise.all(promises)

    console.timeEnd('Setup Services')
    
    return { files, logger, secrets, database, slack, jwt, permissions, email }
  }