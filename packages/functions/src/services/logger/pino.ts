import pino from 'pino'
import { Logger } from 'pino'
import { Slack } from '../notification/slack'

export class PinoLogger {
  private logger: Logger

  constructor(private slack: Slack) {
    this.logger = pino()
  }

  public debug(message: string) {
    this.logger.debug(message)
  }

  public info(message: string, ...args: any[]) {
    this.logger.info(message, ...args)
  }

  public warn(message: string, ...args: any[]) {
    this.logger.warn(message, ...args)
  }

  public error(message: string, error?: Error) {
    this.slack.notify(message)
    this.logger.error(message, error)
  }
}
