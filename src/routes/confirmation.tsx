import { 
  Form, 
  useLoaderData, 
  useNavigation, 
  useActionData,
  useSearchParams,
  redirect,
  type ActionFunction,
  type LoaderFunction,
} from 'react-router'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { 
  CheckCircleIcon, 
  EnvelopeIcon, 
  DocumentCheckIcon,
  BuildingOffice2Icon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'
import { StepIndicator } from '../components/StepIndicator'
import { configService } from '../services/configService'
import { getSearchParams, buildSearchParams } from '../utils/urlParams'
import { getApiUrl } from '../utils/apiUrl'
import type { BankInfo } from '../services/configService'
import type { OnboardingData } from '../types/customer'

interface LoaderData {
  applicationData: OnboardingData
  bankInfo: BankInfo | null
}

interface ActionData {
  success?: boolean
  applicationId?: string
  error?: string
}

// Loader
export const loader: LoaderFunction = async ({ request }) => {
  // Check all previous steps
  const selectedProducts = sessionStorage.getItem('onboarding:selectedProducts')
  const customerInfo = sessionStorage.getItem('onboarding:customerInfo')
  const identificationInfo = sessionStorage.getItem('onboarding:identificationInfo')
  const documentAcceptance = sessionStorage.getItem('onboarding:documentAcceptance')
  
  if (!selectedProducts || !customerInfo || !identificationInfo) {
    const url = new URL(request.url)
    const queryString = buildSearchParams(getSearchParams(url.searchParams))
    return redirect(`/${queryString}`)
  }
  
  // Compile application data
  const applicationData: OnboardingData = {
    selectedProducts: JSON.parse(selectedProducts),
    customerInfo: JSON.parse(customerInfo),
    identificationInfo: JSON.parse(identificationInfo),
    documentAcceptance: documentAcceptance ? JSON.parse(documentAcceptance) : undefined,
  }
  
  const { fi, lng } = getSearchParams(new URL(request.url).searchParams)
  const bankInfo = await configService.getBankInfoFor(fi, lng)
  
  return {
    applicationData,
    bankInfo,
  } satisfies LoaderData
}

// Action - Submit application
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const action = formData.get('_action')
  
  if (action === 'submit') {
    // Get all data from session
    const applicationData: OnboardingData = {
      selectedProducts: JSON.parse(sessionStorage.getItem('onboarding:selectedProducts') || '[]'),
      customerInfo: JSON.parse(sessionStorage.getItem('onboarding:customerInfo') || '{}'),
      identificationInfo: JSON.parse(sessionStorage.getItem('onboarding:identificationInfo') || '{}'),
      documentAcceptance: JSON.parse(sessionStorage.getItem('onboarding:documentAcceptance') || '{}'),
    }
    
    try {
      const response = await fetch(`${getApiUrl()}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to submit application: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Clear session storage on successful submission
      sessionStorage.removeItem('onboarding:selectedProducts')
      sessionStorage.removeItem('onboarding:customerInfo')
      sessionStorage.removeItem('onboarding:identificationInfo')
      sessionStorage.removeItem('onboarding:documentAcceptance')
      sessionStorage.removeItem('onboarding:creditCheckResult')
      
      return Response.json({ 
        success: true, 
        applicationId: result.applicationId 
      } satisfies ActionData)
      
    } catch (error) {
      console.error('Error submitting application:', error)
      return Response.json({ 
        error: 'Failed to submit application. Please try again.' 
      } satisfies ActionData, { status: 500 })
    }
  }
  
  // Start over action
  if (action === 'startOver') {
    // Clear all session data
    sessionStorage.clear()
    
    const url = new URL(request.url)
    const queryString = buildSearchParams(getSearchParams(url.searchParams))
    return redirect(`/${queryString}`)
  }
  
  return null
}

function ConfirmationRoute() {
  const { applicationData, bankInfo } = useLoaderData() as LoaderData
  const actionData = useActionData() as ActionData | undefined
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  
  const [emailSent, setEmailSent] = useState(false)
  const isSubmitting = navigation.state === 'submitting'
  const isSubmitted = actionData?.success === true
  
  // Auto-submit on first load if not already submitted
  useEffect(() => {
    if (!actionData && !isSubmitting) {
      // Auto-submit the form
      const form = document.getElementById('confirmation-form') as HTMLFormElement
      if (form) {
        const submitButton = form.querySelector('button[value="submit"]') as HTMLButtonElement
        submitButton?.click()
      }
    }
  }, [actionData, isSubmitting])
  
  // Mock email sending
  useEffect(() => {
    if (isSubmitted && !emailSent) {
      const timer = setTimeout(() => {
        setEmailSent(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSubmitted, emailSent])
  
  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('confirmationScreen.thankYou')}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            {t('confirmationScreen.applicationReceived')}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              {t('confirmationScreen.applicationId')}
            </p>
            <p className="text-2xl font-mono text-blue-600">
              {actionData.applicationId}
            </p>
          </div>
          
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-start">
              <DocumentCheckIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">
                  {t('confirmationScreen.applicationSubmitted')}
                </p>
                <p className="text-gray-600">
                  {t('confirmationScreen.reviewingApplication')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <EnvelopeIcon className={`h-6 w-6 mr-3 flex-shrink-0 mt-1 ${
                emailSent ? 'text-green-500' : 'text-gray-400 animate-pulse'
              }`} />
              <div>
                <p className="font-semibold text-gray-900">
                  {emailSent 
                    ? t('confirmationScreen.emailSent') 
                    : t('confirmationScreen.sendingEmail')}
                </p>
                <p className="text-gray-600">
                  {t('confirmationScreen.checkEmail', { 
                    email: applicationData.customerInfo?.email 
                  })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4 justify-center">
            <Form method="post">
              <input type="hidden" name="_action" value="startOver" />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('confirmationScreen.startNewApplication')}
              </button>
            </Form>
            
            {bankInfo?.websiteUrl && (
              <a
                href={bankInfo.websiteUrl}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('confirmationScreen.visitWebsite')}
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <StepIndicator currentStep={5} totalSteps={5} />
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t('confirmationScreen.title')}
      </h1>
      
      {actionData?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-red-700">{actionData.error}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BuildingOffice2Icon className="h-6 w-6 mr-2" />
          {bankInfo?.bankName || t('confirmationScreen.yourApplication')}
        </h2>
        
        <div className="space-y-4">
          {/* Selected Products */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">
              {t('confirmationScreen.selectedProducts')}
            </h3>
            <ul className="list-disc list-inside text-gray-600">
              {applicationData.selectedProducts.map((product) => (
                <li key={product}>{product}</li>
              ))}
            </ul>
          </div>
          
          {/* Customer Information */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">
              {t('confirmationScreen.customerInformation')}
            </h3>
            <dl className="text-gray-600">
              <dt className="inline font-medium">{t('customerInfo.name')}:</dt>
              <dd className="inline ml-2">
                {applicationData.customerInfo?.firstName} {applicationData.customerInfo?.lastName}
              </dd>
              <br />
              <dt className="inline font-medium">{t('customerInfo.email')}:</dt>
              <dd className="inline ml-2">{applicationData.customerInfo?.email}</dd>
              <br />
              <dt className="inline font-medium">{t('customerInfo.phone')}:</dt>
              <dd className="inline ml-2">{applicationData.customerInfo?.phoneNumber}</dd>
            </dl>
          </div>
          
          {/* Document Status */}
          {applicationData.documentAcceptance && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                {t('confirmationScreen.documentsAccepted')}
              </h3>
              <p className="text-gray-600">
                {applicationData.documentAcceptance.allAccepted
                  ? t('confirmationScreen.allDocumentsAccepted')
                  : t('confirmationScreen.requiredDocumentsAccepted')}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <p className="text-blue-900">
          {t('confirmationScreen.reviewNotice')}
        </p>
      </div>
      
      <Form id="confirmation-form" method="post" className="flex justify-between">
        {/* Preserve URL parameters */}
        {Array.from(searchParams.entries()).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('common.back')}
        </button>
        
        <button
          type="submit"
          name="_action"
          value="submit"
          disabled={isSubmitting}
          className={`
            px-6 py-3 rounded-lg font-medium transition-colors
            ${isSubmitting 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700'
            }
          `}
        >
          {isSubmitting ? t('common.submitting') : t('confirmationScreen.submitApplication')}
        </button>
      </Form>
    </div>
  )
}

// Export for lazy loading
export const Component = ConfirmationRoute