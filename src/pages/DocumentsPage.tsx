import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../context/OnboardingContext'
import { DocumentAcceptance } from '../components/DocumentAcceptance'
import { ROUTES } from '../constants/routes'

export function DocumentsPage() {
  const { setCurrentStep, data, setDocumentAcceptance } = useOnboarding()
  const navigate = useNavigate()

  useEffect(() => {
    // Sync the onboarding context with the current route
    setCurrentStep(4)
  }, [setCurrentStep])

  const handleNext = () => {
    navigate(ROUTES.STEP_5)
  }

  return (
    <DocumentAcceptance
      selectedProducts={data.selectedProducts}
      hasNoSSN={data.identificationInfo?.noSSN || false}
      onAcceptanceChange={setDocumentAcceptance}
      onNext={handleNext}
    />
  )
}