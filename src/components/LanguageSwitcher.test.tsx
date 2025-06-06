import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeProvider } from '../context/ThemeContext'
import '../i18n'

// Mock the config service
vi.mock('../services/configService', () => ({
  configService: {
    // New API methods
    getProductsFor: vi.fn(),
    getBankInfoFor: vi.fn(),
    getStatesFor: vi.fn(),
    getCountriesFor: vi.fn(),
    getIdentificationTypesFor: vi.fn(),
    getDocumentsFor: vi.fn(),
    preloadLanguages: vi.fn(),
    preloadConfiguration: vi.fn(),
    clearAllCaches: vi.fn(),
    getCacheStats: vi.fn(),
    // Backwards compatibility methods
    getProducts: vi.fn(),
    getStates: vi.fn(),
    getIdentificationTypes: vi.fn(),
    getBankInfo: vi.fn().mockResolvedValue({
      bankName: 'Test Bank',
      displayName: 'Test Bank',
      contact: { phone: '123-456-7890', phoneDisplay: '123-456-7890', email: 'test@bank.com', hours: '24/7' },
      branding: { primaryColor: '#000', logoIcon: 'Building2' }
    }),
    refreshForLanguageChange: vi.fn(),
    clearCache: vi.fn(),
  }
}))

// Mock URL manipulation
const mockReplaceState = vi.fn()
const mockLocation = {
  href: 'http://localhost:3000',
  search: '',
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

Object.defineProperty(window, 'history', {
  value: {
    replaceState: mockReplaceState,
  },
  writable: true,
})

const renderLanguageSwitcher = () => {
  return render(
    <ThemeProvider>
      <LanguageSwitcher />
    </ThemeProvider>
  )
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocation.href = 'http://localhost:3000'
    mockLocation.search = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders with language link buttons', () => {
    renderLanguageSwitcher()
    
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ES' })).toBeInTheDocument()
  })

  it('displays both English and Spanish buttons', () => {
    renderLanguageSwitcher()
    
    const englishButton = screen.getByRole('button', { name: 'EN' })
    const spanishButton = screen.getByRole('button', { name: 'ES' })
    
    expect(englishButton).toBeInTheDocument()
    expect(spanishButton).toBeInTheDocument()
  })

  it('changes language to Spanish and updates URL', async () => {
    renderLanguageSwitcher()
    
    const spanishButton = screen.getByRole('button', { name: 'ES' })
    fireEvent.click(spanishButton)
    
    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost:3000/?lng=es'
      )
    })
  })

  it('changes language to English and removes lng parameter', async () => {
    // Start with Spanish in URL
    mockLocation.href = 'http://localhost:3000/?lng=es'
    mockLocation.search = '?lng=es'
    
    renderLanguageSwitcher()
    
    const englishButton = screen.getByRole('button', { name: 'EN' })
    fireEvent.click(englishButton)
    
    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost:3000/'
      )
    })
  })

  it('preserves fi parameter when changing language', async () => {
    mockLocation.href = 'http://localhost:3000/?fi=warmbank'
    mockLocation.search = '?fi=warmbank'
    
    renderLanguageSwitcher()
    
    const spanishButton = screen.getByRole('button', { name: 'ES' })
    fireEvent.click(spanishButton)
    
    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost:3000/?fi=warmbank&lng=es'
      )
    })
  })
})