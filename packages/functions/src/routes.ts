import { verifyRoutes } from '@vramework/backend-common/src/routes'
import { APIRoutes } from './api'
import '../generated/schemas'

export const getRoutes = (): APIRoutes => {
  const routes: APIRoutes = []
  verifyRoutes(routes)
  return routes
}
