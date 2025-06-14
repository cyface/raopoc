import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PiggyBank, CreditCard, TrendingUp, Building2, Sun, Moon, LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProductType, ProductSelectionSchema, type ProductSelectionData } from '../types/products'
import { useOnboarding } from '../context/OnboardingContext'
import { useTheme } from '../context/ThemeContext'
import { useProductsAndBankInfo } from '../hooks/useConfig'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ROUTES } from '../constants/routes'

// Icon mapping to convert string names to React components
const ICON_MAP: Record<string, LucideIcon> = {
  CreditCard,
  PiggyBank,
  TrendingUp,
}

export default function ProductSelection() {
  const { setSelectedProducts: setGlobalProducts } = useOnboarding()
  const { theme, toggleTheme, styles } = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  // Use reactive hooks that automatically update when URL parameters change
  const { products, bankInfo } = useProductsAndBankInfo()
  
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
      navigate(ROUTES.STEP_2)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  return (
    <div className={styles.container}>
      <LanguageSwitcher />
      
      <button className={styles.themeToggle} onClick={toggleTheme}>
        {(theme.endsWith('Light') || theme === 'light') ? 
          <Moon size={16} className={styles.themeToggleIcon} /> : 
          <Sun size={16} className={styles.themeToggleIcon} />
        }
        <span className={styles.themeToggleLabel}>
          {(theme.endsWith('Light') || theme === 'light') ? t('common.darkMode') : t('common.lightMode')}
        </span>
      </button>
      
      <div className={styles.header}>
        <Building2 className={styles.bankIcon} />
        <h1 className={styles.bankName}>{bankInfo?.bankName || t('bankInfo.defaultName')}</h1>
      </div>
      
      <h1 className={styles.heading}>{t('productSelection.title')}</h1>
      <p className={styles.subheading}>
        {t('productSelection.subtitle')}
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
          {t('common.next')}
        </button>
      </div>
    </div>
  )
}