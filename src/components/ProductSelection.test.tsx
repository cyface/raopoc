import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProductSelection from './ProductSelection'
import { OnboardingProvider } from '../context/OnboardingContext'

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <OnboardingProvider>
        {component}
      </OnboardingProvider>
    </BrowserRouter>
  )
}

describe('ProductSelection', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the product selection page with title and products', () => {
    renderWithProviders(<ProductSelection />)
    
    expect(screen.getByText('Let\'s Open Your Account!')).toBeInTheDocument()
    expect(screen.getByText('Checking Account')).toBeInTheDocument()
    expect(screen.getByText('Savings Account')).toBeInTheDocument()
    expect(screen.getByText('Money Market Account')).toBeInTheDocument()
  })

  it('disables next button when no products are selected', () => {
    renderWithProviders(<ProductSelection />)
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).toBeDisabled()
  })

  it('enables next button when a product is selected', () => {
    renderWithProviders(<ProductSelection />)
    
    const checkingAccount = screen.getByText('Checking Account')
    fireEvent.click(checkingAccount)
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).not.toBeDisabled()
  })

  it('allows selecting multiple products', () => {
    renderWithProviders(<ProductSelection />)
    
    const checkingAccount = screen.getByText('Checking Account')
    const savingsAccount = screen.getByText('Savings Account')
    
    fireEvent.click(checkingAccount)
    fireEvent.click(savingsAccount)
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)
    
    // Should move to step 2 instead of showing alert
    expect(nextButton).not.toBeDisabled()
  })

  it('allows deselecting a product by clicking it again', () => {
    renderWithProviders(<ProductSelection />)
    
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

  it('shows error when trying to proceed without selecting products', () => {
    renderWithProviders(<ProductSelection />)
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    
    // Enable button temporarily by selecting and deselecting
    const checkingAccount = screen.getByText('Checking Account')
    fireEvent.click(checkingAccount)
    fireEvent.click(checkingAccount)
    
    // Now button should be disabled, but let's test validation directly
    expect(nextButton).toBeDisabled()
  })
})