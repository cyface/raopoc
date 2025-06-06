import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { TranslationLoader } from '../services/translationLoader'

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

// Create translation loader instance
const translationLoader = new TranslationLoader({
  enableCache: true,
  cacheTTL: 300000 // 5 minutes
})

// Custom backend for i18next that uses our TranslationLoader
const customBackend = {
  type: 'backend' as const,
  init: () => {},
  read: async (language: string, namespace: string, callback: Function) => {
    try {
      const translations = await translationLoader.loadNamespace(language, namespace)
      callback(null, translations)
    } catch (error) {
      callback(error, null)
    }
  }
}

// Initialize i18n only if not already initialized
if (!i18n.isInitialized) {
  i18n
    .use(customBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      lng: getInitialLanguage(),
      debug: import.meta.env.DEV,
      
      // Define namespaces
      ns: [
        'common',
        'navigation',
        'products',
        'customer-info',
        'identification',
        'documents',
        'confirmation',
        'validation',
        'bank-info'
      ],
      defaultNS: 'common',
      
      interpolation: {
        escapeValue: false,
      },

      detection: {
        order: ['querystring', 'localStorage', 'navigator'],
        lookupQuerystring: 'lng',
        lookupLocalStorage: 'i18nextLng',
        caches: ['localStorage'],
      },
      
      // Backend options
      backend: {
        loadPath: '/api/translations/{{lng}}/{{ns}}', // This is for reference only, we use custom backend
      },
      
      // React options
      react: {
        useSuspense: false // Disable suspense for async loading
      }
    })
}

// Utility function to reload translations (useful when external editor updates files)
export async function reloadTranslations(language?: string) {
  const currentLanguage = language || i18n.language
  await translationLoader.reloadLanguage(currentLanguage)
  await i18n.reloadResources(currentLanguage)
}

// Export manifest fetcher for UI to show available languages
export async function getTranslationManifest() {
  return translationLoader.getManifest()
}

export default i18n