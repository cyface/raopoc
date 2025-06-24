import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../context/OnboardingContext'
import IdentificationInfo from '../components/IdentificationInfo'
import { ROUTES } from '../constants/routes'
import type { IdentificationInfoData } from '../types/identification'
import { leadService } from '../services/leadService'

export function IdentificationPage() {
  const { setCurrentStep, setIdentificationInfo } = useOnboarding()
  const navigate = useNavigate()

  useEffect(() => {
    // Sync the onboarding context with the current route
    setCurrentStep(3)
  }, [setCurrentStep])

  const handleNext = async (identificationInfo: IdentificationInfoData) => {
    try {
      // Save to database first
      await leadService.saveIdentificationInfo(identificationInfo)
      
      // Update global context
      setIdentificationInfo(identificationInfo)
      
      // Navigate to next step
      navigate(ROUTES.STEP_4)
    } catch (error) {
      console.error('Error saving identification info:', error)
      // You might want to show an error message here
    }
  }

  return <IdentificationInfo onNext={handleNext} />
}