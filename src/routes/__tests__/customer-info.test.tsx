import { screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { CustomerInfoRoute, customerInfoLoader, customerInfoAction } from '../customer-info'
import { renderWithRouter, createMockLoader } from '../../test-utils/router-test-utils'
import { configService } from '../../services/configService'

// Mock the config service
vi.mock('../../services/configService', () => ({
  configService: {
    getStatesFor: vi.fn(),
    getBankInfo: vi.fn(),
  }
}))

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'customerInfo.title': 'Personal Information',
        'customerInfo.personalInfo': 'Personal Information',
        'customerInfo.firstName': 'First Name',
        'customerInfo.lastName': 'Last Name',
        'customerInfo.email': 'Email',
        'customerInfo.phoneNumber': 'Phone Number',
        'customerInfo.mailingAddress': 'Mailing Address',
        'customerInfo.billingAddress': 'Billing Address',
        'customerInfo.sameAsMailingAddress': 'Same as mailing address',
        'customerInfo.streetAddress': 'Street Address',
        'customerInfo.city': 'City',
        'customerInfo.state': 'State',
        'customerInfo.zipCode': 'ZIP Code',
        'customerInfo.selectState': 'Select State',
        'common.next': 'Next',
        'common.back': 'Back',
        'common.loading': 'Loading...',
      }
      return translations[key] || key
    },
  }),
}))

const mockStates = [
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'TX', name: 'Texas' }
]

describe('CustomerInfo Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(configService.getStatesFor).mockResolvedValue(mockStates)
    vi.mocked(configService.getBankInfo).mockResolvedValue({
      bankName: 'Test Bank',
      displayName: 'Test Bank',
      contact: { phone: '1-800-TEST', phoneDisplay: '1-800-TEST', email: 'test@bank.com', hours: '9 AM - 5 PM' },
      branding: { primaryColor: '#0066cc', logoIcon: '🏦' }
    })
    sessionStorage.clear()
  })

  describe('Loader', () => {
    it('should redirect if no products selected', async () => {
      const request = new Request('http://localhost/customer-info')
      
      const result = await customerInfoLoader({ request, params: {}, context: {} }) as Response
      
      expect(result.status).toBe(302)
      expect(result.headers.get('Location')).toBe('/')
    })

    it('should load states when products are selected', async () => {
      sessionStorage.setItem('onboarding:selectedProducts', '["checking"]')
      
      const request = new Request('http://localhost/customer-info?fi=testbank&lng=en')
      
      const result = await customerInfoLoader({ request, params: {}, context: {} })
      
      expect(configService.getStatesFor).toHaveBeenCalledWith('testbank', 'en')
      expect(result).toEqual({
        selectedProducts: ['checking'],
        states: mockStates
      })
    })
  })

  describe('Action', () => {
    it('should validate required fields', async () => {
      const formData = new FormData()
      // Missing required fields
      
      const request = new Request('http://localhost/customer-info', {
        method: 'POST',
        body: formData
      })
      
      const result = await customerInfoAction({ request, params: {}, context: {} }) as Response
      
      expect(result.status).toBe(400)
    })

    it('should save valid customer info and redirect', async () => {
      const formData = new FormData()
      formData.append('firstName', 'John')
      formData.append('lastName', 'Doe')
      formData.append('email', 'john@example.com')
      formData.append('phoneNumber', '1234567890')
      formData.append('mailingAddress.street', '123 Main St')
      formData.append('mailingAddress.city', 'Anytown')
      formData.append('mailingAddress.state', 'CA')
      formData.append('mailingAddress.zipCode', '12345')
      formData.append('useSameAddress', 'true')
      
      const request = new Request('http://localhost/customer-info', {
        method: 'POST',
        body: formData
      })
      
      const result = await customerInfoAction({ request, params: {}, context: {} }) as Response
      
      expect(result.status).toBe(302)
      expect(result.headers.get('Location')).toBe('/identification')
      
      // Check session storage
      const stored = sessionStorage.getItem('onboarding:customerInfo')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.firstName).toBe('John')
      expect(parsed.email).toBe('john@example.com')
    })

    it('should validate email format', async () => {
      const formData = new FormData()
      formData.append('firstName', 'John')
      formData.append('lastName', 'Doe')
      formData.append('email', 'invalid-email')
      formData.append('phoneNumber', '1234567890')
      formData.append('mailingAddress.street', '123 Main St')
      formData.append('mailingAddress.city', 'Anytown')
      formData.append('mailingAddress.state', 'CA')
      formData.append('mailingAddress.zipCode', '12345')
      formData.append('useSameAddress', 'true')
      
      const request = new Request('http://localhost/customer-info', {
        method: 'POST',
        body: formData
      })
      
      const result = await customerInfoAction({ request, params: {}, context: {} }) as Response
      
      expect(result.status).toBe(400)
    })
  })

  describe('Component', () => {
    it('should render form fields', async () => {
      const loader = createMockLoader({
        selectedProducts: ['checking'],
        states: mockStates
      })
      
      renderWithRouter(<CustomerInfoRoute />, {
        loader,
        initialEntries: ['/customer-info']
      })
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Personal Information' })).toBeInTheDocument()
      })
      
      expect(screen.getByLabelText(/First Name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Phone Number/)).toBeInTheDocument()
    })

    it('should show billing address fields when checkbox is unchecked', async () => {
      const loader = createMockLoader({
        selectedProducts: ['checking'],
        states: mockStates
      })
      
      renderWithRouter(<CustomerInfoRoute />, {
        loader,
        initialEntries: ['/customer-info']
      })
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Personal Information' })).toBeInTheDocument()
      })
      
      const checkbox = screen.getByLabelText(/Same as mailing address/)
      fireEvent.click(checkbox)
      
      // Should show billing address fields
      await waitFor(() => {
        const billingFields = screen.getAllByText(/Street Address/)
        expect(billingFields.length).toBeGreaterThan(1)
      })
    })

    it('should populate state dropdown', async () => {
      const loader = createMockLoader({
        selectedProducts: ['checking'],
        states: mockStates
      })
      
      renderWithRouter(<CustomerInfoRoute />, {
        loader,
        initialEntries: ['/customer-info']
      })
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Personal Information' })).toBeInTheDocument()
      })
      
      const stateSelects = screen.getAllByDisplayValue('Select State')
      expect(stateSelects.length).toBeGreaterThan(0)
    })
  })
})