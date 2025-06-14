import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { type OnboardingData } from '../types/customer'
import { type ProductType } from '../types/products'
import { type CustomerInfoData } from '../types/customer'
import { type IdentificationInfoData } from '../types/identification'
import { type DocumentAcceptanceState } from '../types/documents'
import { getApiUrl } from '../utils/apiUrl'
import { useUrlParams } from '../hooks/useUrlParams'
import { populateMockDataUpToStep, MOCK_SCENARIOS, type MockScenario } from '../utils/mockData'

interface CreditCheckResult {
  status: 'approved' | 'requires_verification' | 'pending' | 'error'
  requiresVerification: boolean
  message: string
}

interface OnboardingContextType {
  data: OnboardingData
  setSelectedProducts: (products: ProductType[]) => void
  setCustomerInfo: (customerInfo: CustomerInfoData) => void
  setIdentificationInfo: (identificationInfo: IdentificationInfoData) => void
  setDocumentAcceptance: (documentAcceptance: DocumentAcceptanceState) => void
  setEmail: (email: string) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  creditCheckResult: CreditCheckResult | null
  setCreditCheckResult: (result: CreditCheckResult | null) => void
  performCreditCheck: (ssn: string) => Promise<void>
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { devStep, mockScenario } = useUrlParams()
  
  const [data, setData] = useState<OnboardingData>({
    selectedProducts: [],
    customerInfo: undefined,
    identificationInfo: undefined,
    documentAcceptance: undefined,
  })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [creditCheckResult, setCreditCheckResult] = useState<CreditCheckResult | null>(null)

  // Effect to handle devStep URL parameter
  useEffect(() => {
    if (devStep && devStep >= 1 && devStep <= 6) {
      // Get mock scenario config
      const scenarioConfig = mockScenario && mockScenario in MOCK_SCENARIOS 
        ? MOCK_SCENARIOS[mockScenario as MockScenario].config 
        : {}

      // Populate mock data up to the target step
      const mockData = populateMockDataUpToStep(devStep, scenarioConfig)
      
      // Update the onboarding data with mock data
      setData(prev => ({
        ...prev,
        selectedProducts: mockData.selectedProducts || prev.selectedProducts,
        customerInfo: mockData.customerInfo || prev.customerInfo,
        identificationInfo: mockData.identificationInfo || prev.identificationInfo,
        documentAcceptance: mockData.documentAcceptance || prev.documentAcceptance,
      }))
      
      // Set captured email for dev mode (step 1 and above)
      if (devStep >= 1) {
        setEmail('dev@example.com')
      }
      
      // Set the current step
      setCurrentStep(devStep)
      
      console.log(`🔧 Dev Mode: Loaded step ${devStep}${mockScenario ? ` with scenario "${mockScenario}"` : ''}`)
    }
  }, [devStep, mockScenario])

  const setSelectedProducts = (products: ProductType[]) => {
    setData(prev => ({ ...prev, selectedProducts: products }))
  }

  const setCustomerInfo = (customerInfo: CustomerInfoData) => {
    setData(prev => ({ ...prev, customerInfo }))
  }

  const setIdentificationInfo = (identificationInfo: IdentificationInfoData) => {
    setData(prev => ({ ...prev, identificationInfo }))
  }

  const setDocumentAcceptance = (documentAcceptance: DocumentAcceptanceState) => {
    setData(prev => ({ ...prev, documentAcceptance }))
  }

  const setEmail = (email: string) => {
    setData(prev => ({
      ...prev,
      customerInfo: prev.customerInfo 
        ? { ...prev.customerInfo, email }
        : {
            firstName: '',
            lastName: '',
            email,
            phoneNumber: '',
            mailingAddress: {
              street: '',
              city: '',
              state: '',
              zipCode: ''
            },
            useSameAddress: true
          }
    }))
  }

  const performCreditCheck = async (ssn: string) => {
    try {
      setCreditCheckResult({ status: 'pending', requiresVerification: false, message: 'Checking credit...' })
      
      const response = await fetch(`${getApiUrl()}/credit-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ssn }),
      })

      if (!response.ok) {
        throw new Error('Credit check failed')
      }

      const result = await response.json()
      setCreditCheckResult({
        status: result.status,
        requiresVerification: result.requiresVerification,
        message: result.message,
      })
    } catch (error) {
      console.error('Credit check error:', error)
      setCreditCheckResult({
        status: 'error',
        requiresVerification: false,
        message: 'Credit check failed. Please try again.',
      })
    }
  }

  const value = {
    data,
    setSelectedProducts,
    setCustomerInfo,
    setIdentificationInfo,
    setDocumentAcceptance,
    setEmail,
    currentStep,
    setCurrentStep,
    creditCheckResult,
    setCreditCheckResult,
    performCreditCheck,
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}