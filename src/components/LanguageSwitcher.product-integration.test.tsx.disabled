import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LanguageSwitcher } from './LanguageSwitcher'
import ProductSelection from './ProductSelection'
import { ThemeProvider } from '../context/ThemeContext'
import { OnboardingProvider } from '../context/OnboardingContext'
import '../i18n'

// Mock fetch for API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

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

// Mock products data
const englishProducts = [
  {
    type: 'checking',
    title: 'Checking Account',
    description: 'Everyday banking with no monthly fees',
    icon: 'CreditCard'
  },
  {
    type: 'savings',
    title: 'Savings Account', 
    description: 'Grow your money with competitive interest rates',
    icon: 'PiggyBank'
  }
]

const spanishProducts = [
  {
    type: 'checking',
    title: 'Cuenta Corriente',
    description: 'Banca diaria sin tarifas mensuales',
    icon: 'CreditCard'
  },
  {
    type: 'savings',
    title: 'Cuenta de Ahorros',
    description: 'Haga crecer su dinero con tasas de interés competitivas',
    icon: 'PiggyBank'
  }
]

const TestComponent = () => {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <div>
          <LanguageSwitcher />
          <ProductSelection />
        </div>
      </OnboardingProvider>
    </ThemeProvider>
  )
}

describe('LanguageSwitcher Product Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocation.href = 'http://localhost:3000'
    mockLocation.search = ''
    
    // Setup default fetch responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/config/products')) {
        if (url.includes('lng=es') || mockLocation.search.includes('lng=es')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(spanishProducts)
          })
        } else {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(englishProducts)
          })
        }
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('displays English product names initially', async () => {
    render(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByText('Checking Account')).toBeInTheDocument()
      expect(screen.getByText('Savings Account')).toBeInTheDocument()
    })
  })

  it('instantly updates product names when switching to Spanish', async () => {
    render(<TestComponent />)
    
    // Wait for initial English products to load
    await waitFor(() => {
      expect(screen.getByText('Checking Account')).toBeInTheDocument()
    })
    
    // Click Spanish language button (use the first one)
    const spanishButtons = screen.getAllByRole('button', { name: 'ES' })
    fireEvent.click(spanishButtons[0])
    
    // Verify URL was updated
    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost:3000/?lng=es'
      )
    })
    
    // Wait for Spanish products to load
    await waitFor(() => {
      expect(screen.getByText('Cuenta Corriente')).toBeInTheDocument()
      expect(screen.getByText('Cuenta de Ahorros')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Verify English product names are no longer present
    expect(screen.queryByText('Checking Account')).not.toBeInTheDocument()
    expect(screen.queryByText('Savings Account')).not.toBeInTheDocument()
  })

  it('instantly updates product descriptions when switching to Spanish', async () => {
    render(<TestComponent />)
    
    // Wait for initial English products to load
    await waitFor(() => {
      expect(screen.getByText('Everyday banking with no monthly fees')).toBeInTheDocument()
    })
    
    // Click Spanish language button (use the first one)
    const spanishButtons = screen.getAllByRole('button', { name: 'ES' })
    fireEvent.click(spanishButtons[0])
    
    // Wait for Spanish products to load
    await waitFor(() => {
      expect(screen.getByText('Banca diaria sin tarifas mensuales')).toBeInTheDocument()
      expect(screen.getByText('Haga crecer su dinero con tasas de interés competitivas')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Verify English descriptions are no longer present
    expect(screen.queryByText('Everyday banking with no monthly fees')).not.toBeInTheDocument()
    expect(screen.queryByText('Grow your money with competitive interest rates')).not.toBeInTheDocument()
  })

  it('renders product icons correctly', async () => {
    render(<TestComponent />)
    
    // Wait for initial English products to load
    await waitFor(() => {
      expect(screen.getByText('Checking Account')).toBeInTheDocument()
    })
    
    // Verify credit card and piggy bank icons are present
    const svgElements = screen.getAllByRole('img', { hidden: true })
    expect(svgElements.length).toBeGreaterThan(0)
  })

  it('switches back to English products correctly', async () => {
    // Start with Spanish
    mockLocation.search = '?lng=es'
    
    render(<TestComponent />)
    
    // Wait for Spanish products to load
    await waitFor(() => {
      expect(screen.getByText('Cuenta Corriente')).toBeInTheDocument()
    })
    
    // Click English language button (use the first one)
    const englishButtons = screen.getAllByRole('button', { name: 'EN' })
    fireEvent.click(englishButtons[0])
    
    // Verify URL parameter was removed
    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost:3000'
      )
    })
    
    // Wait for English products to load
    await waitFor(() => {
      expect(screen.getByText('Checking Account')).toBeInTheDocument()
      expect(screen.getByText('Savings Account')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Verify Spanish names are no longer present
    expect(screen.queryByText('Cuenta Corriente')).not.toBeInTheDocument()
    expect(screen.queryByText('Cuenta de Ahorros')).not.toBeInTheDocument()
  })

  it('maintains product selection state during language switch', async () => {
    render(<TestComponent />)
    
    // Wait for initial English products to load
    await waitFor(() => {
      expect(screen.getByText('Checking Account')).toBeInTheDocument()
    })
    
    // Select a product by clicking on its card
    const checkingCard = screen.getByText('Checking Account').closest('div')
    if (checkingCard) {
      fireEvent.click(checkingCard)
    }
    
    // Switch to Spanish
    const spanishButton = screen.getByRole('button', { name: 'ES' })
    fireEvent.click(spanishButton)
    
    // Wait for Spanish products to load
    await waitFor(() => {
      expect(screen.getByText('Cuenta Corriente')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Verify the Next button is enabled (indicating selection was maintained)
    const nextButton = screen.getByText('Next')
    expect(nextButton).not.toBeDisabled()
  })

  it('calls fetch with correct language parameter', async () => {
    render(<TestComponent />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
    
    // Clear previous calls
    mockFetch.mockClear()
    
    // Switch to Spanish
    const spanishButton = screen.getByRole('button', { name: 'ES' })
    fireEvent.click(spanishButton)
    
    // Verify fetch was called with Spanish parameter
    await waitFor(() => {
      const fetchCalls = mockFetch.mock.calls
      const spanishCall = fetchCalls.find(call => 
        call[0].includes('/api/config/products') && call[0].includes('lng=es')
      )
      expect(spanishCall).toBeDefined()
    })
  })
})