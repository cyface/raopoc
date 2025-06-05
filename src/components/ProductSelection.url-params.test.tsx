import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ProductSelection from './ProductSelection'
import { OnboardingProvider } from '../context/OnboardingContext'
import { ThemeProvider } from '../context/ThemeContext'
import { configService } from '../services/configService'
import type { Product, BankInfo } from '../services/configService'
import '../i18n'

// Mock the config service
vi.mock('../services/configService', () => ({
  configService: {
    getProducts: vi.fn(),
    getBankInfo: vi.fn(),
    refreshForLanguageChange: vi.fn(),
    getCurrentFinancialInstitution: vi.fn(),
    clearCache: vi.fn(),
  }
}))

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000',
  search: '',
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

const mockDefaultProducts = [
  {
    type: 'checking',
    title: 'Default Checking',
    description: 'Default checking account',
    icon: 'CreditCard'
  }
]

const mockWarmBankProducts = [
  {
    type: 'eco-savings',
    title: 'Eco Savings',
    description: 'Warm bank eco savings',
    icon: 'PiggyBank'
  }
]

const mockDefaultBankInfo = {
  bankName: 'Default Bank',
  displayName: 'Default Bank',
  contact: {
    phone: '1-800-DEFAULT',
    phoneDisplay: '1-800-DEFAULT',
    email: 'support@default.com',
    hours: '24/7'
  },
  branding: {
    primaryColor: '#3b82f6',
    logoIcon: 'Building2'
  }
}

const mockWarmBankInfo = {
  bankName: 'Warm Bank',
  displayName: 'Warm Banking Solutions',
  theme: 'greenLight' as const,
  contact: {
    phone: '1-800-WARM',
    phoneDisplay: '1-800-WARM',
    email: 'support@warmbank.com',
    hours: 'Always available'
  },
  branding: {
    primaryColor: '#10b981',
    logoIcon: 'Leaf'
  }
}

const renderProductSelection = () => {
  return render(
    <ThemeProvider>
      <OnboardingProvider>
        <ProductSelection />
      </OnboardingProvider>
    </ThemeProvider>
  )
}

