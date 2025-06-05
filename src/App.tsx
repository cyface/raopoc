import ProductSelection from './components/ProductSelection'
import CustomerInfo from './components/CustomerInfo'
import IdentificationInfo from './components/IdentificationInfo'
import { DocumentAcceptance } from './components/DocumentAcceptance'
import { ConfirmationScreen } from './components/ConfirmationScreen'
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext'
import { ThemeProvider } from './context/ThemeContext'
import type { CustomerInfoData } from './types/customer'
import type { IdentificationInfoData } from './types/identification'

function OnboardingFlow() {
  const { currentStep, data, setCustomerInfo, setIdentificationInfo, setDocumentAcceptance, setCurrentStep } = useOnboarding()

  const handleCustomerInfoNext = (customerInfo: CustomerInfoData) => {
    setCustomerInfo(customerInfo)
    setCurrentStep(3)
  }

  const handleIdentificationInfoNext = (identificationInfo: IdentificationInfoData) => {
    setIdentificationInfo(identificationInfo)
    setCurrentStep(4)
  }

  const handleDocumentAcceptanceNext = () => {
    setCurrentStep(5)
  }

  switch (currentStep) {
    case 1:
      return <ProductSelection />
    case 2:
      return (
        <CustomerInfo 
          selectedProducts={data.selectedProducts} 
          onNext={handleCustomerInfoNext}
        />
      )
    case 3:
      return (
        <IdentificationInfo 
          onNext={handleIdentificationInfoNext}
        />
      )
    case 4:
      return (
        <DocumentAcceptance
          selectedProducts={data.selectedProducts}
          hasNoSSN={data.identificationInfo?.noSSN || false}
          onAcceptanceChange={setDocumentAcceptance}
          onNext={handleDocumentAcceptanceNext}
        />
      )
    case 5:
      return <ConfirmationScreen />
    default:
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Step {currentStep}</h1>
          <p>Coming soon...</p>
        </div>
      )
  }
}

function App() {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <OnboardingFlow />
      </OnboardingProvider>
    </ThemeProvider>
  )
}

export default App