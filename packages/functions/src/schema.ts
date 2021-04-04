import Ajv, { ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import * as Pino from 'pino'
import { InvalidParametersError } from './errors'

const ajv = new Ajv({ removeAdditional: false })
addFormats(ajv as any)

const validators = new Map<string, ValidateFunction>()

const schemas = new Map<string, any>()
export const addSchema = (name: string, value: any) => schemas.set(name, value)

try {
  require('../generated/schemas')
} catch (e) {
  throw 'Schemas not generated'
}

export const loadSchema = (schema: string, logger: Pino.Logger): void => {
  if (!validators.has(schema)) {
    logger.info(`Adding json schema for ${schema}`)
    const json = schemas.get(schema)
    try {
      const validator = ajv.compile(json)
      validators.set(schema, validator)
    } catch (e) {
      console.error(e, schema, json)
      throw e
    }
  }
}

export const validateJson = (schema: string, json: unknown): void => {
  const validator = validators.get(schema)
  if (!validator) {
    throw `Missing validator for ${schema}`
  }
  const result = validator(json)
  if (result === false) {
    const errorText = ajv.errorsText(validator.errors)
    console.error('>', errorText, schema, json)
    throw new InvalidParametersError(ajv.errorsText(validator.errors))
  }
}
