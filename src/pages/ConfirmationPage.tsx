import { useEffect } from 'react'
import { useOnboarding } from '../context/OnboardingContext'
import { ConfirmationScreen } from '../components/ConfirmationScreen'

export function ConfirmationPage() {
  const { setCurrentStep } = useOnboarding()

  useEffect(() => {
    // Sync the onboarding context with the current route
    setCurrentStep(6)
  }, [setCurrentStep])

  return <ConfirmationScreen />
}