import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const { styles } = useTheme()

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' }
  ]

  const updateUrlParameter = (languageCode: string) => {
    const url = new URL(window.location.href)
    
    if (languageCode === 'en') {
      // Remove language parameter for English (default)
      url.searchParams.delete('lng')
    } else {
      // Set language parameter for non-English languages
      url.searchParams.set('lng', languageCode)
    }
    
    // Preserve other parameters (like fi for bank selection)
    // Update URL without page reload
    window.history.replaceState({}, '', url.toString())
  }

  const handleLanguageChange = (languageCode: string) => {
    // Update URL parameter
    updateUrlParameter(languageCode)
    
    // Change language in i18next
    i18n.changeLanguage(languageCode)
    
    // Note: ConfigServiceV2 automatically handles language changes via reactive hooks
  }

  return (
    <div className={styles.languageSwitcher}>
      <Globe className={styles.languageIcon} />
      <div className={styles.languageLinks}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`${styles.languageLink} ${
              i18n.language === lang.code ? styles.languageLinkActive : ''
            }`}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}