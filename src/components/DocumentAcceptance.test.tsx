import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { DocumentAcceptance } from './DocumentAcceptance'
import { ThemeProvider } from '../context/ThemeContext'
import { OnboardingProvider } from '../context/OnboardingContext'
import { configService } from '../services/configService'

// Mock the configService
vi.mock('../services/configService', () => ({
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
    getCountries: vi.fn(),
    getIdentificationTypes: vi.fn(),
    getDocuments: vi.fn(),
    getBankInfo: vi.fn(),
    getIdentificationTypesThatRequireState: vi.fn(),
    clearCache: vi.fn(),
  },
}))

const mockConfigService = vi.mocked(configService)

// Mock fetch for document viewing/downloading
global.fetch = vi.fn()
const mockFetch = vi.mocked(fetch)

// Mock URL.createObjectURL and window.open
global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
global.URL.revokeObjectURL = vi.fn()
const mockWindowOpen = vi.fn()
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
})

// Mock the navigation to prevent jsdom errors
mockWindowOpen.mockImplementation(() => {
  return {
    location: { href: '' },
    focus: vi.fn(),
    close: vi.fn()
  }
})

describe('DocumentAcceptance', () => {
  const mockOnAcceptanceChange = vi.fn()
  const mockOnNext = vi.fn()

  // Helper function to render component wrapped in act
  const renderDocumentAcceptance = async (props: {
    selectedProducts: string[]
    hasNoSSN: boolean
    onAcceptanceChange: typeof mockOnAcceptanceChange
    onNext?: typeof mockOnNext
  }) => {
    await act(async () => {
      render(
        <ThemeProvider>
          <OnboardingProvider>
            <DocumentAcceptance {...props} />
          </OnboardingProvider>
        </ThemeProvider>
      )
    })
  }

  const mockDocumentConfig = {
    showAcceptAllButton: true,
    documents: [
      {
        id: 'terms-of-service',
        name: 'Terms of Service',
        description: 'Legal terms and conditions',
        url: '/documents/terms.pdf',
        required: true,
        category: 'terms' as const,
      },
      {
        id: 'checking-agreement',
        name: 'Checking Account Agreement',
        description: 'Terms for checking accounts',
        url: '/documents/checking.pdf',
        required: true,
        category: 'agreement' as const,
      },
      {
        id: 'itin-disclosure',
        name: 'ITIN Disclosure',
        description: 'Information for customers without SSN',
        url: '/documents/itin.pdf',
        required: true,
        category: 'disclosure' as const,
      },
    ],
    rules: [
      {
        documentIds: ['terms-of-service'],
      },
      {
        productTypes: ['checking'],
        documentIds: ['checking-agreement'],
      },
      {
        noSSN: true,
        documentIds: ['itin-disclosure'],
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockConfigService.getDocuments.mockResolvedValue(mockDocumentConfig)
    mockConfigService.getBankInfo.mockResolvedValue({
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
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['mock pdf content'])),
    } as Response)
  })

  it('renders loading state initially', async () => {
    // Delay the mock resolution to see loading state
    let resolveMock: (value: typeof mockDocumentConfig) => void
    const mockPromise = new Promise<typeof mockDocumentConfig>((resolve) => {
      resolveMock = resolve
    })
    mockConfigService.getDocuments.mockReturnValue(mockPromise)

    await renderDocumentAcceptance({
      selectedProducts: ['checking'],
      hasNoSSN: false,
      onAcceptanceChange: mockOnAcceptanceChange,
    })

    expect(screen.getByText('Loading document requirements...')).toBeInTheDocument()
    
    // Resolve the promise to continue
    await act(async () => {
      resolveMock!(mockDocumentConfig)
    })
  })

  it('renders documents based on selected products', async () => {
    await renderDocumentAcceptance({
      selectedProducts: ['checking'],
      hasNoSSN: false,
      onAcceptanceChange: mockOnAcceptanceChange,
    })

    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
      expect(screen.getByText('Checking Account Agreement')).toBeInTheDocument()
      expect(screen.queryByText('ITIN Disclosure')).not.toBeInTheDocument()
    })
  })

  it('renders ITIN disclosure when hasNoSSN is true', async () => {
    await renderDocumentAcceptance({
      selectedProducts: ['checking'],
      hasNoSSN: true,
      onAcceptanceChange: mockOnAcceptanceChange,
    })

    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
      expect(screen.getByText('Checking Account Agreement')).toBeInTheDocument()
      expect(screen.getByText('ITIN Disclosure')).toBeInTheDocument()
    })
  })

  it('calls onAcceptanceChange when document is accepted', async () => {
    await renderDocumentAcceptance({
      selectedProducts: ['checking'],
      hasNoSSN: false,
      onAcceptanceChange: mockOnAcceptanceChange,
    })

    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })

    const checkbox = screen.getByLabelText(/I have read and accept the Terms of Service/)
    fireEvent.click(checkbox)

    expect(mockOnAcceptanceChange).toHaveBeenCalledWith({
      acceptances: expect.objectContaining({
        'terms-of-service': {
          documentId: 'terms-of-service',
          accepted: true,
          acceptedAt: expect.any(String),
        },
      }),
      allAccepted: false, // Because checking agreement is not accepted
    })
  })

  it('shows accept all button by default', async () => {
    await renderDocumentAcceptance({
      selectedProducts: ['checking'],
      hasNoSSN: false,
      onAcceptanceChange: mockOnAcceptanceChange,
    })

    await waitFor(() => {
      expect(screen.getByText('Accept All Documents')).toBeInTheDocument()
    })
  })

  it('hides accept all button when showAcceptAllButton is false', async () => {
    // Override the mock to return false for showAcceptAllButton
    const configWithoutAcceptAll = {
      ...mockDocumentConfig,
      showAcceptAllButton: false,
    }
    mockConfigService.getDocuments.mockResolvedValue(configWithoutAcceptAll)

    await renderDocumentAcceptance({
      selectedProducts: ['checking'],
      hasNoSSN: false,
      onAcceptanceChange: mockOnAcceptanceChange,
    })

    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })
    
    expect(screen.queryByText('Accept All Documents')).not.toBeInTheDocument()
  })

  it('accepts all documents when accept all button is clicked', async () => {
    await renderDocumentAcceptance({
      selectedProducts: ['checking'],
      hasNoSSN: false,
      onAcceptanceChange: mockOnAcceptanceChange,
    })

    await waitFor(() => {
      expect(screen.getByText('Accept All Documents')).toBeInTheDocument()
    })

    const acceptAllButton = screen.getByText('Accept All Documents')
    fireEvent.click(acceptAllButton)

    expect(mockOnAcceptanceChange).toHaveBeenCalledWith({
      acceptances: expect.objectContaining({
        'terms-of-service': {
          documentId: 'terms-of-service',
          accepted: true,
          acceptedAt: expect.any(String),
        },
        'checking-agreement': {
          documentId: 'checking-agreement',
          accepted: true,
          acceptedAt: expect.any(String),
        },
      }),
      allAccepted: true,
    })
  })

  it('opens document in modal when view button is clicked', async () => {
    await renderDocumentAcceptance({
      selectedProducts: ['checking'],
      hasNoSSN: false,
      onAcceptanceChange: mockOnAcceptanceChange,
    })

    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })

    const viewButtons = screen.getAllByText('View')
    fireEvent.click(viewButtons[0])

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/documents/terms-of-service')
      )
      // Check that modal with iframe is opened
      expect(screen.getByTitle('Terms of Service')).toBeInTheDocument()
    })
  })

  it('downloads document when download button is clicked', async () => {
    await renderDocumentAcceptance({
      selectedProducts: ['checking'],
      hasNoSSN: false,
      onAcceptanceChange: mockOnAcceptanceChange,
    })

    await waitFor(() => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })

    const downloadButtons = screen.getAllByText('Download')
    fireEvent.click(downloadButtons[0])

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/documents/terms-of-service/download')
      )
    })
  })

  it('shows continue button when onNext is provided', async () => {
    await renderDocumentAcceptance({
      selectedProducts: ['checking'],
      hasNoSSN: false,
      onAcceptanceChange: mockOnAcceptanceChange,
      onNext: mockOnNext,
    })

    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument()
    })
  })

  it('disables continue button when not all documents are accepted', async () => {
    await renderDocumentAcceptance({
      selectedProducts: ['checking'],
      hasNoSSN: false,
      onAcceptanceChange: mockOnAcceptanceChange,
      onNext: mockOnNext,
    })

    await waitFor(() => {
      const continueButton = screen.getByText('Continue')
      expect(continueButton).toBeDisabled()
    })
  })

  it('enables continue button when all documents are accepted', async () => {
    await renderDocumentAcceptance({
      selectedProducts: ['checking'],
      hasNoSSN: false,
      onAcceptanceChange: mockOnAcceptanceChange,
      onNext: mockOnNext,
    })

    await waitFor(() => {
      expect(screen.getByText('Accept All Documents')).toBeInTheDocument()
    })

    const acceptAllButton = screen.getByText('Accept All Documents')
    fireEvent.click(acceptAllButton)

    await waitFor(() => {
      const continueButton = screen.getByText('Continue')
      expect(continueButton).not.toBeDisabled()
    })
  })

  it('calls onNext when continue button is clicked and all documents accepted', async () => {
    await renderDocumentAcceptance({
      selectedProducts: ['checking'],
      hasNoSSN: false,
      onAcceptanceChange: mockOnAcceptanceChange,
      onNext: mockOnNext,
    })

    await waitFor(() => {
      expect(screen.getByText('Accept All Documents')).toBeInTheDocument()
    })

    const acceptAllButton = screen.getByText('Accept All Documents')
    fireEvent.click(acceptAllButton)

    await waitFor(() => {
      const continueButton = screen.getByText('Continue')
      expect(continueButton).not.toBeDisabled()
    })

    const continueButton = screen.getByText('Continue')
    fireEvent.click(continueButton)

    expect(mockOnNext).toHaveBeenCalled()
  })

  it('shows no documents message when no documents are required', async () => {
    mockConfigService.getDocuments.mockResolvedValue({
      showAcceptAllButton: true,
      documents: [],
      rules: [],
    })

    await renderDocumentAcceptance({
      selectedProducts: [],
      hasNoSSN: false,
      onAcceptanceChange: mockOnAcceptanceChange,
    })

    await waitFor(() => {
      expect(screen.getByText('No additional documents are required for your selected products.')).toBeInTheDocument()
    })
  })

  it('handles API error gracefully', async () => {
    mockConfigService.getDocuments.mockRejectedValue(new Error('API Error'))

    await renderDocumentAcceptance({
      selectedProducts: ['checking'],
      hasNoSSN: false,
      onAcceptanceChange: mockOnAcceptanceChange,
    })

    await waitFor(() => {
      expect(screen.getByText('Failed to load document requirements')).toBeInTheDocument()
    })
  })
})