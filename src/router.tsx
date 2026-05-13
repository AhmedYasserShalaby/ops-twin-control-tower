import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { AppShell } from './app/AppShell'
import { AboutPage } from './pages/AboutPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { CommandCenterPage } from './pages/CommandCenterPage'
import { NetworkPage } from './pages/NetworkPage'
import { PostmortemPage } from './pages/PostmortemPage'
import { ScenarioPage } from './pages/ScenarioPage'
import { SqlLabPage } from './pages/SqlLabPage'

const rootRoute = createRootRoute({
  component: AppShell,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: CommandCenterPage,
})

const scenarioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scenario',
  component: ScenarioPage,
})

const networkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/network',
  component: NetworkPage,
})

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: AnalyticsPage,
})

const sqlRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sql',
  component: SqlLabPage,
})

const postmortemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/postmortem',
  component: PostmortemPage,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  scenarioRoute,
  networkRoute,
  analyticsRoute,
  sqlRoute,
  postmortemRoute,
  aboutRoute,
])

const basepath = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '')

export const router = createRouter({ routeTree, basepath })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
