import { useEffect } from 'react'
import { useOnboarding } from '../context/OnboardingContext'
import EmailCapture from '../components/EmailCapture'

export function EmailCapturePage() {
  const { setCurrentStep } = useOnboarding()

  useEffect(() => {
    // Sync current step with route
    setCurrentStep(1)
  }, [setCurrentStep])

  return <EmailCapture />
}