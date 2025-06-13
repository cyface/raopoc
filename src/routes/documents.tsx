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
import { useState, useCallback } from 'react'
import { DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { StepIndicator } from '../components/StepIndicator'
import { configService } from '../services/configService'
import { getSearchParams, buildSearchParams } from '../utils/urlParams'
import type { Document, DocumentConfig } from '../types/documents'

interface LoaderData {
  documents: Document[]
  hasNoSSN: boolean
  selectedProducts: string[]
}

interface ActionData {
  error?: string
}

// Loader
export const loader: LoaderFunction = async ({ request }) => {
  // Check previous steps
  const identificationInfo = sessionStorage.getItem('onboarding:identificationInfo')
  if (!identificationInfo) {
    const url = new URL(request.url)
    const queryString = buildSearchParams(getSearchParams(url.searchParams))
    return redirect(`/identification${queryString}`)
  }
  
  const selectedProducts = JSON.parse(
    sessionStorage.getItem('onboarding:selectedProducts') || '[]'
  )
  const { noSSN } = JSON.parse(identificationInfo)
  
  const { fi, lng } = getSearchParams(new URL(request.url).searchParams)
  const documentConfig = await configService.getDocumentsFor(fi, lng)
  
  // Apply rules to determine which documents are required
  const applicableDocuments = getApplicableDocuments(
    documentConfig,
    selectedProducts,
    { hasNoSSN: noSSN }
  )
  
  return {
    documents: applicableDocuments,
    hasNoSSN: noSSN,
    selectedProducts,
  } satisfies LoaderData
}

// Action
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const acceptedDocumentIds = formData.getAll('acceptedDocuments') as string[]
  
  // Get loader data
  const loaderData = await loader({ request, params: {}, context: {} }) as LoaderData
  const { documents } = loaderData
  const requiredDocumentIds = documents
    .filter(doc => doc.required !== false)
    .map(doc => doc.id)
  
  // Check if all required documents are accepted
  const missingDocuments = requiredDocumentIds.filter(
    id => !acceptedDocumentIds.includes(id)
  )
  
  if (missingDocuments.length > 0) {
    return Response.json({ 
      error: 'Please accept all required documents to continue' 
    } satisfies ActionData, { status: 400 })
  }
  
  // Save acceptance data
  const acceptanceData = {
    acceptances: Object.fromEntries(
      acceptedDocumentIds.map(id => [
        id,
        {
          documentId: id,
          accepted: true,
          timestamp: new Date().toISOString(),
        }
      ])
    ),
    allAccepted: acceptedDocumentIds.length === documents.length,
  }
  
  sessionStorage.setItem('onboarding:documentAcceptance', JSON.stringify(acceptanceData))
  
  // Redirect to confirmation
  const url = new URL(request.url)
  const queryString = buildSearchParams(getSearchParams(url.searchParams))
  
  return redirect(`/confirmation${queryString}`)
}

// Helper function to determine applicable documents
function getApplicableDocuments(
  config: DocumentConfig,
  selectedProducts: string[],
  attributes: { hasNoSSN: boolean }
): Document[] {
  const { documents, rules } = config
  const requiredDocumentIds = new Set<string>()
  const excludedDocumentIds = new Set<string>()
  
  // Apply rules
  rules.forEach((rule: any) => {
    const productMatch = !rule.products || 
      rule.products.some((p: string) => selectedProducts.includes(p))
    const attributeMatch = !rule.customerAttributes ||
      Object.entries(rule.customerAttributes).every(([key, value]) => {
        return attributes[key as keyof typeof attributes] === value
      })
    
    if (productMatch && attributeMatch) {
      rule.requiredDocuments?.forEach((id: string) => requiredDocumentIds.add(id))
      rule.excludeDocuments?.forEach((id: string) => excludedDocumentIds.add(id))
    }
  })
  
  // Filter documents
  return documents.filter((doc: Document) => {
    if (excludedDocumentIds.has(doc.id)) return false
    if (requiredDocumentIds.has(doc.id)) {
      return { ...doc, required: true }
    }
    return doc
  })
}

function DocumentsRoute() {
  const { documents } = useLoaderData() as LoaderData
  const actionData = useActionData() as ActionData | undefined
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  
  const [acceptedDocuments, setAcceptedDocuments] = useState<Set<string>>(new Set())
  const [acceptAll, setAcceptAll] = useState(false)
  
  const isSubmitting = navigation.state === 'submitting'
  
  const handleDocumentToggle = useCallback((documentId: string, accepted: boolean) => {
    setAcceptedDocuments(prev => {
      const next = new Set(prev)
      if (accepted) {
        next.add(documentId)
      } else {
        next.delete(documentId)
      }
      return next
    })
  }, [])
  
  const handleAcceptAll = useCallback(() => {
    if (acceptAll) {
      setAcceptedDocuments(new Set())
    } else {
      setAcceptedDocuments(new Set(documents.map(doc => doc.id)))
    }
    setAcceptAll(!acceptAll)
  }, [acceptAll, documents])
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <StepIndicator currentStep={4} totalSteps={5} />
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t('documentAcceptance.title')}
      </h1>
      
      <p className="text-gray-600 mb-8">
        {t('documentAcceptance.description')}
      </p>
      
      {actionData?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          {actionData.error}
        </div>
      )}
      
      <Form method="post" className="space-y-6">
        {/* Preserve URL parameters */}
        {Array.from(searchParams.entries()).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        
        {/* Accept All Button */}
        {documents.length > 2 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={acceptAll}
                onChange={handleAcceptAll}
                className="mr-3"
              />
              <span className="font-medium text-blue-900">
                {t('documentAcceptance.acceptAll')}
              </span>
            </label>
          </div>
        )}
        
        {/* Document List */}
        <div className="space-y-4">
          {documents.map((document) => (
            <DocumentItem
              key={document.id}
              document={document}
              accepted={acceptedDocuments.has(document.id)}
              onToggle={handleDocumentToggle}
              disabled={isSubmitting}
            />
          ))}
        </div>
        
        {/* Hidden inputs for accepted documents */}
        {Array.from(acceptedDocuments).map(id => (
          <input key={id} type="hidden" name="acceptedDocuments" value={id} />
        ))}
        
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

// Document item component
function DocumentItem({
  document,
  accepted,
  onToggle,
  disabled,
}: {
  document: Document
  accepted: boolean
  onToggle: (id: string, accepted: boolean) => void
  disabled: boolean
}) {
  const { t } = useTranslation()
  
  return (
    <div className={`
      bg-white rounded-lg shadow-md p-6 transition-all
      ${accepted ? 'ring-2 ring-green-500' : ''}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          {accepted ? (
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          ) : (
            <DocumentTextIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {document.name}
            {document.required && (
              <span className="ml-2 text-sm text-red-500">*</span>
            )}
          </h3>
          
          {document.description && (
            <p className="text-gray-600 mb-4">{document.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {t('documentAcceptance.viewDocument')}
            </a>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => onToggle(document.id, e.target.checked)}
                disabled={disabled}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                {t('documentAcceptance.iAccept')}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export for lazy loading
export const Component = DocumentsRoute