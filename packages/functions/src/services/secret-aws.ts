import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { Logger } from '@vramework/backend-common/src/services'
import { Config } from '../api'

export class AWSSecrets {
  private client: SecretsManagerClient

  constructor(_config: Config, private logger: Logger) {
    this.client = new SecretsManagerClient({ region: 'eu-central-1' })
  }

  public async getSecret(SecretId: string): Promise<string> {
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
