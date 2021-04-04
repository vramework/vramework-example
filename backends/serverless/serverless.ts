/* eslint-disable no-useless-escape */
import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { match, Match } from 'path-to-regexp'
import pino from 'pino'
import { serialize as serializeCookie } from 'cookie'
import { loadSchema, validateJson } from '@databuilder/functions/src/schema'
import { config as serverConfig } from './config'
import { InvalidOriginError } from '@databuilder/functions/src/errors'
import { validatePermissions } from '@databuilder/functions/src/utils/permissions'
import { Config, APIRoute, Services, getRoutes } from '@databuilder/functions/src/api'
import { apiErrors, NotFoundError } from '@databuilder/functions/src/errors'
import { AWSSecrets } from '@databuilder/functions/src/services/secrets/aws-secrets'
import { GoogleSheets } from '@databuilder/functions/src/services/sheets/google-sheets'
import { PGDatabase } from '@databuilder/functions/src/services/database/pg-database'
import { Slack } from '@databuilder/functions/src/services/notification/slack'
import { PinoLogger } from '@databuilder/functions/src/services/logger/pino'
import { JWTManager } from '@databuilder/functions/src/services/jwt/jwt-manager'
import { Mandrill } from '@databuilder/functions/src/services/email/mandrill-email'
import { S3Files } from '@databuilder/functions/src/services/file/s3-files'

const logger = pino()

const routes: APIRoute<unknown, unknown>[] = getRoutes()

export const validateOrigin = (services: Services, event: APIGatewayProxyEvent): string => {
  const origin = event.headers.origin

  if (!origin || !origin.includes(serverConfig.domain)) {
    services.logger.error(`
CORS Error
  - Recieved from origin: ${origin}
  - Expected domain: ${serverConfig.domain}
  - Host: ${event.headers.host}
  - Path: ${event.path}
  - Headers: ${JSON.stringify(event.headers, null, '\t')}
`)
    throw new InvalidOriginError()
  }

  return origin
}

const errorHandler = (e: Error, headers: Record<string, string | boolean>) => {
  const errorResponse = apiErrors.get(e.constructor)
  let statusCode: number
  if (errorResponse) {
    statusCode = errorResponse.status
    logger.warn(e)
    return {
      headers,
      statusCode,
      body: JSON.stringify({ error: errorResponse.message }),
    }
  }
  return {
    headers,
    statusCode: 500,
    body: JSON.stringify({}),
  }
}

const getMatchingRoute = (requestType: string, requestPath: string, routes: APIRoute<unknown, unknown>[]) => {
  let matchedPath: Match | undefined = undefined
  for (const route of routes) {
    if (route.type !== requestType.toLowerCase()) {
      continue
    }
    const matchFunc = match(`/${route.route}`, { decode: decodeURIComponent })
    matchedPath = matchFunc(requestPath)
    if (matchedPath) {
      if (route.schema) {
        loadSchema(route.schema, logger)
      }
      return { matchedPath, route }
    }
  }
  logger.info({ message: 'Invalid route', requestPath, requestType })
  throw new NotFoundError()
}

const generalHandler = async (
  config: Config,
  services: Services,
  routes: APIRoute<unknown, unknown>[],
  event: APIGatewayProxyEvent,
  headers: Record<string, any>
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod.toLowerCase() === 'options') {
    return {
      headers: {
        ...headers,
        'Access-Control-Allow-Headers':
        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'OPTIONS,DELETE,GET,HEAD,PATCH,POST,PUT',
      },
      statusCode: 200,
      body: '{}',
    }
  }

  if (event.path.includes('health-check')) {
    return {
      headers,
      statusCode: 200,
      body: '{}',
    }
  }

  if (event.path.includes('logout')) {
    return {
      statusCode: 200,
      body: '{}',
      headers: {
        ...headers,
        'Set-Cookie': serializeCookie(config.cookie.name, 'invalid', {
          expires: new Date(0),
          domain: config.domain,
          path: '/',
          httpOnly: true,
          secure: true,
        }),
      },
    }
  }

  try {
    const { matchedPath, route } = getMatchingRoute(event.httpMethod, event.path, routes)
    logger.info({ action: 'Executing route', path: matchedPath, route })
    const session = await services.jwt.getUserSession(
      route.requiresSession === false ? false : true,
      config.cookie.name,
      event.headers.cookie,
    )

    let data = { ...matchedPath.params, ...event.queryStringParameters }
    if (event.headers['Content-Type']?.includes('application/json') && event.body) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Only application/json allowed'}),
      }
    } else {
      data = { ...data, ...JSON.parse(event.body || '{}') }
    }
  
    validatePermissions(config, logger as any, route, data, session)
    
    if (route.schema) {
      validateJson(route.schema, data)
    }

    const result = await route.func(services, {
      session,
      data,
      config,
    })
    if (result && (result as any).jwt) {
      headers['Set-Cookie'] = serializeCookie(config.cookie.name, (result as any).jwt, {
        domain: config.domain,
        path: '/',
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 1,
      })
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers,
    }
  } catch (e) {
    return errorHandler(e, headers)
  }
}

async function setupServices(config: Config): Promise<Services> {
  console.time('Services Setup')

  const slack = new Slack(config)
  const logger = new PinoLogger(slack)

  const secrets = new AWSSecrets(config, logger)

  const promises: Array<Promise<void>> = []

  const database = new PGDatabase(config, logger)
  await database.init(secrets)

  const jwt = new JWTManager(database, logger)
  promises.push(jwt.init())

  const email = new Mandrill(config.domain, logger)
  promises.push(email.init(secrets))

  const inquirySheet = new GoogleSheets()
  promises.push(inquirySheet.init(secrets))

  const files = new S3Files(config, logger)
  promises.push(files.init(secrets))

  await Promise.all(promises)
  console.timeEnd('Services Setup')
  
  return { logger, secrets, email, database, jwt, files }
}

let services: Services

export const corslessHandler = async (event: APIGatewayProxyEvent) => {
  if (!services) {
    services = await setupServices(serverConfig)
  }
  return await generalHandler(serverConfig, services, routes, event, {})
}

export const appHandler = async (event: APIGatewayProxyEvent) => {
  if (!services) {
    services = await setupServices(serverConfig)
  }
  let origin: string | false = false
  try {
    origin = validateOrigin(services, event)
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Invalid origin` }),
    }
  }
  const headers: Record<string, string | boolean> = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': true,
  }
  return await generalHandler(serverConfig, services, routes, event, headers)
}
