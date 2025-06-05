import { useState } from 'react'
import { PiggyBank, CreditCard, TrendingUp, Building2 } from 'lucide-react'
import { ProductType, ProductSelectionSchema, type ProductSelectionData } from '../types/products'
import { useOnboarding } from '../context/OnboardingContext'
import * as styles from '../styles/theme.css'

const PRODUCTS = [
  {
    type: 'checking' as const,
    title: 'Checking Account',
    description: 'Everyday banking with easy access to your money through ATMs, online banking, and mobile apps.',
    icon: CreditCard,
  },
  {
    type: 'savings' as const,
    title: 'Savings Account',
    description: 'Earn interest on your deposits while keeping your money safe and accessible.',
    icon: PiggyBank,
  },
  {
    type: 'money-market' as const,
    title: 'Money Market Account',
    description: 'Higher interest rates with limited monthly transactions and higher minimum balance requirements.',
    icon: TrendingUp,
  },
]

export default function ProductSelection() {
  const { setSelectedProducts: setGlobalProducts, setCurrentStep } = useOnboarding()
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([])
  const [error, setError] = useState<string>('')

  const toggleProduct = (productType: ProductType) => {
    setSelectedProducts(prev => {
      if (prev.includes(productType)) {
        return prev.filter(p => p !== productType)
      } else {
        return [...prev, productType]
      }
    })
    setError('')
  }

  const handleNext = () => {
    try {
      const data: ProductSelectionData = { selectedProducts }
      ProductSelectionSchema.parse(data)
      
      setGlobalProducts(selectedProducts)
      setCurrentStep(2)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Building2 className={styles.bankIcon} />
        <h1 className={styles.bankName}>Premier Bank</h1>
      </div>
      
      <h1 className={styles.heading}>Let's Open Your Account!</h1>
      <p className={styles.subheading}>
        Select the account types you'd like to open. You can choose multiple options.
      </p>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.productGrid}>
        {PRODUCTS.map((product) => {
          const IconComponent = product.icon
          return (
            <div
              key={product.type}
              className={`${styles.productCard} ${
                selectedProducts.includes(product.type) ? styles.productCardSelected : ''
              }`}
              onClick={() => toggleProduct(product.type)}
            >
              <IconComponent className={styles.productIcon} />
              <h3 className={styles.productTitle}>{product.title}</h3>
              <p className={styles.productDescription}>{product.description}</p>
            </div>
          )
        })}
      </div>

      <div className={styles.buttonContainer}>
        <button
          className={styles.primaryButton}
          onClick={handleNext}
          disabled={selectedProducts.length === 0}
        >
          Next
        </button>
      </div>
    </div>
  )
}