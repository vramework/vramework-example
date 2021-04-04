import { promises } from 'fs'
import * as TJS from 'typescript-json-schema'
import { getRoutes } from '@databuilder/functions/src/api'

async function program() {
  const routes = getRoutes()

  const schemasSet = new Set(routes.map<string | null>(({ schema }) => schema).filter((s) => !!s) as string[])
  const schemas = Array.from(schemasSet)

  // optionally pass argument to schema generator
  const settings: TJS.PartialArgs = {
    required: true,
    noExtraProps: true,
  }

  const program = TJS.programFromConfig('backends/serverless/tsconfig.json')
  const generator = TJS.buildGenerator(program, settings)

  if (generator === null) {
    process.exit(1)
  }

  await Promise.all(
    schemas.map(
      async (schema) =>
        await promises.writeFile(
          `${__dirname}/../packages/functions/generated/schemas/${schema}.json`,
          JSON.stringify(generator.getSchemaForSymbol(schema)),
          'utf-8',
        ),
    ),
  )

  await promises.writeFile(
    `${__dirname}/../packages/functions/generated/schemas.ts`,
    'import { addSchema } from \'../src/schema\'\n' +
      schemas
        .map(
          (schema) => `
import ${schema} from './schemas/${schema}.json'
addSchema('${schema}', ${schema})`,
        )
        .join('\n'),
    'utf8',
  )
}
program()
