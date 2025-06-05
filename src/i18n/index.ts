import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import es from './locales/es.json'

// Helper function to get language from URL parameter
const getLanguageFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null
  
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('lng')
}

// Determine initial language
const getInitialLanguage = (): string => {
  // First priority: URL parameter
  const urlLang = getLanguageFromUrl()
  if (urlLang && ['en', 'es'].includes(urlLang)) {
    return urlLang
  }
  
  // Second priority: localStorage
  if (typeof window !== 'undefined') {
    const storedLang = localStorage.getItem('i18nextLng')
    if (storedLang && ['en', 'es'].includes(storedLang)) {
      return storedLang
    }
  }
  
  // Default: English
  return 'en'
}

// Only initialize if not already initialized
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
    fallbackLng: 'en',
    lng: getInitialLanguage(),
    debug: import.meta.env.DEV,
    
    resources: {
      en: {
        translation: en
      },
      es: {
        translation: es
      }
    },

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    }
  })
}

export default i18n