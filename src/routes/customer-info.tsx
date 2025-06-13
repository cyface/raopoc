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
import type { State } from '../services/configService'

// Validation schema
const customerInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  mailingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  }),
  billingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  useSameAddress: z.boolean(),
})

interface LoaderData {
  selectedProducts: string[]
  states: State[]
}

interface ActionData {
  errors?: Record<string, string>
  values?: Record<string, any>
}

// Loader: Check if previous step is complete and load states
export const customerInfoLoader: LoaderFunction = async ({ request }) => {
  const selectedProducts = sessionStorage.getItem('onboarding:selectedProducts')
  
  if (!selectedProducts) {
    const url = new URL(request.url)
    const queryString = buildSearchParams(getSearchParams(url.searchParams))
    return redirect(`/${queryString}`)
  }
  
  const { fi, lng } = getSearchParams(new URL(request.url).searchParams)
  const states = await configService.getStatesFor(fi, lng)
  
  return {
    selectedProducts: JSON.parse(selectedProducts),
    states,
  } satisfies LoaderData
}

// Action: Validate and save customer info
export const customerInfoAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  
  // Parse form data into nested structure
  const customerData = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    mailingAddress: {
      street: data['mailingAddress.street'],
      city: data['mailingAddress.city'],
      state: data['mailingAddress.state'],
      zipCode: data['mailingAddress.zipCode'],
    },
    useSameAddress: data.useSameAddress === 'true',
    billingAddress: data.useSameAddress === 'true' ? undefined : {
      street: data['billingAddress.street'],
      city: data['billingAddress.city'],
      state: data['billingAddress.state'],
      zipCode: data['billingAddress.zipCode'],
    },
  }
  
  // Validate
  const result = customerInfoSchema.safeParse(customerData)
  
  if (!result.success) {
    const errors: Record<string, string> = {}
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.')
      errors[path] = issue.message
    })
    
    return Response.json({ errors, values: data } satisfies ActionData, { status: 400 })
  }
  
  // Save to session
  sessionStorage.setItem('onboarding:customerInfo', JSON.stringify(result.data))
  
  // Preserve URL parameters
  const url = new URL(request.url)
  const queryString = buildSearchParams(getSearchParams(url.searchParams))
  
  return redirect(`/identification${queryString}`)
}

export function CustomerInfoRoute() {
  const { states } = useLoaderData() as LoaderData
  const actionData = useActionData() as ActionData | undefined
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  
  const [useSameAddress, setUseSameAddress] = useState(true)
  const isSubmitting = navigation.state === 'submitting'
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <StepIndicator currentStep={2} totalSteps={5} />
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t('customerInfo.title')}
      </h1>
      
      <Form method="post" className="space-y-6">
        {/* Preserve URL parameters */}
        {Array.from(searchParams.entries()).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t('customerInfo.personalInfo')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="firstName"
              label={t('customerInfo.firstName')}
              error={actionData?.errors?.firstName}
              defaultValue={actionData?.values?.firstName}
              disabled={isSubmitting}
              required
            />
            
            <FormField
              name="lastName"
              label={t('customerInfo.lastName')}
              error={actionData?.errors?.lastName}
              defaultValue={actionData?.values?.lastName}
              disabled={isSubmitting}
              required
            />
            
            <FormField
              name="email"
              label={t('customerInfo.email')}
              type="email"
              error={actionData?.errors?.email}
              defaultValue={actionData?.values?.email}
              disabled={isSubmitting}
              required
            />
            
            <FormField
              name="phoneNumber"
              label={t('customerInfo.phoneNumber')}
              type="tel"
              error={actionData?.errors?.phoneNumber}
              defaultValue={actionData?.values?.phoneNumber}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>
        
        {/* Mailing Address */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t('customerInfo.mailingAddress')}
          </h2>
          
          <AddressFields
            prefix="mailingAddress"
            states={states}
            errors={actionData?.errors}
            values={actionData?.values}
            disabled={isSubmitting}
          />
        </div>
        
        {/* Billing Address */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {t('customerInfo.billingAddress')}
            </h2>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="useSameAddress"
                value="true"
                checked={useSameAddress}
                onChange={(e) => setUseSameAddress(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">
                {t('customerInfo.sameAsMailingAddress')}
              </span>
            </label>
          </div>
          
          {!useSameAddress && (
            <AddressFields
              prefix="billingAddress"
              states={states}
              errors={actionData?.errors}
              values={actionData?.values}
              disabled={isSubmitting}
            />
          )}
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

// Reusable form field component
function FormField({
  name,
  label,
  type = 'text',
  error,
  defaultValue,
  disabled,
  required,
}: {
  name: string
  label: string
  type?: string
  error?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        className={`
          w-full px-3 py-2 border rounded-md
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100' : 'bg-white'}
        `}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

// Address fields component
function AddressFields({
  prefix,
  states,
  errors,
  values,
  disabled,
}: {
  prefix: string
  states: State[]
  errors?: Record<string, string>
  values?: Record<string, any>
  disabled?: boolean
}) {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-4">
      <FormField
        name={`${prefix}.street`}
        label={t('customerInfo.streetAddress')}
        error={errors?.[`${prefix}.street`]}
        defaultValue={values?.[`${prefix}.street`]}
        disabled={disabled}
        required
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          name={`${prefix}.city`}
          label={t('customerInfo.city')}
          error={errors?.[`${prefix}.city`]}
          defaultValue={values?.[`${prefix}.city`]}
          disabled={disabled}
          required
        />
        
        <div>
          <label htmlFor={`${prefix}.state`} className="block text-sm font-medium text-gray-700 mb-1">
            {t('customerInfo.state')} <span className="text-red-500">*</span>
          </label>
          <select
            id={`${prefix}.state`}
            name={`${prefix}.state`}
            defaultValue={values?.[`${prefix}.state`]}
            disabled={disabled}
            required
            className={`
              w-full px-3 py-2 border rounded-md
              ${errors?.[`${prefix}.state`] ? 'border-red-300' : 'border-gray-300'}
              ${disabled ? 'bg-gray-100' : 'bg-white'}
            `}
          >
            <option value="">{t('customerInfo.selectState')}</option>
            {states.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
          {errors?.[`${prefix}.state`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`${prefix}.state`]}</p>
          )}
        </div>
        
        <FormField
          name={`${prefix}.zipCode`}
          label={t('customerInfo.zipCode')}
          error={errors?.[`${prefix}.zipCode`]}
          defaultValue={values?.[`${prefix}.zipCode`]}
          disabled={disabled}
          required
        />
      </div>
    </div>
  )
}