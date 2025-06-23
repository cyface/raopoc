import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ConfirmationScreen } from './ConfirmationScreen'
import { configService } from '../services/configService'

// Mock the services and utilities
vi.mock('../services/configService', () => ({
  configService: {
    getBankInfo: vi.fn()
  }
}))

vi.mock('../utils/apiUrl', () => ({
  getApiUrl: vi.fn(() => 'http://localhost:3000/api')
}))

vi.mock('../context/OnboardingContext', () => ({
  useOnboarding: () => ({
    data: {
      selectedProducts: ['checking', 'savings'],
      customerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '555-123-4567',
        mailingAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        useSameAddress: true
      },
      identificationInfo: {
        identificationType: 'driversLicense',
        identificationNumber: 'DL123456',
        state: 'CA',
        socialSecurityNumber: '123-45-6789',
        noSSN: false,
        dateOfBirth: '1990-01-01'
      },
      documentAcceptance: {
        acceptances: {
          'terms-of-service': { documentId: 'terms-of-service', accepted: true },
          'privacy-policy': { documentId: 'privacy-policy', accepted: true }
        },
        allAccepted: true
      }
    },
    creditCheckResult: null
  })
}))

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    styles: {
      container: 'theme_container__test',
      header: 'theme_header__test',
      bankIcon: 'theme_bankIcon__test',
      bankName: 'theme_bankName__test',
      heading: 'theme_heading__test',
      subheading: 'theme_subheading__test',
      primaryButton: 'theme_primaryButton__test',
      vars: {
        color: {
          border: '#e5e7eb',
          primary: '#3b82f6',
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b',
          surface: '#f9fafb',
          white: '#ffffff',
          textPrimary: '#111827',
          textSecondary: '#6b7280',
          icon: '#6b7280'
        }
      }
    }
  })
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (params) {
        return `${key}_${JSON.stringify(params)}`
      }
      return key
    }
  }),
  Trans: ({ i18nKey, values }: any) => {
    return `${i18nKey}_${JSON.stringify(values || {})}`
  }
}))

describe('ConfirmationScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock bank info service
    vi.mocked(configService.getBankInfo).mockResolvedValue({
      bankName: 'Test Bank',
      displayName: 'Test Bank',
      contact: {
        phone: '1-800-TEST-BANK',
        phoneDisplay: '1-800-TEST-BANK',
        email: 'support@testbank.com',
        hours: 'Monday - Friday 9:00 AM - 5:00 PM EST'
      },
      branding: {
        primaryColor: '#3b82f6',
        logoIcon: 'test-logo.svg'
      }
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should automatically submit lead data to PostgreSQL on mount', async () => {
    // Mock successful API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'lead-123' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'SUBMITTED' })
      })

    render(<ConfirmationScreen />)

    // Wait for the submission to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    // Verify the lead creation call
    expect(mockFetch).toHaveBeenNthCalledWith(1, 'http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"currentStep":5')
    })

    // Verify the lead submission call
    expect(mockFetch).toHaveBeenNthCalledWith(2, 'http://localhost:3000/api/leads/lead-123/submit', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  it('should display success message after successful PostgreSQL submission', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'lead-456' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'SUBMITTED' })
      })

    render(<ConfirmationScreen />)

    // Wait for submission to complete and success message to appear
    await waitFor(() => {
      expect(screen.getByText('confirmationScreen.success.title')).toBeInTheDocument()
    })

    // Verify the application ID is displayed
    expect(screen.getByText('lead-456')).toBeInTheDocument()
  })

  it('should display loading state during submission', async () => {
    // Make the first API call hang to test loading state
    mockFetch.mockImplementationOnce(() => new Promise(() => {}))

    render(<ConfirmationScreen />)

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('confirmationScreen.submitting.title')).toBeInTheDocument()
      expect(screen.getByText('confirmationScreen.submitting.message')).toBeInTheDocument()
    })
  })

  it('should handle lead creation failure gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(<ConfirmationScreen />)

    // Wait for error state to appear
    await waitFor(() => {
      expect(screen.getByText('confirmationScreen.error.title')).toBeInTheDocument()
      expect(screen.getByText('confirmationScreen.errors.submitFailed')).toBeInTheDocument()
    })

    // Should show retry button
    expect(screen.getByText('confirmationScreen.error.tryAgain')).toBeInTheDocument()
  })

  it('should handle lead submission failure gracefully', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'lead-789' })
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400
      })

    render(<ConfirmationScreen />)

    // Wait for error state to appear
    await waitFor(() => {
      expect(screen.getByText('confirmationScreen.error.title')).toBeInTheDocument()
    })
  })

  it('should not submit if applicationId is already provided', async () => {
    render(<ConfirmationScreen applicationId="existing-lead-123" />)

    // Wait a bit to ensure no API calls are made
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockFetch).not.toHaveBeenCalled()

    // Should display the existing application ID
    expect(screen.getByText('existing-lead-123')).toBeInTheDocument()
  })
})