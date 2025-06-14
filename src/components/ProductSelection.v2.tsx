import { useState } from 'react'
import { PiggyBank, CreditCard, TrendingUp, Building2, Sun, Moon, LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProductType, ProductSelectionSchema, type ProductSelectionData } from '../types/products'
import { useOnboarding } from '../context/OnboardingContext'
import { useTheme } from '../context/ThemeContext'
import { useProductsAndBankInfo, useConfigPreloader } from '../hooks/useConfig'
import { useUrlParams } from '../hooks/useUrlParams'
import { LanguageSwitcher } from './LanguageSwitcher'

// Icon mapping to convert string names to React components
const ICON_MAP: Record<string, LucideIcon> = {
  CreditCard,
  PiggyBank,
  TrendingUp,
}

export default function ProductSelectionV2() {
  const { setSelectedProducts: setGlobalProducts, setCurrentStep } = useOnboarding()
  const { theme, toggleTheme, styles } = useTheme()
  const { t } = useTranslation()
  const { fi, lng } = useUrlParams()
  const { preloadLanguages } = useConfigPreloader()
  
  // Use reactive hooks that automatically update when URL parameters change
  const { products, bankInfo, loading, error: configError } = useProductsAndBankInfo()
  
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([])
  const [error, setError] = useState<string>('')

  // Preload other language when component mounts or bank changes
  React.useEffect(() => {
    // Preload both languages for current bank for instant switching
    preloadLanguages(fi).catch(err => {
      console.warn('Failed to preload languages:', err)
    })
  }, [fi, preloadLanguages])

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

  // Show loading state while configs are loading
  if (loading) {
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
          <h1 className={styles.bankName}>{t('bankInfo.defaultName')}</h1>
        </div>
        
        <h1 className={styles.heading}>{t('productSelection.title')}</h1>
        <p className={styles.subheading}>Loading...</p>
      </div>
    )
  }

  // Show error state if configs failed to load
  if (configError) {
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
          <h1 className={styles.bankName}>{t('bankInfo.defaultName')}</h1>
        </div>
        
        <h1 className={styles.heading}>{t('productSelection.title')}</h1>
        <div className={styles.errorMessage}>
          Failed to load configuration: {configError}
        </div>
      </div>
    )
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
        {/* Debug info - can be removed in production */}
        <small style={{ color: styles.vars.color.textMuted, fontSize: '12px', marginTop: '4px' }}>
          Bank: {fi || 'default'} | Language: {lng}
        </small>
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

// Need to import React for useEffect
import React from 'react'