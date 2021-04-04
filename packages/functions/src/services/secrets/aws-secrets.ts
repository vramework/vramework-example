import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { Config } from '../../api'
import { PinoLogger } from '../logger/pino'
import { Secrets } from './secrets'

export class AWSSecrets implements Secrets {
  private client: SecretsManagerClient

  constructor(private config: Config, private logger: PinoLogger) {
    this.client = new SecretsManagerClient({ region: 'eu-central-1' })
  }

  public async getCloudfrontContentKey(): Promise<{ id: string; key: string }> {
    const id = await this.getSecret(this.config.secrets.cloudfrontContentId)
    const key = await this.getSecret(this.config.secrets.cloudfrontContentPrivateKey)
    return { id, key }
  }

  private async getSecret(SecretId: string) {
    const result = await this.client.send(new GetSecretValueCommand({ SecretId }))
    if (result.SecretString) {
      try {
        return JSON.parse(result.SecretString)
      } catch (e) {
        return result.SecretString
      }
    } else {
      this.logger.error(`FATAL: Error finding secret ${SecretId}`)
      throw 'FATAL: Error finding secret!'
    }
  }
}
