import { createContext, useContext } from 'react'

export interface Route {
  route: string
  title: string
  subTitle: string
  icon: string
  disabled?: boolean
}

export interface ParentRoute {
  title: string
  routes: Array<Route>
  icon: string
}

export type Routes = Array<Route | ParentRoute>

export const RoutesContext = createContext<{ routes: Routes; menuOpen: boolean; setMenuOpen: (open: boolean) => void }>(
  { routes: [], menuOpen: false, setMenuOpen: () => undefined },
)

export const useRoutes = () => {
  return useContext(RoutesContext)
}
