import { Config } from './api'

export const config: Config = {
  awsRegion: 'us-east-1',
  content: {
    localFileUploadPath: `${__dirname}/../../../.uploads`
  },
  logger: {
    level: 'info'
  },
  sql: {
    database: 'vramework',
    directory: ''
  },
  domain: process.env.DOMAIN || 'vramework.io',
  server: {
    port: 4002,
  }
}
