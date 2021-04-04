import { PinoLogger } from '../logger/pino'
import { Secrets } from '../secrets/secrets'

export class Email {
  constructor(private domain: string, private logger: PinoLogger) {
  }

  public async init(secrets: Secrets) {
  }

  public async sendConfirmEmail(role: DB.Role, email: string, hash: string) {
    this.logger.info(`sending inquiry response to ${email}`)
  }

  public async sendResetPassword(role: DB.Role, email: string, name: string, hash: string) {
    this.logger.info(`sending reset password email to ${email} with name ${name} and hash ${hash}`)
  }

  public async sendPasswordResetCompleted(email: string, name: string) {
    this.logger.info(`sending email to ${email} with name ${name} to indicate password was changed`)
  }
}
