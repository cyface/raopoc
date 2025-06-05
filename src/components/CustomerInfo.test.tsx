import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import CustomerInfo from './CustomerInfo'
import { OnboardingProvider } from '../context/OnboardingContext'
import { type ProductType } from '../types/products'
import { configService } from '../services/configService'

// Mock the config service
vi.mock('../services/configService', () => {
  return {
    configService: {
      getProducts: vi.fn(),
      getStates: vi.fn(),
      getIdentificationTypes: vi.fn(),
      getIdentificationTypesThatRequireState: vi.fn(),
      getBankInfo: vi.fn(),
      clearCache: vi.fn(),
    },
    State: {},
    IdentificationType: {},
    Product: {},
  }
})

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <OnboardingProvider>
      {component}
    </OnboardingProvider>
  )
}

const mockOnNext = vi.fn()

const defaultProps = {
  selectedProducts: ['checking', 'savings'] as ProductType[],
  onNext: mockOnNext,
}

describe('CustomerInfo', () => {
  beforeEach(() => {
    mockOnNext.mockClear()
    
    // Set up the mock implementation
    vi.mocked(configService.getStates).mockResolvedValue([
      { code: 'AL', name: 'Alabama' },
      { code: 'CA', name: 'California' },
      { code: 'NY', name: 'New York' },
      { code: 'TX', name: 'Texas' },
    ])
    
    vi.mocked(configService.getBankInfo).mockResolvedValue({
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
    })
  })

  it('renders the customer info form with all required fields', async () => {
    renderWithProvider(<CustomerInfo {...defaultProps} />)
    
    // Wait for states to load
    await waitFor(() => {
      expect(screen.getByText('Personal Information')).toBeInTheDocument()
    })
    
    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument()
    expect(screen.getByText('Mailing Address')).toBeInTheDocument()
  })

  it('displays selected products', async () => {
    renderWithProvider(<CustomerInfo {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Selected Products:')).toBeInTheDocument()
    })
    
    expect(screen.getByText('checking')).toBeInTheDocument()
    expect(screen.getByText('savings')).toBeInTheDocument()
  })

  it('shows billing address toggle enabled by default', async () => {
    renderWithProvider(<CustomerInfo {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Use same address for billing')).toBeInTheDocument()
    })
    
    const toggle = screen.getByText('Use same address for billing')
    expect(toggle).toBeInTheDocument()
    
    // Billing address fields should not be visible initially
    expect(screen.queryByText('Billing Address')).not.toBeInTheDocument()
  })

  it('shows billing address fields when toggle is disabled', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CustomerInfo {...defaultProps} />)
    
    const toggleLabel = screen.getByText('Use same address for billing')
    await user.click(toggleLabel)
    
    expect(screen.getByText('Billing Address')).toBeInTheDocument()
    expect(screen.getAllByLabelText('Street Address')).toHaveLength(2)
  })

  it('validates required fields on submit', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CustomerInfo {...defaultProps} />)
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    // Zod validates in order, so only the first error will show initially
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument()
    })
    
    expect(mockOnNext).not.toHaveBeenCalled()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CustomerInfo {...defaultProps} />)
    
    // Fill all fields except use invalid email (no @ symbol)
    await user.type(screen.getByLabelText('First Name'), 'John')
    await user.type(screen.getByLabelText('Last Name'), 'Doe')
    const emailInput = screen.getByLabelText('Email Address')
    await user.type(emailInput, 'notanemail')
    await user.type(screen.getByLabelText('Phone Number'), '(555) 123-4567')
    
    // Fill mailing address
    await user.type(screen.getByLabelText('Street Address'), '123 Main St')
    await user.type(screen.getByLabelText('City'), 'Anytown')
    await user.selectOptions(screen.getByLabelText('State'), 'CA')
    await user.type(screen.getByLabelText('ZIP Code'), '12345')
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    // Just check that onNext was not called since the email is invalid
    expect(mockOnNext).not.toHaveBeenCalled()
  })

  it('validates email with consecutive dots', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CustomerInfo {...defaultProps} />)
    
    // Fill required fields first so email validation can be triggered
    await user.type(screen.getByLabelText('First Name'), 'John')
    await user.type(screen.getByLabelText('Last Name'), 'Doe')
    const emailInput = screen.getByLabelText('Email Address')
    await user.type(emailInput, 'test..user@example.com')
    await user.type(screen.getByLabelText('Phone Number'), '(555) 123-4567')
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email cannot contain consecutive dots')).toBeInTheDocument()
    })
  })

  it('validates phone number format', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CustomerInfo {...defaultProps} />)
    
    const phoneInput = screen.getByLabelText('Phone Number')
    await user.type(phoneInput, '123')
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid phone number format')).toBeInTheDocument()
    })
  })

  it('validates ZIP code format', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CustomerInfo {...defaultProps} />)
    
    const mailingZip = screen.getAllByLabelText('ZIP Code')[0]
    await user.type(mailingZip, '123')
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid ZIP code format')).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CustomerInfo {...defaultProps} />)
    
    // Fill out the form
    await user.type(screen.getByLabelText('First Name'), 'John')
    await user.type(screen.getByLabelText('Last Name'), 'Doe')
    await user.type(screen.getByLabelText('Email Address'), 'john.doe@example.com')
    await user.type(screen.getByLabelText('Phone Number'), '(555) 123-4567')
    
    // Mailing address
    await user.type(screen.getByLabelText('Street Address'), '123 Main St')
    await user.type(screen.getByLabelText('City'), 'Anytown')
    await user.selectOptions(screen.getByLabelText('State'), 'CA')
    await user.type(screen.getByLabelText('ZIP Code'), '12345')
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '(555) 123-4567',
        mailingAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
        },
        useSameAddress: true,
      })
    })
  })

  it('has correct autocomplete attributes on form fields', async () => {
    renderWithProvider(<CustomerInfo {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
    })
    
    // Personal details
    expect(screen.getByLabelText('First Name')).toHaveAttribute('autocomplete', 'given-name')
    expect(screen.getByLabelText('Last Name')).toHaveAttribute('autocomplete', 'family-name')
    expect(screen.getByLabelText('Email Address')).toHaveAttribute('autocomplete', 'email')
    expect(screen.getByLabelText('Phone Number')).toHaveAttribute('autocomplete', 'tel')
    
    // Mailing address
    expect(screen.getByLabelText('Street Address')).toHaveAttribute('autocomplete', 'street-address')
    expect(screen.getByLabelText('City')).toHaveAttribute('autocomplete', 'address-level2')
    expect(screen.getByLabelText('State')).toHaveAttribute('autocomplete', 'address-level1')
    expect(screen.getByLabelText('ZIP Code')).toHaveAttribute('autocomplete', 'postal-code')
  })

  it('has correct autocomplete attributes on billing address fields', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CustomerInfo {...defaultProps} />)
    
    // Toggle to show billing address
    const toggleLabel = screen.getByText('Use same address for billing')
    await user.click(toggleLabel)
    
    // Wait for billing address section to appear
    await waitFor(() => {
      expect(screen.getByText('Billing Address')).toBeInTheDocument()
    })
    
    // Get billing address fields (they're the second set)
    const streetAddresses = screen.getAllByLabelText('Street Address')
    const cities = screen.getAllByLabelText('City')
    const states = screen.getAllByLabelText('State')
    const zipCodes = screen.getAllByLabelText('ZIP Code')
    
    expect(streetAddresses[1]).toHaveAttribute('autocomplete', 'billing street-address')
    expect(cities[1]).toHaveAttribute('autocomplete', 'billing address-level2')
    expect(states[1]).toHaveAttribute('autocomplete', 'billing address-level1')
    expect(zipCodes[1]).toHaveAttribute('autocomplete', 'billing postal-code')
  })

  it('submits form with separate billing address', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CustomerInfo {...defaultProps} />)
    
    // Fill out the form
    await user.type(screen.getByLabelText('First Name'), 'John')
    await user.type(screen.getByLabelText('Last Name'), 'Doe')
    await user.type(screen.getByLabelText('Email Address'), 'john.doe@example.com')
    await user.type(screen.getByLabelText('Phone Number'), '(555) 123-4567')
    
    // Mailing address
    const streetInputs = screen.getAllByLabelText('Street Address')
    await user.type(streetInputs[0], '123 Main St')
    await user.type(screen.getByLabelText('City'), 'Anytown')
    await user.selectOptions(screen.getByLabelText('State'), 'CA')
    const zipInputs = screen.getAllByLabelText('ZIP Code')
    await user.type(zipInputs[0], '12345')
    
    // Disable same address toggle
    const toggleLabel = screen.getByText('Use same address for billing')
    await user.click(toggleLabel)
    
    // Fill billing address
    await waitFor(() => {
      expect(screen.getByText('Billing Address')).toBeInTheDocument()
    })
    
    const billingStreetInputs = screen.getAllByLabelText('Street Address')
    await user.type(billingStreetInputs[1], '456 Oak Ave')
    const billingCityInputs = screen.getAllByLabelText('City')
    await user.type(billingCityInputs[1], 'Other City')
    const billingStateInputs = screen.getAllByLabelText('State')
    await user.selectOptions(billingStateInputs[1], 'NY')
    const billingZipInputs = screen.getAllByLabelText('ZIP Code')
    await user.type(billingZipInputs[1], '67890')
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '(555) 123-4567',
        mailingAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
        },
        billingAddress: {
          street: '456 Oak Ave',
          city: 'Other City',
          state: 'NY',
          zipCode: '67890',
        },
        useSameAddress: false,
      })
    })
  })
})