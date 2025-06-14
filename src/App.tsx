import { Routes, Route, Navigate } from 'react-router-dom'
import { DevHelper } from './components/DevHelper'
import { DevStepNavigator } from './components/DevStepNavigator'
import { RouteGuard } from './components/RouteGuard'
import { NamedRouteRedirect } from './components/NamedRouteRedirect'
import { OnboardingProvider } from './context/OnboardingContext'
import { ThemeProvider } from './context/ThemeContext'
import { useUrlParams } from './hooks/useUrlParams'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { ROUTES, NAMED_ROUTES } from './constants/routes'

// Import page components
import { EmailCapturePage } from './pages/EmailCapturePage'
import { ProductSelectionPage } from './pages/ProductSelectionPage'
import { CustomerInfoPage } from './pages/CustomerInfoPage'
import { IdentificationPage } from './pages/IdentificationPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { ConfirmationPage } from './pages/ConfirmationPage'

function UrlParamWatcher() {
  const { lng } = useUrlParams()
  const { i18n } = useTranslation()

  useEffect(() => {
    // Update language when URL parameter changes
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng)
      // Note: ConfigServiceV2 automatically handles language changes via reactive hooks
    }
  }, [lng, i18n])

  return null // This component only watches, doesn't render anything
}

function OnboardingFlow() {
  return (
    <Routes>
      {/* Root redirect to first step */}
      <Route path="/" element={<Navigate to={ROUTES.STEP_1} replace />} />
      
      {/* Named route redirects */}
      <Route path={NAMED_ROUTES.EMAIL_CAPTURE} element={<NamedRouteRedirect />} />
      <Route path={NAMED_ROUTES.PRODUCT_SELECTION} element={<NamedRouteRedirect />} />
      <Route path={NAMED_ROUTES.CUSTOMER_INFO} element={<NamedRouteRedirect />} />
      <Route path={NAMED_ROUTES.IDENTIFICATION} element={<NamedRouteRedirect />} />
      <Route path={NAMED_ROUTES.DOCUMENTS} element={<NamedRouteRedirect />} />
      <Route path={NAMED_ROUTES.CONFIRMATION} element={<NamedRouteRedirect />} />
      
      {/* Numbered step routes with guards */}
      <Route 
        path={ROUTES.STEP_1} 
        element={
          <RouteGuard requiredStep={1}>
            <EmailCapturePage />
          </RouteGuard>
        } 
      />
      <Route 
        path={ROUTES.STEP_2} 
        element={
          <RouteGuard requiredStep={2}>
            <ProductSelectionPage />
          </RouteGuard>
        } 
      />
      <Route 
        path={ROUTES.STEP_3} 
        element={
          <RouteGuard requiredStep={3}>
            <CustomerInfoPage />
          </RouteGuard>
        } 
      />
      <Route 
        path={ROUTES.STEP_4} 
        element={
          <RouteGuard requiredStep={4}>
            <IdentificationPage />
          </RouteGuard>
        } 
      />
      <Route 
        path={ROUTES.STEP_5} 
        element={
          <RouteGuard requiredStep={5}>
            <DocumentsPage />
          </RouteGuard>
        } 
      />
      <Route 
        path={ROUTES.STEP_6} 
        element={
          <RouteGuard requiredStep={6}>
            <ConfirmationPage />
          </RouteGuard>
        } 
      />
      
      {/* Catch-all redirect to first step */}
      <Route path="*" element={<Navigate to={ROUTES.STEP_1} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <UrlParamWatcher />
        <DevStepNavigator />
        <OnboardingFlow />
        <DevHelper />
      </OnboardingProvider>
    </ThemeProvider>
  )
}

export default App