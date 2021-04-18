import { APIGatewayProxyEvent } from "aws-lambda"

import { processCors, processCorsless } from "@vramework/lambda/lambda"

import { config } from '@vramework/functions/src/config'
import { setupServices } from "@vramework/functions/src/services"
import { getRoutes } from "@vramework/functions/src/routes"

const services = setupServices(config)
const routes = getRoutes()

export const corslessHandler = async (event: APIGatewayProxyEvent) => {
    return await processCorsless(event, routes, config, await services)
}
  
export const corsHandler = async (event: APIGatewayProxyEvent) => {
    return await processCors(event, routes, config, await services)
}
  