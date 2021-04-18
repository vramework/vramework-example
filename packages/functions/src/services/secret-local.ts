import { Logger } from "@vramework/backend-common/src/services"
import { Config } from "../api"

export class LocalSecretService {
  constructor(_config: Config, private logger: Logger) {
  }

  public async getSecret (key: string): Promise<string> {
    const value = process.env[key]
    if (value) {
      return value
    }
    this.logger.error(`Secret Not Found: ${key}`)
    return ''
  }
}
