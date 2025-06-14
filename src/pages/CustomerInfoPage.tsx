import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../context/OnboardingContext'
import CustomerInfo from '../components/CustomerInfo'
import { ROUTES } from '../constants/routes'
import type { CustomerInfoData } from '../types/customer'

export function CustomerInfoPage() {
  const { setCurrentStep, data, setCustomerInfo } = useOnboarding()
  const navigate = useNavigate()

  useEffect(() => {
    // Sync the onboarding context with the current route
    setCurrentStep(2)
  }, [setCurrentStep])

  const handleNext = (customerInfo: CustomerInfoData) => {
    setCustomerInfo(customerInfo)
    navigate(ROUTES.STEP_3)
  }

  return (
    <CustomerInfo 
      selectedProducts={data.selectedProducts} 
      onNext={handleNext}
    />
  )
}