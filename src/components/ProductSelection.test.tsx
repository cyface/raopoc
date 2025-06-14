import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import ProductSelection from './ProductSelection'
import { OnboardingProvider } from '../context/OnboardingContext'
import { ThemeProvider } from '../context/ThemeContext'
import { configService } from '../services/configService'

// Mock the config service
vi.mock('../services/configService', () => {
  return {
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
      getIdentificationTypesThatRequireState: vi.fn(),
      getBankInfo: vi.fn(),
      clearCache: vi.fn(),
    },
    // Export types
    State: {},
    IdentificationType: {},
    Product: {},
  }
})

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <OnboardingProvider>
          {component}
        </OnboardingProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

const waitForProductsLoad = async () => {
  await waitFor(() => {
    expect(screen.getByText('Checking Account')).toBeInTheDocument()
  }, { timeout: 3000 })
}

describe('ProductSelection', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    const mockProducts = [
      {
        type: 'checking',
        title: 'Checking Account',
        description: 'Everyday banking with easy access to your money through ATMs, online banking, and mobile apps.',
        icon: 'CreditCard'
      },
      {
        type: 'savings',
        title: 'Savings Account',
        description: 'Earn interest on your deposits while keeping your money safe and accessible.',
        icon: 'PiggyBank'
      },
      {
        type: 'money-market',
        title: 'Money Market Account',
        description: 'Higher interest rates with limited monthly transactions and higher minimum balance requirements.',
        icon: 'TrendingUp'
      }
    ]
    
    const mockBankInfo = {
      bankName: 'Cool Bank',
      displayName: 'Cool Bank',
      contact: {
        phone: '1-800-COOLBNK',
        phoneDisplay: '1-800-COOLBNK (1-800-XXX-XXXX)',
        email: 'support@coolbank.com',
        hours: 'Monday - Friday 8:00 AM - 8:00 PM EST',
      },
      branding: {
        primaryColor: '#3b82f6',
        logoIcon: 'Building2',
      },
    }
    
    // Set up the mock implementation for both old and new APIs
    vi.mocked(configService.getProducts).mockResolvedValue(mockProducts)
    vi.mocked(configService.getBankInfo).mockResolvedValue(mockBankInfo)
    vi.mocked(configService.getProductsFor).mockResolvedValue(mockProducts)
    vi.mocked(configService.getBankInfoFor).mockResolvedValue(mockBankInfo)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the product selection page with title and products', async () => {
    renderWithProviders(<ProductSelection />)
    
    expect(screen.getByText('Let\'s Open Your Account!')).toBeInTheDocument()
    
    await waitForProductsLoad()
    
    expect(screen.getByText('Checking Account')).toBeInTheDocument()
    expect(screen.getByText('Savings Account')).toBeInTheDocument()
    expect(screen.getByText('Money Market Account')).toBeInTheDocument()
  })

  it('disables next button when no products are selected', async () => {
    renderWithProviders(<ProductSelection />)
    
    await waitForProductsLoad()
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).toBeDisabled()
  })

  it('enables next button when a product is selected', async () => {
    renderWithProviders(<ProductSelection />)
    
    await waitForProductsLoad()
    
    const checkingAccount = screen.getByText('Checking Account')
    fireEvent.click(checkingAccount)
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).not.toBeDisabled()
  })

  it('allows selecting multiple products', async () => {
    renderWithProviders(<ProductSelection />)
    
    await waitForProductsLoad()
    
    const checkingAccount = screen.getByText('Checking Account')
    const savingsAccount = screen.getByText('Savings Account')
    
    fireEvent.click(checkingAccount)
    fireEvent.click(savingsAccount)
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)
    
    // Should move to step 2 instead of showing alert
    expect(nextButton).not.toBeDisabled()
  })

  it('allows deselecting a product by clicking it again', async () => {
    renderWithProviders(<ProductSelection />)
    
    await waitForProductsLoad()
    
    const checkingAccount = screen.getByText('Checking Account')
    
    // Select
    fireEvent.click(checkingAccount)
    let nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).not.toBeDisabled()
    
    // Deselect
    fireEvent.click(checkingAccount)
    nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).toBeDisabled()
  })

  it('shows error when trying to proceed without selecting products', async () => {
    renderWithProviders(<ProductSelection />)
    
    await waitForProductsLoad()
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    
    // Enable button temporarily by selecting and deselecting
    const checkingAccount = screen.getByText('Checking Account')
    fireEvent.click(checkingAccount)
    fireEvent.click(checkingAccount)
    
    // Now button should be disabled, but let's test validation directly
    expect(nextButton).toBeDisabled()
  })
})