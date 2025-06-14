import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../context/OnboardingContext'
import IdentificationInfo from '../components/IdentificationInfo'
import { ROUTES } from '../constants/routes'
import type { IdentificationInfoData } from '../types/identification'

export function IdentificationPage() {
  const { setCurrentStep, setIdentificationInfo } = useOnboarding()
  const navigate = useNavigate()

  useEffect(() => {
    // Sync the onboarding context with the current route
    setCurrentStep(3)
  }, [setCurrentStep])

  const handleNext = (identificationInfo: IdentificationInfoData) => {
    setIdentificationInfo(identificationInfo)
    navigate(ROUTES.STEP_4)
  }

  return <IdentificationInfo onNext={handleNext} />
}