import { 
  createBrowserRouter,
  RouterProvider,
} from 'react-router'

// Route components
import { RootRoute } from '../routes/root'
import { rootLoader } from '../routes/loaders/rootLoader'

// Product selection
import { ProductSelectionRoute } from '../routes/product-selection'
import { productSelectionLoader, productSelectionAction } from '../routes/product-selection'

// Customer info
import { CustomerInfoRoute } from '../routes/customer-info'
import { customerInfoLoader, customerInfoAction } from '../routes/customer-info'

// Error boundary
import ErrorBoundary from './ErrorBoundary'

// Create router with all routes defined and v7 future flags
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRoute />,
    loader: rootLoader,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <ProductSelectionRoute />,
        loader: productSelectionLoader,
        action: productSelectionAction,
      },
      {
        path: "customer-info",
        element: <CustomerInfoRoute />,
        loader: customerInfoLoader,
        action: customerInfoAction,
      },
      {
        path: "identification",
        lazy: () => import('../routes/identification'),
      },
      {
        path: "documents",
        lazy: () => import('../routes/documents'),
      },
      {
        path: "confirmation",
        lazy: () => import('../routes/confirmation'),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
])

// 404 component
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-8">Page not found</p>
        <a href="/" className="text-blue-600 hover:underline">
          Go back home
        </a>
      </div>
    </div>
  )
}

// Main router component
export function Router() {
  return <RouterProvider router={router} />
}