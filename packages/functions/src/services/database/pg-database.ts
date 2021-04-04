import * as pg from 'pg'
import { Pool, QueryResult } from 'pg'

// @ts-ignore
import * as pgCamelCase from 'pg-camelcase'
import { Config } from '../../api'
import { PinoLogger } from '../logger/pino'
import { Secrets } from '../secrets/secrets'
pgCamelCase.inject(pg)

const types = pg.types
types.setTypeParser(1082, function (stringValue) {
  return stringValue
})

export class PGDatabase {
  public pool: Pool
  public readonly schema: string

  constructor(private config: Config, private logger: PinoLogger) {
    this.logger.info(`Using db host: ${config.postgres.host}`)
    this.pool = new Pool(config.postgres)
    this.schema = config.postgres.schema
  }

  public async init(secrets: Secrets) {
    await this.checkConnection()
  }

  public async query<T = { rows: unknown[] }>(
    statement: string,
    values: Array<string | number | null | Buffer | Date> = [],
    debug?: 'debug',
  ): Promise<QueryResult<T>> {
    statement = statement.replace(/^\s*[\r\n]/gm, '')
    if (debug) {
      this.logger.info(`\nExecuting:\n  Query: ${statement}\n  Values:\n ${values}\n'`)
    }
    const start = Date.now()
    return new Promise<QueryResult<T>>((resolve, reject) => {
      this.pool.query<T>(statement, values, (err, res) => {
        if (err) {
          this.logger.error(`Error running statement: 
            ${statement} 
            with values 
            ${JSON.stringify(values)}
          
            Actual error: 
            
            ${err.toString()}
          `)
          reject(err)
          return
        }

        if (debug) {
          const duration = Date.now() - start
          this.logger.info(
            `executed query ${JSON.stringify({
              statement,
              duration,
              rows: res.rowCount,
            })}`,
          )
        }

        resolve(res)
      })
    })
  }

  public async beginTransaction(): Promise<void> {
    await this.query('BEGIN;')
  }

  public async endTransaction(): Promise<void> {
    await this.query('COMMIT;')
  }

  private async checkConnection(): Promise<void> {
    try {
      const { rows } = await this.query<{ serverVersion: string }>('SHOW server_version;')
      this.logger.info(`Postgres server version is: ${rows[0].serverVersion}`)
    } catch (e) {
      console.error(e)
      this.logger.error(`Unable to connect to server with ${this.config.postgres.host}, exiting server`)
      process.exit(1)
    }
  }
}
