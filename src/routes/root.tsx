import { 
  Outlet, 
  useLoaderData,
  useNavigation,
  useSearchParams,
  ScrollRestoration,
} from 'react-router'
import { useEffect } from 'react'
import { ThemeProvider } from '../context/ThemeContext'
import { OnboardingProvider } from '../context/OnboardingContext'
import { useTranslation } from 'react-i18next'
import type { RootLoaderData } from './loaders/rootLoader'


// Progress indicator component
function ProgressIndicator() {
  const navigation = useNavigation()
  
  if (navigation.state === 'idle') return null
  
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-blue-200 z-50">
      <div 
        className="h-full bg-blue-600 transition-all duration-300 ease-out"
        style={{
          width: navigation.state === 'loading' ? '80%' : '100%',
        }}
      />
    </div>
  )
}

// Language sync component
function LanguageSync() {
  const [searchParams] = useSearchParams()
  const { i18n } = useTranslation()
  const lng = searchParams.get('lng') || 'en'
  
  useEffect(() => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng)
    }
  }, [lng, i18n])
  
  return null
}

// Theme sync component
function ThemeSync() {
  const [searchParams] = useSearchParams()
  const dark = searchParams.get('dark') === '1'
  
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])
  
  return null
}

export function RootRoute() {
  const data = useLoaderData() as RootLoaderData
  const navigation = useNavigation()
  
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <LanguageSync />
        <ThemeSync />
        <ProgressIndicator />
        
        <div className={navigation.state === 'submitting' ? 'opacity-50 pointer-events-none' : ''}>
          {/* Bank info for screen readers */}
          <div className="sr-only" aria-live="polite">
            Welcome to {data.bankInfo?.bankName || 'our bank'}
          </div>
          
          {/* Main content */}
          <main className="min-h-screen">
            <Outlet context={data} />
          </main>
        </div>
        
        <ScrollRestoration />
      </OnboardingProvider>
    </ThemeProvider>
  )
}