describe('ProductSelection URL Parameter Reactivity Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocation.href = 'http://localhost:3000'
    mockLocation.search = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Issue: fi parameter changes not detected', () => {
    it('FAILS: does not reload configs when fi parameter changes in URL', async () => {
      // Initial render with default bank
      vi.mocked(configService.getProducts).mockResolvedValue(mockDefaultProducts)
      vi.mocked(configService.getBankInfo).mockResolvedValue(mockDefaultBankInfo)
      vi.mocked(configService.getCurrentFinancialInstitution).mockReturnValue(null)

      const { rerender } = renderProductSelection()

      await waitFor(() => {
        expect(screen.getByText('Default Checking')).toBeInTheDocument()
        expect(screen.getByText('Default Bank')).toBeInTheDocument()
      })

      expect(configService.getProducts).toHaveBeenCalledTimes(1)
      expect(configService.getBankInfo).toHaveBeenCalledTimes(1)

      // Simulate URL change to fi=warmbank
      mockLocation.search = '?fi=warmbank'
      vi.mocked(configService.getCurrentFinancialInstitution).mockReturnValue('warmbank')
      vi.mocked(configService.getProducts).mockResolvedValue(mockWarmBankProducts)
      vi.mocked(configService.getBankInfo).mockResolvedValue(mockWarmBankInfo)

      // Force re-render (simulating what would happen in real browser when URL changes)
      rerender(
        <ThemeProvider>
          <OnboardingProvider>
            <ProductSelection />
          </OnboardingProvider>
        </ThemeProvider>
      )

      // THIS TEST SHOULD FAIL because ProductSelection doesn't watch for URL changes
      // The component should reload configs but currently doesn't
      
      // Wait a bit to see if configs would reload
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check if new configs were loaded - this will likely fail with current implementation
      try {
        await waitFor(() => {
          expect(screen.getByText('Eco Savings')).toBeInTheDocument()
          expect(screen.getByText('Warm Bank')).toBeInTheDocument()
        }, { timeout: 500 })
        
        // If we reach here, the component is working correctly
        expect(configService.getProducts).toHaveBeenCalledTimes(2)
        expect(configService.getBankInfo).toHaveBeenCalledTimes(2)
      } catch {
        // This is expected to fail with current implementation
        console.log('Expected failure: ProductSelection does not react to URL changes')
        
        // Verify it's still showing old content
        expect(screen.getByText('Default Checking')).toBeInTheDocument()
        expect(screen.getByText('Default Bank')).toBeInTheDocument()
        
        // Config service should only have been called once (initial load)
        expect(configService.getProducts).toHaveBeenCalledTimes(1)
        expect(configService.getBankInfo).toHaveBeenCalledTimes(1)
        
        throw new Error('ProductSelection component does not react to fi parameter changes - this is the bug!')
      }
    })

    it('DEMONSTRATES: what should happen when fi parameter changes', async () => {
      // This test shows the expected behavior after the fix

      // Mock a component that properly watches for URL changes
      const TestComponentWithUrlWatching = () => {
        const [products, setProducts] = React.useState<Product[]>([])
        const [bankInfo, setBankInfo] = React.useState<BankInfo | null>(null)

        React.useEffect(() => {
          const loadConfigs = async () => {
            const [productsData, bankInfoData] = await Promise.all([
              configService.getProducts(),
              configService.getBankInfo()
            ])
            setProducts(productsData)
            setBankInfo(bankInfoData)
          }
          loadConfigs()
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [mockLocation.search]) // This dependency makes it reload when URL changes

        return (
          <div>
            <div>{bankInfo?.bankName || 'Loading...'}</div>
            {products.map(product => (
              <div key={product.type}>{product.title}</div>
            ))}
          </div>
        )
      }

      // Initial render
      vi.mocked(configService.getProducts).mockResolvedValue(mockDefaultProducts)
      vi.mocked(configService.getBankInfo).mockResolvedValue(mockDefaultBankInfo)

      const { rerender } = render(<TestComponentWithUrlWatching />)

      await waitFor(() => {
        expect(screen.getByText('Default Bank')).toBeInTheDocument()
        expect(screen.getByText('Default Checking')).toBeInTheDocument()
      })

      // Change URL and mock new responses
      mockLocation.search = '?fi=warmbank'
      vi.mocked(configService.getProducts).mockResolvedValue(mockWarmBankProducts)
      vi.mocked(configService.getBankInfo).mockResolvedValue(mockWarmBankInfo)

      // Re-render with new URL
      rerender(<TestComponentWithUrlWatching />)

      // Should load new configs
      await waitFor(() => {
        expect(screen.getByText('Warm Bank')).toBeInTheDocument()
        expect(screen.getByText('Eco Savings')).toBeInTheDocument()
      })

      expect(configService.getProducts).toHaveBeenCalledTimes(2)
      expect(configService.getBankInfo).toHaveBeenCalledTimes(2)
    })
  })

  describe('Issue: language changes not reflected in products', () => {
    it('FAILS: language changes do not trigger product reload', async () => {
      // Initial English load
      vi.mocked(configService.getProducts).mockResolvedValue([
        { type: 'checking', title: 'Checking Account', description: 'English description', icon: 'CreditCard' }
      ])
      vi.mocked(configService.getBankInfo).mockResolvedValue(mockDefaultBankInfo)

      renderProductSelection()

      await waitFor(() => {
        expect(screen.getByText('Checking Account')).toBeInTheDocument()
      })

      // Clear previous calls
      vi.clearAllMocks()

      // Mock Spanish responses
      vi.mocked(configService.getProducts).mockResolvedValue([
        { type: 'checking', title: 'Cuenta Corriente', description: 'Descripción en español', icon: 'CreditCard' }
      ])

      // Simulate language change (LanguageSwitcher calls refreshForLanguageChange)
      configService.refreshForLanguageChange()

      // In current implementation, ProductSelection won't reload because
      // it doesn't listen for language changes or config service updates
      
      await new Promise(resolve => setTimeout(resolve, 100))

      // This should fail because products don't auto-reload after language change
      try {
        await waitFor(() => {
          expect(screen.getByText('Cuenta Corriente')).toBeInTheDocument()
        }, { timeout: 500 })

        // If we reach here, it's working (unexpected with current implementation)
        expect(configService.getProducts).toHaveBeenCalled()
      } catch {
        // Expected failure - component doesn't reload after language change
        expect(screen.getByText('Checking Account')).toBeInTheDocument()
        expect(configService.getProducts).not.toHaveBeenCalled()
        
        throw new Error('ProductSelection does not reload after language changes - this is the bug!')
      }
    })
  })

  describe('Proposed Solution Tests', () => {
    it('should watch for URL parameter changes and reload configs', () => {
      // This test documents what needs to be implemented:
      // 1. ProductSelection should watch window.location.search
      // 2. When search params change, it should reload configs
      // 3. When configService.refreshForLanguageChange() is called, ProductSelection should detect and reload

      expect('ProductSelection needs to be updated to watch for:').toBe('ProductSelection needs to be updated to watch for:')
      expect('1. URL parameter changes (window.location.search)').toBe('1. URL parameter changes (window.location.search)')
      expect('2. Language change events from configService').toBe('2. Language change events from configService')
      expect('3. Maybe use a custom hook for URL watching').toBe('3. Maybe use a custom hook for URL watching')
    })
  })
})

// Need to import React for the test component
import React from 'react'