import { createContext, useContext, useState, ReactNode } from 'react'
import { type OnboardingData } from '../types/customer'
import { type ProductType } from '../types/products'
import { type CustomerInfoData } from '../types/customer'
import { type IdentificationInfoData } from '../types/identification'
import { type DocumentAcceptanceState } from '../types/documents'

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
  currentStep: number
  setCurrentStep: (step: number) => void
  creditCheckResult: CreditCheckResult | null
  setCreditCheckResult: (result: CreditCheckResult | null) => void
  performCreditCheck: (ssn: string) => Promise<void>
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>({
    selectedProducts: [],
    customerInfo: undefined,
    identificationInfo: undefined,
    documentAcceptance: undefined,
  })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [creditCheckResult, setCreditCheckResult] = useState<CreditCheckResult | null>(null)

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

  const performCreditCheck = async (ssn: string) => {
    try {
      setCreditCheckResult({ status: 'pending', requiresVerification: false, message: 'Checking credit...' })
      
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      const response = await fetch(`${apiBaseUrl}/credit-check`, {
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