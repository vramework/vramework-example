import * as pg from 'pg'
import { Pool, QueryResult } from 'pg'

import { snakeCase } from 'snake-case'

// @ts-ignore
import * as pgCamelCase from 'pg-camelcase'
import { Config } from '@vramework/functions/src/api'
import { Logger } from '@vramework/backend-common/src/services'
pgCamelCase.inject(pg)

const types = pg.types
types.setTypeParser(1082, function (stringValue) {
  return stringValue
})

export class PGDatabase {
  public pool: Pool
  public readonly schema: string

  constructor(private config: Config, private logger: Logger) {
    this.logger.info(`Using db host: ${config.postgres.host}`)
    this.pool = new Pool(config.postgres)
    this.schema = config.postgres.schema
  }

  public async init() {
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

export const exactlyOneResult = <T>(result: T[], Err: Error): T => {
  if (result.length !== 1) {
    throw Err
  }
  return result[0]
}

export const createInsert = (
  data: Record<string, number | string | null | string[] | undefined | Buffer | Date | boolean>,
  offset = 0,
): [string, string, Array<string | number | null>] => {
  const keys = Object.keys(data).filter((k) => data[k] !== undefined)
  const values = keys.map((k, i) => `$${i + 1 + offset}`)
  const realValues = keys.map((k) => data[k]) as Array<string | number | null>
  return [`"${keys.map((k) => snakeCase(k)).join('","')}"`, values.join(','), realValues]
}

export const sanitizeResult = <T>(object: Record<string, any>): T => {
  return Object.entries(object).reduce((result, [key, value]) => {
    if (typeof value === 'string' && value.match(/^{.+}$/)) {
      result[key] = value.match(/^{(.+)}$/)![1].split(',')
    } else {
      result[key] = value
    }
    return result
  }, {} as any)
}

// export const createFilters = (data: BulkFilter, includeWhere: boolean = true, valueOffset: number = 0) => {
//   const limit = data.limit || 1000
//   const offset = data.offset || 0

//   let sort: string = ''
//   if (data.sort) {
//     const parts = data.sort.key.split('.')
//     let table = parts[0].replace(/s$/, '')
//     const field = parts.pop() as string
//     sort = `ORDER BY "${table}".${snakeCase(field)} ${data.sort.order}`
//   }

//   const cleanFilters = data.filters?.map(({ operator, value, field }) => {
//     const parts = field.split('.')
//     let table = parts[0].replace(/s$/, '')
//     field = parts.pop() as string
//     return { table, operator, field, value }
//   })

//   const filterValues: any[] = []
//   let filter: string = ''
//   if (cleanFilters && cleanFilters.length > 0) {
//     const filters = cleanFilters.map(({ operator, table, field, value }) => {
//       if (operator === 'contains') {
//         filterValues.push(value)
//         return `"${table}"."${snakeCase(field)}" ILIKE '%' || $${valueOffset + filterValues.length} || '%'`
//       } else if (operator === 'eq') {
//         filterValues.push(value)
//         return `"${table}"."${snakeCase(field)}" = $${valueOffset + filterValues.length}`
//       }  else if (operator === 'ne') {
//         filterValues.push(value)
//         return `"${table}"."${snakeCase(field)}" != $${valueOffset + filterValues.length}`
//       }
//       return undefined
//     }).filter(v => !!v)
//     if (filters.length > 0) {
//       filter = `${includeWhere ? 'WHERE ' : ''}${filters.join(' AND ')}`
//     }
//   }

//   return { limit, offset, sort, filter, filterValues}
// }