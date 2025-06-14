import { useEffect } from 'react'
import { useOnboarding } from '../context/OnboardingContext'
import ProductSelection from '../components/ProductSelection'

export function ProductSelectionPage() {
  const { setCurrentStep } = useOnboarding()

  useEffect(() => {
    // Sync the onboarding context with the current route
    setCurrentStep(2)
  }, [setCurrentStep])

  return <ProductSelection />
}