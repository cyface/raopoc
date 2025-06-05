import { useState, useEffect } from 'react'
import { PiggyBank, CreditCard, TrendingUp, Building2, LucideIcon } from 'lucide-react'
import { ProductType, ProductSelectionSchema, type ProductSelectionData } from '../types/products'
import { useOnboarding } from '../context/OnboardingContext'
import { configService, type Product, type BankInfo } from '../services/configService'
import * as styles from '../styles/theme.css'

// Icon mapping to convert string names to React components
const ICON_MAP: Record<string, LucideIcon> = {
  CreditCard,
  PiggyBank,
  TrendingUp,
}

export default function ProductSelection() {
  const { setSelectedProducts: setGlobalProducts, setCurrentStep } = useOnboarding()
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [productsData, bankInfoData] = await Promise.all([
          configService.getProducts(),
          configService.getBankInfo()
        ])
        setProducts(productsData)
        setBankInfo(bankInfoData)
      } catch (error) {
        console.error('Failed to load configuration:', error)
      }
    }
    loadConfigs()
  }, [])

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
        <h1 className={styles.bankName}>{bankInfo?.bankName || 'Cool Bank'}</h1>
      </div>
      
      <h1 className={styles.heading}>Let&apos;s Open Your Account!</h1>
      <p className={styles.subheading}>
        Select the account types you&apos;d like to open. You can choose multiple options.
      </p>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.productGrid}>
        {products && products.map((product) => {
          const IconComponent = ICON_MAP[product.icon] || CreditCard // fallback icon
          return (
            <div
              key={product.type}
              className={`${styles.productCard} ${
                selectedProducts.includes(product.type as ProductType) ? styles.productCardSelected : ''
              }`}
              onClick={() => toggleProduct(product.type as ProductType)}
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