import { postgresMigrate } from '@vramework/backend-common/src/postgres-migrate'
import { AWSSecrets } from '@vramework/backend-common/src/services/secrets/aws-secrets'
import { config } from '@vramework-example/functions/src/config'
import pino from 'pino'

const migrate = async () => {
    const logger = pino()
    logger.level = 'error'
    const secrets = new AWSSecrets(config, logger)
    postgresMigrate(`${__dirname}/../sql`, await secrets.getPostgresCredentials())
}

migrate()