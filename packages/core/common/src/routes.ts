import { CoreConfig } from "./config"
import { CoreServices } from "./services"
import { CoreUserSession } from "./user-session"

export type CoreAPIFunction<In, Out> = (
    services: CoreServices,
    { config, data, session }: { config: CoreConfig; data: In; session?: CoreUserSession },
) => Promise<Out>

export interface CoreAPIRoute<In, Out> {
    type: 'post' | 'get' | 'delete' | 'patch' | 'head'
    route: string
    func: CoreAPIFunction<In, Out>
    schema: string | null
    requiresSession?: false
}

export type CoreAPIRoutes = CoreAPIRoute<unknown, unknown>[]

export const verifyRoutes = (routes: CoreAPIRoute<unknown, unknown>[]) => {
    const paths = new Map()
    for (const type of ['get', 'patch', 'delete', 'post', 'head']) {
        paths.set(type, new Set<string[]>())
    }
    routes.forEach((route) => {
        const routes = paths.get(route.type)
        if (routes.has(route.route)) {
            throw `Duplicate route: ${JSON.stringify(route)}`
        }
        routes.add(route.route)
    })
}