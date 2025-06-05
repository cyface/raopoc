import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import IdentificationInfo from './IdentificationInfo'
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

const waitForConfigLoad = async () => {
  await waitFor(() => {
    expect(screen.getByRole('option', { name: 'Passport' })).toBeInTheDocument()
  })
}

const mockOnNext = vi.fn()

const defaultProps = {
  onNext: mockOnNext,
}

describe('IdentificationInfo', () => {
  beforeEach(() => {
    mockOnNext.mockClear()
    
    // Set up the mock implementation
    vi.mocked(configService.getStates).mockResolvedValue([
      { code: 'AL', name: 'Alabama' },
      { code: 'CA', name: 'California' },
      { code: 'NY', name: 'New York' },
      { code: 'TX', name: 'Texas' },
    ])
    
    vi.mocked(configService.getIdentificationTypes).mockResolvedValue([
      { value: 'passport', label: 'Passport', requiresState: false },
      { value: 'drivers-license', label: 'Driver\'s License', requiresState: true },
      { value: 'state-id', label: 'State ID', requiresState: true },
      { value: 'military-id', label: 'Military ID', requiresState: false },
    ])
    
    vi.mocked(configService.getIdentificationTypesThatRequireState).mockResolvedValue(['drivers-license', 'state-id'])
    
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

  it('renders the identification form with all required fields', async () => {
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Identity Verification')).toBeInTheDocument()
    })
    
    expect(screen.getByLabelText('Identification Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Passport Number')).toBeInTheDocument()
    expect(screen.getByText('Social Security Information')).toBeInTheDocument()
    expect(screen.getByLabelText('Social Security Number')).toBeInTheDocument()
    expect(screen.getByText('I don\'t have a Social Security Number')).toBeInTheDocument()
  })

  it('shows state dropdown when driver\'s license is selected', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    await waitForConfigLoad()
    
    const identificationSelect = screen.getByLabelText('Identification Type')
    await user.selectOptions(identificationSelect, 'drivers-license')
    
    expect(screen.getByLabelText('Driver\'s License Number')).toBeInTheDocument()
    expect(screen.getByLabelText('Issuing State')).toBeInTheDocument()
  })

  it('shows state dropdown when state ID is selected', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    await waitForConfigLoad()
    
    const identificationSelect = screen.getByLabelText('Identification Type')
    await user.selectOptions(identificationSelect, 'state-id')
    
    expect(screen.getByLabelText('State ID Number')).toBeInTheDocument()
    expect(screen.getByLabelText('Issuing State')).toBeInTheDocument()
  })

  it('hides state dropdown for passport and military ID types', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    await waitForConfigLoad()
    
    // Default is passport
    expect(screen.queryByLabelText('Issuing State')).not.toBeInTheDocument()
    
    // Switch to military ID
    const identificationSelect = screen.getByLabelText('Identification Type')
    await user.selectOptions(identificationSelect, 'military-id')
    
    expect(screen.getByLabelText('Military ID Number')).toBeInTheDocument()
    expect(screen.queryByLabelText('Issuing State')).not.toBeInTheDocument()
  })

  it('updates field labels based on identification type', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    await waitForConfigLoad()
    
    const identificationSelect = screen.getByLabelText('Identification Type')
    
    // Test all identification types
    await user.selectOptions(identificationSelect, 'passport')
    expect(screen.getByLabelText('Passport Number')).toBeInTheDocument()
    
    await user.selectOptions(identificationSelect, 'drivers-license')
    expect(screen.getByLabelText('Driver\'s License Number')).toBeInTheDocument()
    
    await user.selectOptions(identificationSelect, 'state-id')
    expect(screen.getByLabelText('State ID Number')).toBeInTheDocument()
    
    await user.selectOptions(identificationSelect, 'military-id')
    expect(screen.getByLabelText('Military ID Number')).toBeInTheDocument()
  })

  it('disables SSN field when "no SSN" checkbox is checked', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    const noSSNCheckbox = screen.getByText('I don\'t have a Social Security Number')
    await user.click(noSSNCheckbox)
    
    const ssnInput = screen.getByLabelText('Social Security Number')
    expect(ssnInput).toBeInTheDocument()
    expect(ssnInput).toBeDisabled()
  })

  it('enables SSN field when "no SSN" checkbox is unchecked', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    // Check and then uncheck
    const noSSNCheckbox = screen.getByText('I don\'t have a Social Security Number')
    await user.click(noSSNCheckbox)
    await user.click(noSSNCheckbox)
    
    const ssnInput = screen.getByLabelText('Social Security Number')
    expect(ssnInput).toBeInTheDocument()
    expect(ssnInput).not.toBeDisabled()
  })

  it('clears SSN value when "no SSN" checkbox is checked', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    const ssnInput = screen.getByLabelText('Social Security Number')
    const noSSNCheckbox = screen.getByText('I don\'t have a Social Security Number')
    
    // Type SSN first
    await user.type(ssnInput, '123456789')
    expect(ssnInput).toHaveValue('123-45-6789')
    
    // Check "no SSN" - should clear the value
    await user.click(noSSNCheckbox)
    expect(ssnInput).toHaveValue('')
    expect(ssnInput).toBeDisabled()
  })

  it('formats SSN as user types', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    const ssnInput = screen.getByLabelText('Social Security Number')
    
    await user.type(ssnInput, '123456789')
    expect(ssnInput).toHaveValue('123-45-6789')
  })

  it('validates required fields on submit', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('Identification number is required')).toBeInTheDocument()
    })
    
    expect(mockOnNext).not.toHaveBeenCalled()
  })

  it('validates state is required for driver\'s license', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    await waitForConfigLoad()
    
    // Select driver's license
    const identificationSelect = screen.getByLabelText('Identification Type')
    await user.selectOptions(identificationSelect, 'drivers-license')
    
    // Fill identification number and SSN
    await user.type(screen.getByLabelText('Driver\'s License Number'), 'D1234567')
    await user.type(screen.getByLabelText('Social Security Number'), '123-45-6789')
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('State is required for this identification type')).toBeInTheDocument()
    })
    
    expect(mockOnNext).not.toHaveBeenCalled()
  })

  it('validates state is required for state ID', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    await waitForConfigLoad()
    
    // Select state ID
    const identificationSelect = screen.getByLabelText('Identification Type')
    await user.selectOptions(identificationSelect, 'state-id')
    
    // Fill identification number and SSN
    await user.type(screen.getByLabelText('State ID Number'), 'S1234567')
    await user.type(screen.getByLabelText('Social Security Number'), '123-45-6789')
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('State is required for this identification type')).toBeInTheDocument()
    })
    
    expect(mockOnNext).not.toHaveBeenCalled()
  })

  it('validates SSN is required when "no SSN" is not checked', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    // Fill identification number and date of birth
    await user.type(screen.getByLabelText('Passport Number'), 'A12345678')
    await user.type(screen.getByLabelText('Date of Birth'), '1990-01-01')
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('Social Security Number is required')).toBeInTheDocument()
    })
    
    expect(mockOnNext).not.toHaveBeenCalled()
  })

  it('submits form with valid passport data', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    // Fill out the form
    await user.type(screen.getByLabelText('Passport Number'), 'A12345678')
    await user.type(screen.getByLabelText('Date of Birth'), '1990-01-01')
    await user.type(screen.getByLabelText('Social Security Number'), '123-45-6789')
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith({
        identificationType: 'passport',
        identificationNumber: 'A12345678',
        dateOfBirth: '1990-01-01',
        socialSecurityNumber: '123-45-6789',
        noSSN: false,
      })
    })
  })

  it('submits form with valid state ID data', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    await waitForConfigLoad()
    
    // Select state ID
    const identificationSelect = screen.getByLabelText('Identification Type')
    await user.selectOptions(identificationSelect, 'state-id')
    
    // Fill out the form
    await user.type(screen.getByLabelText('State ID Number'), 'S1234567')
    await user.selectOptions(screen.getByLabelText('Issuing State'), 'NY')
    await user.type(screen.getByLabelText('Date of Birth'), '1990-01-01')
    await user.type(screen.getByLabelText('Social Security Number'), '123-45-6789')
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith({
        identificationType: 'state-id',
        identificationNumber: 'S1234567',
        state: 'NY',
        dateOfBirth: '1990-01-01',
        socialSecurityNumber: '123-45-6789',
        noSSN: false,
      })
    })
  })

  it('submits form with valid driver\'s license data', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    await waitForConfigLoad()
    
    // Select driver's license
    const identificationSelect = screen.getByLabelText('Identification Type')
    await user.selectOptions(identificationSelect, 'drivers-license')
    
    // Fill out the form
    await user.type(screen.getByLabelText('Driver\'s License Number'), 'D1234567')
    await user.selectOptions(screen.getByLabelText('Issuing State'), 'CA')
    await user.type(screen.getByLabelText('Date of Birth'), '1990-01-01')
    await user.type(screen.getByLabelText('Social Security Number'), '123-45-6789')
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith({
        identificationType: 'drivers-license',
        identificationNumber: 'D1234567',
        state: 'CA',
        dateOfBirth: '1990-01-01',
        socialSecurityNumber: '123-45-6789',
        noSSN: false,
      })
    })
  })

  it('submits form with empty SSN when "no SSN" is checked', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    // Fill identification number and date of birth
    await user.type(screen.getByLabelText('Passport Number'), 'A12345678')
    await user.type(screen.getByLabelText('Date of Birth'), '1990-01-01')
    
    // Check "no SSN"
    const noSSNCheckbox = screen.getByText('I don\'t have a Social Security Number')
    await user.click(noSSNCheckbox)
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith({
        identificationType: 'passport',
        identificationNumber: 'A12345678',
        dateOfBirth: '1990-01-01',
        socialSecurityNumber: '',
        noSSN: true,
      })
    })
  })

  it('validates SSN format', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    // Fill with invalid SSN
    await user.type(screen.getByLabelText('Passport Number'), 'A12345678')
    await user.type(screen.getByLabelText('Date of Birth'), '1990-01-01')
    await user.type(screen.getByLabelText('Social Security Number'), '123-45-678') // Too short
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid Social Security Number format')).toBeInTheDocument()
    })
    
    expect(mockOnNext).not.toHaveBeenCalled()
  })

  it('validates date of birth is required', async () => {
    const user = userEvent.setup()
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    // Fill identification number and SSN but not date of birth
    await user.type(screen.getByLabelText('Passport Number'), 'A12345678')
    await user.type(screen.getByLabelText('Social Security Number'), '123-45-6789')
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid date of birth')).toBeInTheDocument()
    })
    
    expect(mockOnNext).not.toHaveBeenCalled()
  })

  it('renders date of birth field', () => {
    renderWithProvider(<IdentificationInfo {...defaultProps} />)
    
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument()
    expect(screen.getByLabelText('Date of Birth')).toHaveAttribute('type', 'date')
  })
})