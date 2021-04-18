import { Config } from './api'

export const config: Config = {
  domain: process.env.DOMAIN || 'vramework.app',
  postgres: {
    user: 'postgres',
    host: 'localhost',
    password: 'password',
    database: 'vramework',
    schema: 'app',
  },
  server: {
    port: 4002,
  },
  secrets: {
    cloudfrontContentId: 'tf_cloudfront_sign_content_id',
    cloudfrontContentPrivateKey: 'tf_cloudfront_sign_content_key'
  },
  cookie: {
    name: 'vramework',
  },
  slack: {
    hooks: {
      error: null
    }  
  }
}
