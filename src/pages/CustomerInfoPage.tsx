import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../context/OnboardingContext'
import CustomerInfo from '../components/CustomerInfo'
import { ROUTES } from '../constants/routes'
import type { CustomerInfoData } from '../types/customer'
import { leadService } from '../services/leadService'

export function CustomerInfoPage() {
  const { setCurrentStep, data, setCustomerInfo } = useOnboarding()
  const navigate = useNavigate()

  useEffect(() => {
    // Sync the onboarding context with the current route
    setCurrentStep(2)
  }, [setCurrentStep])

  const handleNext = async (customerInfo: CustomerInfoData) => {
    try {
      // Save to database first, including selected products
      await leadService.saveCustomerInfo(customerInfo, data.selectedProducts)
      
      // Update global context
      setCustomerInfo(customerInfo)
      
      // Navigate to next step
      navigate(ROUTES.STEP_3)
    } catch (error) {
      console.error('Error saving customer info:', error)
      // You might want to show an error message here
    }
  }

  return (
    <CustomerInfo 
      selectedProducts={data.selectedProducts} 
      onNext={handleNext}
    />
  )
}