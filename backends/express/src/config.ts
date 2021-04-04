import { Config } from '../../../packages/functions/src/api'

export const config: Config = {
  domain: process.env.DOMAIN || 'databuilder.app',
  authFlag: {
    required: true,
    value: 'secrets',
  },
  postgres: {
    user: 'postgres',
    host: 'localhost',
    password: 'password',
    database: 'databuilder',
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
    name: 'databuilder',
  },
  slack: {
    hooks: {
      error: null
    }  
  }
}
