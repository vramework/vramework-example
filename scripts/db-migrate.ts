import * as dotenv from 'dotenv'
import { createDb, migrate } from 'postgres-migrations'

dotenv.config({
  path: `${__dirname}/../backends/serverless/.env`,
})
const { PGUSER, PGHOST, PGPASSWORD, PGPORT, PGDATABASE } = process.env

console.log(`
  Connecting to postgres with:
  - HOST: ${PGHOST}
  - USER: ${PGUSER}
  - DB: ${PGDATABASE}
  - PASSWORD: ${PGPASSWORD?.substr(0, 2)}
`)

async function dbmigrate() {
  try {
    const dbConfig = {
      user: PGUSER || 'postgres',
      host: PGHOST || 'localhost',
      password: PGPASSWORD || 'password',
      port: Number(PGPORT) || 5432,
      database: PGDATABASE || 'databuilder',
    }

    await createDb(dbConfig.database, dbConfig)
    await migrate(dbConfig, `${__dirname}/../sql/`)

    console.log('Migration complete')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

dbmigrate()
