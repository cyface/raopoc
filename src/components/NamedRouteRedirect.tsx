import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { NAMED_ROUTE_TO_STEP, STEP_TO_ROUTE } from '../constants/routes'

export function NamedRouteRedirect() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const currentPath = location.pathname as keyof typeof NAMED_ROUTE_TO_STEP
    const stepNumber = NAMED_ROUTE_TO_STEP[currentPath]
    
    if (stepNumber) {
      const targetRoute = STEP_TO_ROUTE[stepNumber as keyof typeof STEP_TO_ROUTE]
      navigate(targetRoute, { replace: true })
    }
  }, [location.pathname, navigate])

  return <div>Redirecting...</div>
}