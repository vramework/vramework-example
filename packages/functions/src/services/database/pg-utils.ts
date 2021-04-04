import { BulkFilter } from '@databuilder/types/src/generic'
import { snakeCase } from 'snake-case'

export const createInsert = (
  data: Record<string, number | string | null | string[] | undefined | Buffer | Date | boolean>,
  offset = 0,
): [string, string, Array<string | number | null>] => {
  const keys = Object.keys(data).filter((k) => data[k] !== undefined)
  const values = keys.map((k, i) => `$${i + 1 + offset}`)
  const realValues = keys.map((k) => data[k]) as Array<string | number | null>
  return [`"${keys.map((k) => snakeCase(k)).join('","')}"`, values.join(','), realValues]
}

export const exactlyOneResult = <T>(result: T[], Err: Error): T => {
  if (result.length !== 1) {
    throw Err
  }
  return result[0]
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

export const createFilters = (data: BulkFilter, includeWhere: boolean = true, valueOffset: number = 0) => {
  const limit = data.limit || 1000
  const offset = data.offset || 0

  let sort: string = ''
  if (data.sort) {
    const parts = data.sort.key.split('.')
    let table = parts[0].replace(/s$/, '')
    const field = parts.pop() as string
    sort = `ORDER BY "${table}".${snakeCase(field)} ${data.sort.order}`
  }

  const cleanFilters = data.filters?.map(({ operator, value, field }) => {
    const parts = field.split('.')
    let table = parts[0].replace(/s$/, '')
    field = parts.pop() as string
    return { table, operator, field, value }
  })

  const filterValues: any[] = []
  let filter: string = ''
  if (cleanFilters && cleanFilters.length > 0) {
    const filters = cleanFilters.map(({ operator, table, field, value }) => {
      if (operator === 'contains') {
        filterValues.push(value)
        return `"${table}"."${snakeCase(field)}" ILIKE '%' || $${valueOffset + filterValues.length} || '%'`
      } else if (operator === 'eq') {
        filterValues.push(value)
        return `"${table}"."${snakeCase(field)}" = $${valueOffset + filterValues.length}`
      }  else if (operator === 'ne') {
        filterValues.push(value)
        return `"${table}"."${snakeCase(field)}" != $${valueOffset + filterValues.length}`
      }
      return undefined
    }).filter(v => !!v)
    if (filters.length > 0) {
      filter = `${includeWhere ? 'WHERE ' : ''}${filters.join(' AND ')}`
    }
  }

  return { limit, offset, sort, filter, filterValues}
}