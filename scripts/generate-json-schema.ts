import { getRoutes } from '@vramework-example/functions/src/routes'
import { generateSchemas } from '@vramework/backend-common/src/schema-generator'

generateSchemas(`${__dirname}/../backends/cloud/tsconfig.json`, `${__dirname}/../packages/api/generated`, getRoutes())