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
import { BuildingOffice2Icon } from '@heroicons/react/24/outline'
import { configService } from '../services/configService'
import { getSearchParams, buildSearchParams } from '../utils/urlParams'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import type { Product } from '../services/configService'

interface LoaderData {
  products: Product[]
  bankName: string
}

interface ActionData {
  error?: string
}

// Loader: Fetch products for the current bank/language
export const productSelectionLoader: LoaderFunction = async ({ request }) => {
  const { fi, lng } = getSearchParams(new URL(request.url).searchParams)
  
  const [products, bankInfo] = await Promise.all([
    configService.getProductsFor(fi, lng),
    configService.getBankInfoFor(fi, lng),
  ])
  
  return {
    products,
    bankName: bankInfo?.bankName || 'Our Bank',
  } satisfies LoaderData
}

// Action: Handle product selection
export const productSelectionAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const selectedProducts = formData.getAll('products') as string[]
  
  if (selectedProducts.length === 0) {
    return { error: 'Please select at least one product' } satisfies ActionData
  }
  
  // Preserve URL parameters when navigating
  const url = new URL(request.url)
  const queryString = buildSearchParams(getSearchParams(url.searchParams))
  
  // Store selection in session storage (in real app, use server session)
  sessionStorage.setItem('onboarding:selectedProducts', JSON.stringify(selectedProducts))
  
  return redirect(`/customer-info${queryString}`)
}

export function ProductSelectionRoute() {
  const { products, bankName } = useLoaderData() as LoaderData
  const actionData = useActionData() as ActionData | undefined
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  
  const isSubmitting = navigation.state === 'submitting'
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <LanguageSwitcher />
      
      <div className="flex items-center justify-center mb-8">
        <BuildingOffice2Icon className="h-12 w-12 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">
          {t('productSelection.welcomeTo', { bankName })}
        </h1>
      </div>
      
      <p className="text-lg text-gray-600 mb-12 text-center">
        {t('productSelection.subtitle')}
      </p>
      
      <Form method="post" className="space-y-8">
        {/* Preserve URL parameters */}
        {Array.from(searchParams.entries()).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        
        {actionData?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
            {actionData.error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.type} product={product} disabled={isSubmitting} />
          ))}
        </div>
        
        <div className="flex justify-end mt-8">
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

// Product card component with optimistic UI
function ProductCard({ product, disabled }: { product: Product; disabled: boolean }) {
  const navigation = useNavigation()
  
  // Check if this product is being selected
  const isSelecting = 
    navigation.state === 'submitting' && 
    navigation.formData?.getAll('products').includes(product.type)
  
  return (
    <label 
      className={`
        relative flex flex-col p-6 bg-white rounded-lg shadow-md cursor-pointer
        transition-all duration-200 hover:shadow-lg
        ${isSelecting ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        type="checkbox"
        name="products"
        value={product.type}
        disabled={disabled}
        className="sr-only"
      />
      
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">{product.icon}</span>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {product.title}
          </h3>
          <p className="text-gray-600 mt-1">
            {product.description}
          </p>
        </div>
      </div>
      
      <div className="absolute top-4 right-4">
        <div className={`
          w-6 h-6 rounded-full border-2 
          ${isSelecting ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
        `}>
          {isSelecting && (
            <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    </label>
  )
}