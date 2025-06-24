import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../context/OnboardingContext'
import { DocumentAcceptance } from '../components/DocumentAcceptance'
import { ROUTES } from '../constants/routes'
import { leadService } from '../services/leadService'
import type { DocumentAcceptanceState } from '../types/documents'

export function DocumentsPage() {
  const { setCurrentStep, data, setDocumentAcceptance } = useOnboarding()
  const navigate = useNavigate()

  useEffect(() => {
    // Sync the onboarding context with the current route
    setCurrentStep(4)
  }, [setCurrentStep])

  const handleAcceptanceChange = async (state: DocumentAcceptanceState) => {
    try {
      // Convert state to array format expected by the API
      const acceptances = Object.values(state.acceptances).map(acceptance => ({
        documentId: acceptance.documentId,
        accepted: acceptance.accepted
      }))
      
      // Save to database first
      await leadService.saveDocumentAcceptances(acceptances)
      
      // Update global context
      setDocumentAcceptance(state)
    } catch (error) {
      console.error('Error saving document acceptances:', error)
    }
  }

  const handleNext = async () => {
    try {
      // Mark step as complete
      await leadService.completeOnboarding()
      
      // Navigate to confirmation
      navigate(ROUTES.STEP_5)
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Navigate anyway but you might want to show an error
      navigate(ROUTES.STEP_5)
    }
  }

  return (
    <DocumentAcceptance
      selectedProducts={data.selectedProducts}
      hasNoSSN={data.identificationInfo?.noSSN || false}
      onAcceptanceChange={handleAcceptanceChange}
      onNext={handleNext}
    />
  )
}