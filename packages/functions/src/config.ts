import { Config } from './api'

export const config: Config = {
  awsRegion: 'us-east-1',
  content: {
    localFileUploadPath: ''
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
  },
  secrets: {
    cloudfrontContentId: 'tf_cloudfront_sign_content_id',
    cloudfrontContentPrivateKey: 'tf_cloudfront_sign_content_key',
    postgresCredentials: 'tf_postgres_credentials'
  }
}
