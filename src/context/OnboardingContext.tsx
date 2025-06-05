import { createContext, useContext, useState, ReactNode } from 'react'
import { type OnboardingData } from '../types/customer'
import { type ProductType } from '../types/products'
import { type CustomerInfoData } from '../types/customer'
import { type IdentificationInfoData } from '../types/identification'
import { type DocumentAcceptanceState } from '../types/documents'

interface OnboardingContextType {
  data: OnboardingData
  setSelectedProducts: (products: ProductType[]) => void
  setCustomerInfo: (customerInfo: CustomerInfoData) => void
  setIdentificationInfo: (identificationInfo: IdentificationInfoData) => void
  setDocumentAcceptance: (documentAcceptance: DocumentAcceptanceState) => void
  currentStep: number
  setCurrentStep: (step: number) => void
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

  const value = {
    data,
    setSelectedProducts,
    setCustomerInfo,
    setIdentificationInfo,
    setDocumentAcceptance,
    currentStep,
    setCurrentStep,
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