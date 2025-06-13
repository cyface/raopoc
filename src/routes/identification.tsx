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
import { z } from 'zod'
import { useState } from 'react'
import { StepIndicator } from '../components/StepIndicator'
import { configService } from '../services/configService'
import { getSearchParams, buildSearchParams } from '../utils/urlParams'
import { getApiUrl } from '../utils/apiUrl'
import type { IdentificationType, Country } from '../services/configService'

// Validation schema
const identificationSchema = z.object({
  identificationType: z.enum(['passport', 'drivers-license', 'state-id', 'military-id']),
  identificationNumber: z.string().min(1, 'Identification number is required'),
  state: z.string().optional(),
  country: z.string().optional(),
  socialSecurityNumber: z.string().regex(/^\d{3}-?\d{2}-?\d{4}$/, 'Invalid SSN format').optional().or(z.literal('')),
  noSSN: z.boolean(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
}).refine((data) => {
  // If no SSN is checked, SSN should be empty
  if (data.noSSN && data.socialSecurityNumber) {
    return false
  }
  // If SSN is not provided and noSSN is not checked, it's invalid
  if (!data.socialSecurityNumber && !data.noSSN) {
    return false
  }
  return true
}, {
  message: 'Please provide SSN or check "I don\'t have an SSN"',
  path: ['socialSecurityNumber'],
})

interface LoaderData {
  identificationTypes: IdentificationType[]
  countries: Country[]
}

interface ActionData {
  errors?: Record<string, string>
  values?: Record<string, any>
  creditCheckResult?: {
    status: string
    message: string
  }
}

// Loader
export const loader: LoaderFunction = async ({ request }) => {
  // Check previous steps
  const customerInfo = sessionStorage.getItem('onboarding:customerInfo')
  if (!customerInfo) {
    const url = new URL(request.url)
    const queryString = buildSearchParams(getSearchParams(url.searchParams))
    return redirect(`/customer-info${queryString}`)
  }
  
  const { fi, lng } = getSearchParams(new URL(request.url).searchParams)
  const [identificationTypes, countries] = await Promise.all([
    configService.getIdentificationTypesFor(fi, lng),
    configService.getCountriesFor(fi, lng),
  ])
  
  return {
    identificationTypes,
    countries,
  } satisfies LoaderData
}

// Action
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  
  // Parse form data
  const identificationData = {
    identificationType: data.identificationType,
    identificationNumber: data.identificationNumber,
    state: data.state || undefined,
    country: data.country || undefined,
    socialSecurityNumber: data.socialSecurityNumber || undefined,
    noSSN: data.noSSN === 'true',
    dateOfBirth: data.dateOfBirth,
  }
  
  // Validate
  const result = identificationSchema.safeParse(identificationData)
  
  if (!result.success) {
    const errors: Record<string, string> = {}
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.')
      errors[path] = issue.message
    })
    
    return Response.json({ errors, values: data } satisfies ActionData, { status: 400 })
  }
  
  // Perform credit check if SSN provided
  if (result.data.socialSecurityNumber) {
    try {
      const response = await fetch(`${getApiUrl()}/credit-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssn: result.data.socialSecurityNumber }),
      })
      
      if (!response.ok) {
        throw new Error('Credit check failed')
      }
      
      const creditResult = await response.json()
      
      // If requires verification, show message but don't proceed
      if (creditResult.requiresVerification) {
        return Response.json({
          creditCheckResult: creditResult,
          values: data,
        } satisfies ActionData)
      }
      
      // Save credit check result
      sessionStorage.setItem('onboarding:creditCheckResult', JSON.stringify(creditResult))
    } catch {
      return Response.json({
        errors: { socialSecurityNumber: 'Credit check failed. Please try again.' },
        values: data,
      } satisfies ActionData, { status: 400 })
    }
  }
  
  // Save identification info
  sessionStorage.setItem('onboarding:identificationInfo', JSON.stringify(result.data))
  
  // Redirect to documents
  const url = new URL(request.url)
  const queryString = buildSearchParams(getSearchParams(url.searchParams))
  
  return redirect(`/documents${queryString}`)
}

function IdentificationRoute() {
  const { identificationTypes, countries } = useLoaderData() as LoaderData
  const actionData = useActionData() as ActionData | undefined
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  
  const [selectedType, setSelectedType] = useState<string>(
    actionData?.values?.identificationType || ''
  )
  const [noSSN, setNoSSN] = useState(actionData?.values?.noSSN === 'true')
  
  const isSubmitting = navigation.state === 'submitting'
  const requiresState = identificationTypes.find(
    (type) => type.value === selectedType
  )?.requiresState
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <StepIndicator currentStep={3} totalSteps={5} />
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t('identificationInfo.title')}
      </h1>
      
      {/* Credit check result message */}
      {actionData?.creditCheckResult && (
        <div className={`
          mb-6 p-4 rounded-lg border
          ${actionData.creditCheckResult.status === 'approved' 
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }
        `}>
          <p className="font-medium">{actionData.creditCheckResult.message}</p>
          {actionData.creditCheckResult.status === 'requires_verification' && (
            <p className="mt-2 text-sm">
              {t('identificationInfo.verificationRequired')}
            </p>
          )}
        </div>
      )}
      
      <Form method="post" className="space-y-6">
        {/* Preserve URL parameters */}
        {Array.from(searchParams.entries()).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        
        {/* Identification Document */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t('identificationInfo.identificationDocument')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="identificationType" className="block text-sm font-medium text-gray-700 mb-1">
                {t('identificationInfo.identificationType')} <span className="text-red-500">*</span>
              </label>
              <select
                id="identificationType"
                name="identificationType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={isSubmitting}
                required
                className={`
                  w-full px-3 py-2 border rounded-md
                  ${actionData?.errors?.identificationType ? 'border-red-300' : 'border-gray-300'}
                  ${isSubmitting ? 'bg-gray-100' : 'bg-white'}
                `}
              >
                <option value="">{t('identificationInfo.selectType')}</option>
                {identificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {actionData?.errors?.identificationType && (
                <p className="mt-1 text-sm text-red-600">{actionData.errors.identificationType}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="identificationNumber" className="block text-sm font-medium text-gray-700 mb-1">
                {t('identificationInfo.identificationNumber')} <span className="text-red-500">*</span>
              </label>
              <input
                id="identificationNumber"
                name="identificationNumber"
                type="text"
                defaultValue={actionData?.values?.identificationNumber}
                disabled={isSubmitting}
                required
                className={`
                  w-full px-3 py-2 border rounded-md
                  ${actionData?.errors?.identificationNumber ? 'border-red-300' : 'border-gray-300'}
                  ${isSubmitting ? 'bg-gray-100' : 'bg-white'}
                `}
              />
              {actionData?.errors?.identificationNumber && (
                <p className="mt-1 text-sm text-red-600">{actionData.errors.identificationNumber}</p>
              )}
            </div>
            
            {requiresState && (
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('identificationInfo.issuingState')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  defaultValue={actionData?.values?.state}
                  disabled={isSubmitting}
                  required={requiresState}
                  className={`
                    w-full px-3 py-2 border rounded-md
                    ${actionData?.errors?.state ? 'border-red-300' : 'border-gray-300'}
                    ${isSubmitting ? 'bg-gray-100' : 'bg-white'}
                  `}
                />
                {actionData?.errors?.state && (
                  <p className="mt-1 text-sm text-red-600">{actionData.errors.state}</p>
                )}
              </div>
            )}
            
            {selectedType === 'passport' && (
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('identificationInfo.issuingCountry')} <span className="text-red-500">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  defaultValue={actionData?.values?.country}
                  disabled={isSubmitting}
                  required={selectedType === 'passport'}
                  className={`
                    w-full px-3 py-2 border rounded-md
                    ${actionData?.errors?.country ? 'border-red-300' : 'border-gray-300'}
                    ${isSubmitting ? 'bg-gray-100' : 'bg-white'}
                  `}
                >
                  <option value="">{t('identificationInfo.selectCountry')}</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {actionData?.errors?.country && (
                  <p className="mt-1 text-sm text-red-600">{actionData.errors.country}</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t('identificationInfo.personalInformation')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                {t('identificationInfo.dateOfBirth')} <span className="text-red-500">*</span>
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={actionData?.values?.dateOfBirth}
                disabled={isSubmitting}
                required
                className={`
                  w-full px-3 py-2 border rounded-md
                  ${actionData?.errors?.dateOfBirth ? 'border-red-300' : 'border-gray-300'}
                  ${isSubmitting ? 'bg-gray-100' : 'bg-white'}
                `}
              />
              {actionData?.errors?.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">{actionData.errors.dateOfBirth}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="socialSecurityNumber" className="block text-sm font-medium text-gray-700 mb-1">
                {t('identificationInfo.socialSecurityNumber')}
                {!noSSN && <span className="text-red-500"> *</span>}
              </label>
              <input
                id="socialSecurityNumber"
                name="socialSecurityNumber"
                type="text"
                placeholder="XXX-XX-XXXX"
                defaultValue={actionData?.values?.socialSecurityNumber}
                disabled={isSubmitting || noSSN}
                required={!noSSN}
                className={`
                  w-full px-3 py-2 border rounded-md
                  ${actionData?.errors?.socialSecurityNumber ? 'border-red-300' : 'border-gray-300'}
                  ${isSubmitting || noSSN ? 'bg-gray-100' : 'bg-white'}
                `}
              />
              {actionData?.errors?.socialSecurityNumber && (
                <p className="mt-1 text-sm text-red-600">{actionData.errors.socialSecurityNumber}</p>
              )}
              
              <label className="flex items-center mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="noSSN"
                  value="true"
                  checked={noSSN}
                  onChange={(e) => setNoSSN(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">
                  {t('identificationInfo.noSSN')}
                </span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between">
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
            disabled={isSubmitting}
            className={`
              px-6 py-3 rounded-lg font-medium transition-colors
              ${isSubmitting 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {isSubmitting ? t('common.loading') : t('common.next')}
          </button>
        </div>
      </Form>
    </div>
  )
}

// Export for lazy loading
export const Component = IdentificationRoute