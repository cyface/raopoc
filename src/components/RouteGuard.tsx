import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../context/OnboardingContext'
import { useUrlParams } from '../hooks/useUrlParams'
import { ROUTES, StepNumber } from '../constants/routes'

interface RouteGuardProps {
  children: ReactNode
  requiredStep: StepNumber
  allowSkipTo?: boolean
}

export function RouteGuard({ children, requiredStep, allowSkipTo = false }: RouteGuardProps) {
  const { data } = useOnboarding()
  const navigate = useNavigate()
  const { devStep } = useUrlParams()

  useEffect(() => {
    // Allow access to step 1 (email capture) always
    if (requiredStep === 1) return

    // In dev mode, allow skipping to any step when devStep is present
    if (devStep && devStep === requiredStep) {
      return
    }

    // Check if user has completed previous steps
    const hasEmail = data.customerInfo?.email && data.customerInfo.email.length > 0
    const hasSelectedProducts = data.selectedProducts.length > 0
    const hasCustomerInfo = data.customerInfo !== null
    const hasIdentificationInfo = data.identificationInfo !== null

    // Step validation logic
    switch (requiredStep) {
      case 2: // Product Selection
        if (!hasEmail && !allowSkipTo) {
          navigate(ROUTES.STEP_1, { replace: true })
          return
        }
        break
        
      case 3: // Customer Info
        if (!hasEmail || (!hasSelectedProducts && !allowSkipTo)) {
          navigate(!hasEmail ? ROUTES.STEP_1 : ROUTES.STEP_2, { replace: true })
          return
        }
        break
        
      case 4: // Identification
        if (!hasEmail || (!hasSelectedProducts && !allowSkipTo) || (!hasCustomerInfo && !allowSkipTo)) {
          const redirectStep = !hasEmail ? 1 : !hasSelectedProducts ? 2 : 3
          navigate(redirectStep === 1 ? ROUTES.STEP_1 : redirectStep === 2 ? ROUTES.STEP_2 : ROUTES.STEP_3, { replace: true })
          return
        }
        break
        
      case 5: // Documents
        if (!hasEmail || (!hasSelectedProducts && !allowSkipTo) || (!hasCustomerInfo && !allowSkipTo) || (!hasIdentificationInfo && !allowSkipTo)) {
          const redirectStep = !hasEmail ? 1 : !hasSelectedProducts ? 2 : !hasCustomerInfo ? 3 : 4
          navigate(redirectStep === 1 ? ROUTES.STEP_1 : redirectStep === 2 ? ROUTES.STEP_2 : redirectStep === 3 ? ROUTES.STEP_3 : ROUTES.STEP_4, { replace: true })
          return
        }
        break
        
      case 6: // Confirmation
        if (!hasEmail || (!hasSelectedProducts && !allowSkipTo) || (!hasCustomerInfo && !allowSkipTo) || (!hasIdentificationInfo && !allowSkipTo)) {
          const redirectStep = !hasEmail ? 1 : !hasSelectedProducts ? 2 : !hasCustomerInfo ? 3 : 4
          navigate(redirectStep === 1 ? ROUTES.STEP_1 : redirectStep === 2 ? ROUTES.STEP_2 : redirectStep === 3 ? ROUTES.STEP_3 : ROUTES.STEP_4, { replace: true })
          return
        }
        break
    }
  }, [requiredStep, data, navigate, allowSkipTo, devStep])

  return <>{children}</>
}