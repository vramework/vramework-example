/* eslint-disable @typescript-eslint/no-explicit-any */
import * as pino from 'pino'
import express from 'express'
import { Server } from 'http'
import { json } from 'body-parser'
import { config as defaultConfig } from './config'
import cookieParser from 'cookie-parser'
import merge from 'deepmerge'
import jwt from 'express-jwt'
import { Config, Services, UserSession, APIRoute, getRoutes } from '@databuilder/functions/src/api'
import cors from 'cors'
import { AWSSecrets } from '@databuilder/functions/src/services/secrets/aws-secrets'
import { PGDatabase } from '@databuilder/functions/src/services/database/pg-database'
import { loadSchema, validateJson } from '@databuilder/functions/src/schema'
import { validatePermissions } from '@databuilder/functions/src/utils/permissions'
import { apiErrors } from '@databuilder/functions/src/errors'
import { Slack } from '@databuilder/functions/src/services/notification/slack'
import { PinoLogger } from '@databuilder/functions/src/services/logger/pino'
import { JWTManager } from '@databuilder/functions/src/services/jwt/jwt-manager'
import { Routes } from '@databuilder/types/src/routes'
import { S3Files } from '@databuilder/functions/src/services/file/s3-files'

const jwtMiddleware = (credentialsRequired: boolean, jwtManager: JWTManager, cookieName: string) =>
  jwt({
    credentialsRequired,
    algorithms: ['HS256'],
    secret: (req, header, payload, done) => {
      jwtManager.getJWTSecret(header, done as any)
    },
    getToken: (req) => {
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1]
      } else if (req.cookies[cookieName]) {
        return req.cookies[cookieName]
      }
      return null
    },
  })

export class AppServer {
  private config: Config
  private services: Services | undefined
  public app = express()
  private server: Server | undefined
  private routes: APIRoute<unknown, unknown>[] | undefined

  constructor(config: Partial<Config>, private logger: pino.Logger) {
    this.config = merge(defaultConfig, config) as Config
  }

  public async setupServices() {
    console.time('Setup Services')
    const slack = new Slack(this.config)
    const logger = new PinoLogger(slack)

    const promises: Array<Promise<void>> = []

    const secrets = new AWSSecrets(this.config, logger)

    const database = new PGDatabase(this.config, logger)
    await database.init(secrets)

    const jwt = new JWTManager(database, logger)
    promises.push(jwt.init())

    const files = new S3Files(this.config, logger)
    promises.push(files.init(secrets))

    await Promise.all(promises)

    console.timeEnd('Setup Services')
    
    this.services = { files, logger, secrets, database, slack, jwt }
  }

  public async init() {
    await this.setupServices()

    this.routes = getRoutes()

    this.app.use(
      json({
        limit: '1mb',
      }),
    )
    this.app.use(cookieParser())
    this.app.use(
      cors({
        origin: /http:\/\/localhost:\d\d\d\d/,
        credentials: true,
      }),
    )

    this.app.get('/api/health-check', function (req, res) {
      res.status(200).end()
    })

    this.app.get(`/${Routes.USER_LOGOUT}`, (req, res) => {
      res.clearCookie(this.config.cookie.name)
      res.end()
    })

    this.routes.forEach((route) => {
      if (route.schema) {
        loadSchema(route.schema, this.logger)
      }

      const path = `/${route.route}`
      this.logger.info(`Adding ${route.type.toUpperCase()} with route ${path}`)
      this.app[route.type](
        path,
        jwtMiddleware(false, this.services!.jwt, this.config.cookie.name),
        async (req, res, next) => {
          try {
            const session = (req as any).user as UserSession | undefined

            res.locals.cookiename = this.config.cookie.name
            res.locals.processed = true
            let result

            const data = {...req.params, ...req.query, ...req.body }

            validatePermissions(this.config, this.logger as any, route, data, session)
            
            if (route.schema) {
              validateJson(route.schema, data)
            }
            result = result = await route.func(this.services!, {
              config: this.config,
              data,
              session: (req as any).user as UserSession,
            })
            res.locals.result = result
            next()
          } catch (e) {
            next(e)
          }
        },
      )
    })

    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (!error) {
        return next()
      }

      if (error instanceof jwt.UnauthorizedError) {
        this.logger.error('JWT AUTH ERROR', error.message)
        res.status(401).end()
        return
      }

      const errorDetails = apiErrors.get(error.constructor)
      if (errorDetails) {
        res.status(errorDetails.status).json({ message: errorDetails.message })
      } else {
        console.error(error)
      }
    })

    this.app.use((req, res) => {
      if (res.locals.processed !== true) {
        res.status(404).end()
        return
      }
      if (res.locals.result) {
        if (res.locals.result.jwt) {
          res.cookie(res.locals.cookiename, res.locals.result.jwt, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            // domain: this.config.cookie.domain,
          })
        }
        res.json(res.locals.result).end()
      } else {
        res.status(200).end()
      }
    })
  }

  public async start() {
    return new Promise<void>((resolve) => {
      this.server = this.app.listen(this.config.server.port, () => {
        this.logger.info(`listening on port ${this.config.server.port}`)
        resolve()
      })
    })
  }

  public async stop(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.server) {
        throw 'Unable to stop server as it hasn`t been correctly started'
      }
      this.server.close(() => {
        resolve()
      })
    })
  }
}

