import { Config } from '@databuilder/functions/src/api'
import * as dotenv from 'dotenv'

dotenv.config()
const { DOMAIN, PGHOST, PGPASSWORD, PGUSER, PGDATABASE } = process.env

if (!DOMAIN) {
  throw 'Cant init due to missing env keys'
}

export const config: Config = {
  domain: DOMAIN,
  authFlag: {
    required: true,
    value: 'secrets',
  },
  server: {
    port: 3000,
  },
  postgres: {
    user: PGUSER || 'postgres',
    host: PGHOST || 'localhost',
    password: PGPASSWORD || 'localhost',
    database: PGDATABASE || 'databuilder',
    schema: 'app',
  },
  secrets: {
  },
  cookie: {
    name: 'databuilder',
  }
}
