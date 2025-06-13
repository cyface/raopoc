import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { 
  createMemoryRouter, 
  RouterProvider, 
  RouteObject,
  LoaderFunction,
  ActionFunction,
} from 'react-router'
import { ThemeProvider } from '../context/ThemeContext'
import { OnboardingProvider } from '../context/OnboardingContext'

// Test router configuration
interface TestRouterOptions {
  initialEntries?: string[]
  initialIndex?: number
  routes?: RouteObject[]
  loader?: LoaderFunction
  action?: ActionFunction
}

/**
 * Create a test router for component testing
 */
export function createTestRouter(options: TestRouterOptions = {}) {
  const {
    initialEntries = ['/'],
    initialIndex = 0,
    routes = [],
    loader,
    action,
  } = options
  
  const defaultRoutes: RouteObject[] = [
    {
      path: '/',
      element: <div data-testid="test-root">Test Root</div>,
      loader,
      action,
      children: routes,
    },
  ]
  
  return createMemoryRouter(defaultRoutes, {
    initialEntries,
    initialIndex,
  })
}

/**
 * Render component with React Router test setup
 */
export function renderWithRouter(
  ui: ReactElement,
  options: TestRouterOptions & RenderOptions = {}
) {
  const { initialEntries = ['/'], initialIndex = 0, routes, loader, action, ...renderOptions } = options
  
  // Create routes that include the component to test
  // Use the path from initialEntries to match the component route
  const testPath = initialEntries[0] || '/'
  const testRoutes: RouteObject[] = routes || [
    {
      path: testPath,
      element: ui,
      loader,
      action,
    }
  ]
  
  const router = createMemoryRouter(testRoutes, {
    initialEntries,
    initialIndex,
  })
  
  function Wrapper() {
    return (
      <ThemeProvider>
        <OnboardingProvider>
          <RouterProvider router={router} />
        </OnboardingProvider>
      </ThemeProvider>
    )
  }
  
  // Don't render the ui directly, let the router handle it
  return render(<div />, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Mock loader function for testing
 */
export function createMockLoader(data: any): LoaderFunction {
  return async () => data
}

/**
 * Mock action function for testing
 */
export function createMockAction(result: any = null): ActionFunction {
  return async () => result
}

/**
 * Test utilities for route-based components
 */
export const routeTestUtils = {
  createTestRouter,
  renderWithRouter,
  createMockLoader,
  createMockAction,
}