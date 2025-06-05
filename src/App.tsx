import ProductSelection from './components/ProductSelection'
import CustomerInfo from './components/CustomerInfo'
import IdentificationInfo from './components/IdentificationInfo'
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext'

function OnboardingFlow() {
  const { currentStep, data, setCustomerInfo, setIdentificationInfo, setCurrentStep } = useOnboarding()

  const handleCustomerInfoNext = (customerInfo: any) => {
    setCustomerInfo(customerInfo)
    setCurrentStep(3)
  }

  const handleIdentificationInfoNext = (identificationInfo: any) => {
    setIdentificationInfo(identificationInfo)
    setCurrentStep(4)
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