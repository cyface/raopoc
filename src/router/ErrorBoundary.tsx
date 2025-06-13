import { useRouteError, isRouteErrorResponse, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function ErrorBoundary() {
  const error = useRouteError()
  const { t } = useTranslation()
  
  let errorMessage: string
  let errorStatus: number | null = null
  
  if (isRouteErrorResponse(error)) {
    // React Router errors (404, etc)
    errorStatus = error.status
    errorMessage = error.statusText || error.data
  } else if (error instanceof Error) {
    // JavaScript errors
    errorMessage = error.message
  } else if (typeof error === 'string') {
    // String errors
    errorMessage = error
  } else {
    // Unknown errors
    errorMessage = 'An unexpected error occurred'
  }
  
  // Log error for debugging
  console.error('Route error:', error)
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {errorStatus === 404 ? t('errors.notFound') : t('errors.title')}
              </h1>
              {errorStatus && (
                <p className="text-sm text-gray-500">
                  {t('errors.status', { status: errorStatus })}
                </p>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-700 mb-4">
              {errorStatus === 404 
                ? t('errors.notFoundMessage') 
                : errorMessage}
            </p>
            
            {process.env.NODE_ENV === 'development' && error instanceof Error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Stack trace
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {error.stack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-4">
              <Link
                to="/"
                className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {t('errors.startOver')}
              </Link>
              
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                {t('errors.tryAgain')}
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-4">
          {t('errors.helpText')}
        </p>
      </div>
    </div>
  )
}