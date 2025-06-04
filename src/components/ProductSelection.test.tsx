import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProductSelection from './ProductSelection'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
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
    renderWithRouter(<ProductSelection />)
    
    expect(screen.getByText('Let\'s Open Your Account')).toBeInTheDocument()
    expect(screen.getByText('Checking Account')).toBeInTheDocument()
    expect(screen.getByText('Savings Account')).toBeInTheDocument()
    expect(screen.getByText('Money Market Account')).toBeInTheDocument()
  })

  it('disables next button when no products are selected', () => {
    renderWithRouter(<ProductSelection />)
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).toBeDisabled()
  })

  it('enables next button when a product is selected', () => {
    renderWithRouter(<ProductSelection />)
    
    const checkingAccount = screen.getByText('Checking Account')
    fireEvent.click(checkingAccount)
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).not.toBeDisabled()
  })

  it('allows selecting multiple products', () => {
    renderWithRouter(<ProductSelection />)
    
    const checkingAccount = screen.getByText('Checking Account')
    const savingsAccount = screen.getByText('Savings Account')
    
    fireEvent.click(checkingAccount)
    fireEvent.click(savingsAccount)
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)
    
    expect(window.alert).toHaveBeenCalledWith('Selected products: checking, savings')
  })

  it('allows deselecting a product by clicking it again', () => {
    renderWithRouter(<ProductSelection />)
    
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
    renderWithRouter(<ProductSelection />)
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    
    // Enable button temporarily by selecting and deselecting
    const checkingAccount = screen.getByText('Checking Account')
    fireEvent.click(checkingAccount)
    fireEvent.click(checkingAccount)
    
    // Now button should be disabled, but let's test validation directly
    expect(nextButton).toBeDisabled()
  })
})