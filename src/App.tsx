import ProductSelection from './components/ProductSelection'
import CustomerInfo from './components/CustomerInfo'
import IdentificationInfo from './components/IdentificationInfo'
import { DocumentAcceptance } from './components/DocumentAcceptance'
import { ConfirmationScreen } from './components/ConfirmationScreen'
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext'

function OnboardingFlow() {
  const { currentStep, data, setCustomerInfo, setIdentificationInfo, setDocumentAcceptance, setCurrentStep } = useOnboarding()

  const handleCustomerInfoNext = (customerInfo: any) => {
    setCustomerInfo(customerInfo)
    setCurrentStep(3)
  }

  const handleIdentificationInfoNext = (identificationInfo: any) => {
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
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  )
}

export default App