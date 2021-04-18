import { promises } from 'fs'
import * as TJS from 'typescript-json-schema'
import { getRoutes } from '@vramework-example/functions/src/routes'

async function program() {
  const routes = getRoutes()

  const schemasSet = new Set(routes.map<string | null>(({ schema }) => schema).filter((s) => !!s) as string[])
  const schemas = Array.from(schemasSet)

  // optionally pass argument to schema generator
  const settings: TJS.PartialArgs = {
    required: true,
    noExtraProps: true,
  }

  const program = TJS.programFromConfig('backends/cloud/tsconfig.json')
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
    schemas.length > 0 ? 'import { addSchema } from \'@vramework/backend-common/src/schema\'\n' : 'export const empty = true;' +
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
