import * as commander from 'commander'
import { AppServer } from '../src/express-server'
import pino from 'pino'

// work-around for:
// TS4023: Exported variable 'command' has or is using name 'local.Command'
// from external module "node_modules/commander/typings/index" but cannot be named.
export type Command = commander.Command

function action(): void {
  try {
    const appServer = new AppServer({}, pino())
    appServer.init().then(() => appServer.start())
    process.removeAllListeners('SIGINT').on('SIGINT', () => {
      appServer.stop()
    })
  } catch (err) {
    console.error(err.toString())
    process.exit(1)
  }
}

export const start = (program: Command): void => {
  program.command('start').description('start the express server').action(action)
}
