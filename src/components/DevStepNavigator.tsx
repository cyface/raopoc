import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUrlParams } from '../hooks/useUrlParams'
import { STEP_TO_ROUTE } from '../constants/routes'

/**
 * Component that handles automatic navigation when devStep is present in URL
 * This ensures that adding ?devStep=3 to any URL will navigate to step 3
 */
export function DevStepNavigator() {
  const { devStep } = useUrlParams()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (devStep && devStep >= 1 && devStep <= 5) {
      const targetRoute = STEP_TO_ROUTE[devStep as keyof typeof STEP_TO_ROUTE]
      
      // Only navigate if we're not already on the target route
      if (targetRoute && location.pathname !== targetRoute) {
        console.log(`🔧 Dev Mode: Auto-navigating to step ${devStep} (${targetRoute}) with params preserved`)
        // Preserve all current URL parameters when navigating
        navigate({
          pathname: targetRoute,
          search: location.search
        }, { replace: true })
      }
    }
  }, [devStep, navigate, location.pathname, location.search])

  // This component doesn't render anything
  return null
}