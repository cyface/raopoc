import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { LeadResolver } from './lead.resolver'
import { LeadStatus, ProductType, CreditStatus } from '@prisma/client'

describe('LeadResolver', () => {
  let resolver: LeadResolver
  let mockApplicationService: any
  let mockConfigService: any

  const mockLead = {
    id: 'lead-123',
    status: LeadStatus.IN_PROGRESS,
    currentStep: 2,
    completedSteps: [1],
    selectedProducts: [ProductType.CHECKING, ProductType.SAVINGS],
    customerInfoHistory: [{
      version: 1,
      timestamp: '2023-01-01T00:00:00Z',
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '555-123-4567'
      }
    }],
    identificationInfoHistory: [{
      version: 1,
      timestamp: '2023-01-01T00:00:00Z',
      data: {
        identificationType: 'driversLicense',
        identificationNumber: 'DL123456',
        socialSecurityNumber: '123-45-6789',
        noSSN: false,
        dateOfBirth: '1990-01-01'
      }
    }],
    financialInstitution: 'testbank',
    language: 'en',
    theme: 'light',
    creditCheckStatus: CreditStatus.APPROVED,
    requiresVerification: false,
    creditCheckMessage: 'Approved',
    creditCheckAt: new Date('2023-01-01'),
    documentAcceptances: [],
    allDocumentsAccepted: false,
    sessionId: 'session-123',
    userAgent: 'test-agent',
    devStep: null,
    mockScenario: null,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    submittedAt: null,
    lastActivity: new Date('2023-01-01')
  }

  beforeEach(() => {
    mockApplicationService = {
      getLeadById: vi.fn(),
      getLeadBySessionId: vi.fn(),
      getAllLeads: vi.fn(),
      createOrUpdateLead: vi.fn(),
      updateLead: vi.fn(),
      updateLeadStep: vi.fn(),
      updateLeadCreditCheck: vi.fn(),
      updateLeadDocumentAcceptances: vi.fn(),
      submitLead: vi.fn(),
      performCreditCheck: vi.fn(),
      getLatestCustomerInfo: vi.fn(),
      getLatestIdentificationInfo: vi.fn()
    }

    mockConfigService = {
      getProducts: vi.fn(),
      loadConfigWithFallback: vi.fn()
    }

    resolver = new LeadResolver(mockApplicationService, mockConfigService)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('lead query', () => {
    it('should return a lead by ID', async () => {
      // Arrange
      mockApplicationService.getLeadById.mockResolvedValue(mockLead)
      mockApplicationService.getLatestCustomerInfo.mockReturnValue({
        data: mockLead.customerInfoHistory[0].data
      })
      mockApplicationService.getLatestIdentificationInfo.mockReturnValue({
        data: mockLead.identificationInfoHistory[0].data
      })

      // Act
      const result = await resolver.lead('lead-123')

      // Assert
      expect(mockApplicationService.getLeadById).toHaveBeenCalledWith('lead-123')
      expect(result).toBeDefined()
      expect(result!.id).toBe('lead-123')
      expect(result!.customerInfo).toEqual(mockLead.customerInfoHistory[0].data)
      expect(result!.identificationInfo).toEqual(mockLead.identificationInfoHistory[0].data)
    })

    it('should return null if lead not found', async () => {
      // Arrange
      mockApplicationService.getLeadById.mockResolvedValue(null)

      // Act
      const result = await resolver.lead('nonexistent-id')

      // Assert
      expect(mockApplicationService.getLeadById).toHaveBeenCalledWith('nonexistent-id')
      expect(result).toBeNull()
    })
  })

  describe('leadBySessionId query', () => {
    it('should return a lead by session ID', async () => {
      // Arrange
      mockApplicationService.getLeadBySessionId.mockResolvedValue(mockLead)
      mockApplicationService.getLatestCustomerInfo.mockReturnValue({
        data: mockLead.customerInfoHistory[0].data
      })
      mockApplicationService.getLatestIdentificationInfo.mockReturnValue({
        data: mockLead.identificationInfoHistory[0].data
      })

      // Act
      const result = await resolver.leadBySessionId('session-123')

      // Assert
      expect(mockApplicationService.getLeadBySessionId).toHaveBeenCalledWith('session-123')
      expect(result).toBeDefined()
      expect(result!.sessionId).toBe('session-123')
    })
  })

  describe('leads query', () => {
    it('should return filtered leads', async () => {
      // Arrange
      const mockLeads = [mockLead]
      mockApplicationService.getAllLeads.mockResolvedValue(mockLeads)
      mockApplicationService.getLatestCustomerInfo.mockReturnValue({
        data: mockLead.customerInfoHistory[0].data
      })
      mockApplicationService.getLatestIdentificationInfo.mockReturnValue({
        data: mockLead.identificationInfoHistory[0].data
      })

      const filter = {
        status: LeadStatus.IN_PROGRESS,
        financialInstitution: 'testbank',
        limit: 10,
        offset: 0
      }

      // Act
      const result = await resolver.leads(filter)

      // Assert
      expect(mockApplicationService.getAllLeads).toHaveBeenCalledWith({
        status: LeadStatus.IN_PROGRESS,
        financialInstitution: 'testbank',
        limit: 10,
        offset: 0
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('lead-123')
    })
  })

  describe('createOrUpdateLead mutation', () => {
    it('should create a new lead', async () => {
      // Arrange
      const input = {
        sessionId: 'new-session',
        selectedProducts: ['checking'],
        customerInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phoneNumber: '555-987-6543',
          mailingAddress: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'NY',
            zipCode: '12345'
          },
          useSameAddress: true
        },
        currentStep: 1,
        financialInstitution: 'testbank',
        language: 'en'
      }

      mockApplicationService.createOrUpdateLead.mockResolvedValue(mockLead)
      mockApplicationService.getLatestCustomerInfo.mockReturnValue({
        data: mockLead.customerInfoHistory[0].data
      })
      mockApplicationService.getLatestIdentificationInfo.mockReturnValue({
        data: mockLead.identificationInfoHistory[0].data
      })

      // Act
      const result = await resolver.createOrUpdateLead(input)

      // Assert
      expect(mockApplicationService.createOrUpdateLead).toHaveBeenCalledWith({
        sessionId: 'new-session',
        selectedProducts: ['checking'],
        customerInfo: input.customerInfo,
        identificationInfo: undefined,
        currentStep: 1,
        completedSteps: undefined,
        financialInstitution: 'testbank',
        language: 'en',
        theme: undefined,
        devStep: undefined,
        mockScenario: undefined,
        userAgent: undefined,
        ipAddress: undefined
      })
      expect(result.id).toBe('lead-123')
    })
  })

  describe('updateLeadStep mutation', () => {
    it('should update lead step progress', async () => {
      // Arrange
      const input = {
        leadId: 'lead-123',
        currentStep: 3,
        completedSteps: [1, 2],
        stepData: JSON.stringify({ someData: 'value' })
      }

      mockApplicationService.updateLeadStep.mockResolvedValue(mockLead)
      mockApplicationService.getLatestCustomerInfo.mockReturnValue({
        data: mockLead.customerInfoHistory[0].data
      })
      mockApplicationService.getLatestIdentificationInfo.mockReturnValue({
        data: mockLead.identificationInfoHistory[0].data
      })

      // Act
      const result = await resolver.updateLeadStep(input)

      // Assert
      expect(mockApplicationService.updateLeadStep).toHaveBeenCalledWith('lead-123', {
        currentStep: 3,
        completedSteps: [1, 2],
        stepData: { someData: 'value' }
      })
      expect(result.id).toBe('lead-123')
    })

    it('should handle step data without stepData field', async () => {
      // Arrange
      const input = {
        leadId: 'lead-123',
        currentStep: 2,
        completedSteps: [1]
      }

      mockApplicationService.updateLeadStep.mockResolvedValue(mockLead)
      mockApplicationService.getLatestCustomerInfo.mockReturnValue({
        data: mockLead.customerInfoHistory[0].data
      })
      mockApplicationService.getLatestIdentificationInfo.mockReturnValue({
        data: mockLead.identificationInfoHistory[0].data
      })

      // Act
      const result = await resolver.updateLeadStep(input)

      // Assert
      expect(mockApplicationService.updateLeadStep).toHaveBeenCalledWith('lead-123', {
        currentStep: 2,
        completedSteps: [1],
        stepData: undefined
      })
      expect(result.id).toBe('lead-123')
    })
  })

  describe('updateLeadCreditCheck mutation', () => {
    it('should update credit check results', async () => {
      // Arrange
      const input = {
        leadId: 'lead-123',
        status: 'approved',
        requiresVerification: false,
        message: 'Credit check passed'
      }

      mockApplicationService.updateLeadCreditCheck.mockResolvedValue(mockLead)
      mockApplicationService.getLatestCustomerInfo.mockReturnValue({
        data: mockLead.customerInfoHistory[0].data
      })
      mockApplicationService.getLatestIdentificationInfo.mockReturnValue({
        data: mockLead.identificationInfoHistory[0].data
      })

      // Act
      const result = await resolver.updateLeadCreditCheck(input)

      // Assert
      expect(mockApplicationService.updateLeadCreditCheck).toHaveBeenCalledWith('lead-123', {
        status: 'approved',
        requiresVerification: false,
        message: 'Credit check passed'
      })
      expect(result.id).toBe('lead-123')
    })
  })

  describe('updateLeadDocuments mutation', () => {
    it('should update document acceptances', async () => {
      // Arrange
      const input = {
        leadId: 'lead-123',
        acceptances: [
          { documentId: 'doc-1', accepted: true },
          { documentId: 'doc-2', accepted: false }
        ]
      }

      mockApplicationService.updateLeadDocumentAcceptances.mockResolvedValue([])

      // Act
      const result = await resolver.updateLeadDocuments(input)

      // Assert
      expect(mockApplicationService.updateLeadDocumentAcceptances).toHaveBeenCalledWith('lead-123', [
        { documentId: 'doc-1', accepted: true },
        { documentId: 'doc-2', accepted: false }
      ])
      expect(result).toEqual(['doc-1', 'doc-2'])
    })
  })

  describe('submitLead mutation', () => {
    it('should submit a lead', async () => {
      // Arrange
      const submittedLead = { ...mockLead, status: LeadStatus.SUBMITTED }
      mockApplicationService.submitLead.mockResolvedValue(submittedLead)
      mockApplicationService.getLatestCustomerInfo.mockReturnValue({
        data: mockLead.customerInfoHistory[0].data
      })
      mockApplicationService.getLatestIdentificationInfo.mockReturnValue({
        data: mockLead.identificationInfoHistory[0].data
      })

      // Act
      const result = await resolver.submitLead('lead-123')

      // Assert
      expect(mockApplicationService.submitLead).toHaveBeenCalledWith('lead-123')
      expect(result.status).toBe(LeadStatus.SUBMITTED)
    })
  })

  describe('performCreditCheck mutation', () => {
    it('should perform credit check', async () => {
      // Arrange
      const input = { ssn: '123-45-6789' }
      const creditResult = {
        status: 'approved',
        requiresVerification: false,
        message: 'Credit check passed'
      }

      mockApplicationService.performCreditCheck.mockResolvedValue(creditResult)

      // Act
      const result = await resolver.performCreditCheck(input)

      // Assert
      expect(mockApplicationService.performCreditCheck).toHaveBeenCalledWith('123-45-6789')
      expect(result).toEqual(creditResult)
    })
  })

  describe('transformLead', () => {
    it('should transform lead with latest versioned data', async () => {
      // Arrange
      const leadWithHistory = {
        ...mockLead,
        customerInfoHistory: [
          {
            version: 1,
            timestamp: '2023-01-01T00:00:00Z',
            data: { firstName: 'John', lastName: 'Doe' }
          },
          {
            version: 2,
            timestamp: '2023-01-02T00:00:00Z',
            data: { firstName: 'Johnny', lastName: 'Doe' }
          }
        ]
      }

      mockApplicationService.getLeadById.mockResolvedValue(leadWithHistory)
      mockApplicationService.getLatestCustomerInfo.mockReturnValue({
        data: { firstName: 'Johnny', lastName: 'Doe' }
      })
      mockApplicationService.getLatestIdentificationInfo.mockReturnValue({
        data: mockLead.identificationInfoHistory[0].data
      })

      // Act
      const result = await resolver.lead('lead-123')

      // Assert
      expect(result!.customerInfo).toEqual({ firstName: 'Johnny', lastName: 'Doe' })
    })

    it('should handle empty version histories', async () => {
      // Arrange
      const leadWithoutHistory = {
        ...mockLead,
        customerInfoHistory: [],
        identificationInfoHistory: []
      }

      mockApplicationService.getLeadById.mockResolvedValue(leadWithoutHistory)
      mockApplicationService.getLatestCustomerInfo.mockReturnValue(null)
      mockApplicationService.getLatestIdentificationInfo.mockReturnValue(null)

      // Act
      const result = await resolver.lead('lead-123')

      // Assert
      expect(result!.customerInfo).toBeNull()
      expect(result!.identificationInfo).toBeNull()
    })

    describe('products resolver field', () => {
      it('should return filtered products based on selectedProducts', async () => {
        // Arrange
        const mockProducts = [
          { type: 'checking', title: 'Checking Account', description: 'Basic checking', icon: 'check' },
          { type: 'savings', title: 'Savings Account', description: 'Basic savings', icon: 'save' },
          { type: 'credit-card', title: 'Credit Card', description: 'Basic card', icon: 'card' }
        ]
        mockConfigService.getProducts.mockReturnValue(mockProducts)
        mockConfigService.loadConfigWithFallback.mockRejectedValue(new Error('No bank config'))

        // Act
        const result = await resolver.products(mockLead as any)

        // Assert
        expect(result).toHaveLength(2)
        expect(result[0].type).toBe('checking')
        expect(result[1].type).toBe('savings')
        expect(mockConfigService.getProducts).toHaveBeenCalled()
      })

      it('should use bank-specific products when available', async () => {
        // Arrange
        const mockBankProducts = [
          { type: 'checking', title: 'Bank Checking', description: 'Bank-specific checking', icon: 'check' },
          { type: 'savings', title: 'Bank Savings', description: 'Bank-specific savings', icon: 'save' }
        ]
        mockConfigService.loadConfigWithFallback.mockResolvedValue(mockBankProducts)

        // Act
        const result = await resolver.products(mockLead as any)

        // Assert
        expect(result).toHaveLength(2)
        expect(result[0].title).toBe('Bank Checking')
        expect(result[1].title).toBe('Bank Savings')
        expect(mockConfigService.loadConfigWithFallback).toHaveBeenCalledWith('products', 'testbank')
      })
    })
  })

  describe('updateLead mutation', () => {
    it('should update lead with provided fields', async () => {
      // Arrange
      const updateInput = {
        leadId: 'lead-123',
        currentStep: 3,
        customerInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phoneNumber: '555-123-9999',
          mailingAddress: {
            street: '456 Oak St',
            city: 'Boston',
            state: 'MA',
            zipCode: '02101'
          },
          useSameAddress: true
        },
        language: 'es'
      }

      mockApplicationService.updateLead.mockResolvedValue({
        ...mockLead,
        currentStep: 3,
        language: 'es'
      })
      mockApplicationService.getLatestCustomerInfo.mockReturnValue({
        data: updateInput.customerInfo
      })
      mockApplicationService.getLatestIdentificationInfo.mockReturnValue(null)

      // Act
      const result = await resolver.updateLead(updateInput)

      // Assert
      expect(result.currentStep).toBe(3)
      expect(result.language).toBe('es')
      expect(mockApplicationService.updateLead).toHaveBeenCalledWith('lead-123', {
        currentStep: 3,
        customerInfo: updateInput.customerInfo,
        language: 'es'
      })
    })

    it('should handle partial updates (only firstName)', async () => {
      // Arrange
      const updateInput = {
        leadId: 'lead-123',
        customerInfo: {
          firstName: 'UpdatedName',
          lastName: 'Doe',
          email: 'john@example.com',
          phoneNumber: '555-123-4567',
          mailingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001'
          },
          useSameAddress: true
        }
      }

      mockApplicationService.updateLead.mockResolvedValue({
        ...mockLead
      })
      mockApplicationService.getLatestCustomerInfo.mockReturnValue({
        data: updateInput.customerInfo
      })
      mockApplicationService.getLatestIdentificationInfo.mockReturnValue(null)

      // Act
      await resolver.updateLead(updateInput)

      // Assert
      expect(mockApplicationService.updateLead).toHaveBeenCalledWith('lead-123', {
        customerInfo: updateInput.customerInfo
      })
    })

    it('should handle status updates', async () => {
      // Arrange
      const updateInput = {
        leadId: 'lead-123',
        status: LeadStatus.SUBMITTED
      }

      mockApplicationService.updateLead.mockResolvedValue({
        ...mockLead,
        status: LeadStatus.SUBMITTED
      })
      mockApplicationService.getLatestCustomerInfo.mockReturnValue({
        data: mockLead.customerInfoHistory[0].data
      })
      mockApplicationService.getLatestIdentificationInfo.mockReturnValue(null)

      // Act
      await resolver.updateLead(updateInput)

      // Assert
      expect(mockApplicationService.updateLead).toHaveBeenCalledWith('lead-123', {
        status: LeadStatus.SUBMITTED
      })
    })
  })
})