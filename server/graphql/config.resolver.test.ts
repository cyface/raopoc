import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ConfigResolver } from './config.resolver'

describe('ConfigResolver', () => {
  let resolver: ConfigResolver
  let mockConfigService: any

  const mockStates = [
    { code: 'NY', name: 'New York' },
    { code: 'CA', name: 'California' }
  ]

  const mockCountries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' }
  ]

  const mockIdentificationTypes = [
    { value: 'driversLicense', label: 'Driver\'s License', requiresState: true },
    { value: 'passport', label: 'Passport', requiresState: false }
  ]

  const mockProducts = [
    {
      type: 'checking',
      title: 'Checking Account',
      description: 'Basic checking account',
      icon: 'check-circle'
    },
    {
      type: 'savings',
      title: 'Savings Account',
      description: 'High-yield savings account',
      icon: 'piggy-bank'
    }
  ]

  const mockDocumentConfig = {
    showAcceptAllButton: true,
    documents: [
      {
        id: 'terms',
        name: 'Terms and Conditions',
        description: 'Account terms and conditions',
        url: '/documents/terms.pdf',
        required: true,
        category: 'legal'
      }
    ],
    rules: [
      {
        productTypes: ['checking'],
        hasSSN: true,
        documentIds: ['terms']
      }
    ]
  }

  const mockBankInfo = {
    bankName: 'Test Bank',
    displayName: 'Test Bank of America',
    contact: {
      phone: '1-800-TEST',
      phoneDisplay: '1-800-TEST (8378)',
      email: 'support@testbank.com',
      hours: 'Mon-Fri 9AM-5PM EST'
    },
    branding: {
      primaryColor: '#0066cc',
      logoIcon: 'bank-icon.svg'
    }
  }

  beforeEach(() => {
    mockConfigService = {
      getStates: vi.fn(),
      getCountries: vi.fn(),
      getIdentificationTypes: vi.fn(),
      getProducts: vi.fn(),
      getDocuments: vi.fn(),
      getBankInfo: vi.fn(),
      loadConfigWithFallback: vi.fn()
    }

    resolver = new ConfigResolver(mockConfigService)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('states query', () => {
    it('should return default states when no bank slug provided', async () => {
      // Arrange
      mockConfigService.getStates.mockReturnValue(mockStates)

      // Act
      const result = await resolver.states()

      // Assert
      expect(mockConfigService.getStates).toHaveBeenCalledWith()
      expect(result).toEqual(mockStates)
    })

    it('should return bank-specific states when bank slug provided', async () => {
      // Arrange
      const bankSpecificStates = [{ code: 'TX', name: 'Texas' }]
      mockConfigService.loadConfigWithFallback.mockResolvedValue(bankSpecificStates)

      // Act
      const result = await resolver.states('testbank')

      // Assert
      expect(mockConfigService.loadConfigWithFallback).toHaveBeenCalledWith('states', 'testbank')
      expect(result).toEqual(bankSpecificStates)
    })

    it('should return empty array when bank-specific config fails', async () => {
      // Arrange
      mockConfigService.loadConfigWithFallback.mockResolvedValue(null)

      // Act
      const result = await resolver.states('testbank')

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('countries query', () => {
    it('should return default countries when no bank slug provided', async () => {
      // Arrange
      mockConfigService.getCountries.mockReturnValue(mockCountries)

      // Act
      const result = await resolver.countries()

      // Assert
      expect(mockConfigService.getCountries).toHaveBeenCalledWith()
      expect(result).toEqual(mockCountries)
    })

    it('should return bank-specific countries when bank slug provided', async () => {
      // Arrange
      mockConfigService.loadConfigWithFallback.mockResolvedValue(mockCountries)

      // Act
      const result = await resolver.countries('testbank')

      // Assert
      expect(mockConfigService.loadConfigWithFallback).toHaveBeenCalledWith('countries', 'testbank')
      expect(result).toEqual(mockCountries)
    })
  })

  describe('identificationTypes query', () => {
    it('should return default identification types when no bank slug provided', async () => {
      // Arrange
      mockConfigService.getIdentificationTypes.mockReturnValue(mockIdentificationTypes)

      // Act
      const result = await resolver.identificationTypes()

      // Assert
      expect(mockConfigService.getIdentificationTypes).toHaveBeenCalledWith()
      expect(result).toEqual(mockIdentificationTypes)
    })

    it('should return bank-specific identification types when bank slug provided', async () => {
      // Arrange
      mockConfigService.loadConfigWithFallback.mockResolvedValue(mockIdentificationTypes)

      // Act
      const result = await resolver.identificationTypes('testbank')

      // Assert
      expect(mockConfigService.loadConfigWithFallback).toHaveBeenCalledWith('identification-types', 'testbank')
      expect(result).toEqual(mockIdentificationTypes)
    })
  })

  describe('products query', () => {
    it('should return default products when no bank slug provided', async () => {
      // Arrange
      mockConfigService.getProducts.mockReturnValue(mockProducts)

      // Act
      const result = await resolver.products()

      // Assert
      expect(mockConfigService.getProducts).toHaveBeenCalledWith()
      expect(result).toEqual(mockProducts)
    })

    it('should return bank-specific products when bank slug provided', async () => {
      // Arrange
      mockConfigService.loadConfigWithFallback.mockResolvedValue(mockProducts)

      // Act
      const result = await resolver.products('testbank')

      // Assert
      expect(mockConfigService.loadConfigWithFallback).toHaveBeenCalledWith('products', 'testbank')
      expect(result).toEqual(mockProducts)
    })
  })

  describe('documentConfig query', () => {
    it('should return default document config when no bank slug provided', async () => {
      // Arrange
      mockConfigService.getDocuments.mockReturnValue(mockDocumentConfig)

      // Act
      const result = await resolver.documentConfig()

      // Assert
      expect(mockConfigService.getDocuments).toHaveBeenCalledWith()
      expect(result).toEqual(mockDocumentConfig)
    })

    it('should return bank-specific document config when bank slug provided', async () => {
      // Arrange
      mockConfigService.loadConfigWithFallback.mockResolvedValue(mockDocumentConfig)

      // Act
      const result = await resolver.documentConfig('testbank')

      // Assert
      expect(mockConfigService.loadConfigWithFallback).toHaveBeenCalledWith('documents', 'testbank')
      expect(result).toEqual(mockDocumentConfig)
    })

    it('should return default structure when document config is null', async () => {
      // Arrange
      mockConfigService.getDocuments.mockReturnValue(null)

      // Act
      const result = await resolver.documentConfig()

      // Assert
      expect(result).toEqual({
        showAcceptAllButton: true,
        documents: [],
        rules: []
      })
    })
  })

  describe('bankInfo query', () => {
    it('should return default bank info when no bank slug provided', async () => {
      // Arrange
      mockConfigService.getBankInfo.mockReturnValue(mockBankInfo)

      // Act
      const result = await resolver.bankInfo()

      // Assert
      expect(mockConfigService.getBankInfo).toHaveBeenCalledWith()
      expect(result).toEqual(mockBankInfo)
    })

    it('should return bank-specific bank info when bank slug provided', async () => {
      // Arrange
      mockConfigService.loadConfigWithFallback.mockResolvedValue(mockBankInfo)

      // Act
      const result = await resolver.bankInfo('testbank')

      // Assert
      expect(mockConfigService.loadConfigWithFallback).toHaveBeenCalledWith('bank-info', 'testbank')
      expect(result).toEqual(mockBankInfo)
    })

    it('should return null when bank info is not found', async () => {
      // Arrange
      mockConfigService.getBankInfo.mockReturnValue(null)

      // Act
      const result = await resolver.bankInfo()

      // Assert
      expect(result).toBeNull()
    })
  })
})