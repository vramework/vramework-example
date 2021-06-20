import { generateRoutesImports } from '@vramework/backend-common/src/routes-generator'

generateRoutesImports(
    `${__dirname}/../packages/functions/src/routes`,
    `${__dirname}/../packages/functions/src/routes.ts`
)