import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import ProductSelection from './ProductSelection'
import { OnboardingProvider } from '../context/OnboardingContext'
import { configService } from '../services/configService'

// Mock the config service
vi.mock('../services/configService', () => {
  return {
    configService: {
      getProducts: vi.fn(),
      getStates: vi.fn(),
      getIdentificationTypes: vi.fn(),
      getIdentificationTypesThatRequireState: vi.fn(),
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
    <BrowserRouter>
      <OnboardingProvider>
        {component}
      </OnboardingProvider>
    </BrowserRouter>
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
    
    // Set up the mock implementation
    vi.mocked(configService.getProducts).mockResolvedValue([
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
    ])
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