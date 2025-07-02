import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { ApplicationService } from './application.service'
import { ConfigService } from './config.service'
import { PrismaService } from './prisma.service'
import { LeadStatus, ProductType, CreditStatus } from '@prisma/client'

describe('ApplicationService - Lead Management', () => {
  let service: ApplicationService

  const mockPrismaService = {
    lead: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn()
    },
    documentAcceptance: {
      create: vi.fn(),
      deleteMany: vi.fn()
    }
  }

  const mockConfigService = {
    getBadSSNs: vi.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ],
    }).compile()

    service = module.get<ApplicationService>(ApplicationService)

    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('createOrUpdateLead', () => {
    const mockLeadData = {
      selectedProducts: ['checking', 'savings'],
      customerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '555-123-4567'
      },
      identificationInfo: {
        identificationType: 'driversLicense',
        identificationNumber: 'DL123456',
        socialSecurityNumber: '123-45-6789'
      },
      currentStep: 3,
      completedSteps: [1, 2, 3],
      sessionId: 'session-123',
      financialInstitution: 'testbank',
      language: 'en',
      userAgent: 'Mozilla/5.0...',
      ipAddress: '192.168.1.1'
    }

    it('should create a new lead when sessionId does not exist', async () => {
      // Mock Prisma calls
      mockPrismaService.lead.findUnique.mockResolvedValue(null)
      mockPrismaService.lead.create.mockResolvedValue({
        id: 'lead-123',
        sessionId: 'session-123',
        status: LeadStatus.IN_PROGRESS,
        selectedProducts: [ProductType.CHECKING, ProductType.SAVINGS],
        customerInfo: mockLeadData.customerInfo,
        identificationInfo: mockLeadData.identificationInfo,
        documentAcceptances: []
      })

      const result = await service.createOrUpdateLead(mockLeadData)

      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledWith({
        where: { sessionId: 'session-123' }
      })

      expect(mockPrismaService.lead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: LeadStatus.IN_PROGRESS,
          currentStep: 3,
          completedSteps: [1, 2, 3],
          selectedProducts: [ProductType.CHECKING, ProductType.SAVINGS],
          sessionId: 'session-123',
          financialInstitution: 'testbank',
          language: 'en',
          userAgent: 'Mozilla/5.0...',
          customerInfo: mockLeadData.customerInfo,
          identificationInfo: mockLeadData.identificationInfo,
          ipAddress: '192.168.1.1'
        }),
        include: { documentAcceptances: true }
      })

      expect(result.id).toBe('lead-123')
    })

    it('should update existing lead when sessionId exists', async () => {
      const existingLead = {
        id: 'existing-lead',
        sessionId: 'session-123',
        status: LeadStatus.IN_PROGRESS
      }

      mockPrismaService.lead.findUnique.mockResolvedValue(existingLead)
      mockPrismaService.lead.update.mockResolvedValue({
        ...existingLead,
        currentStep: 3,
        documentAcceptances: []
      })

      const result = await service.createOrUpdateLead(mockLeadData)

      expect(result).toEqual({ ...existingLead, currentStep: 3, documentAcceptances: [] })
      expect(mockPrismaService.lead.update).toHaveBeenCalledWith({
        where: { sessionId: 'session-123' },
        data: expect.objectContaining({
          currentStep: 3,
          completedSteps: [1, 2, 3]
        }),
        include: { documentAcceptances: true }
      })
    })

    it('should correctly map product types', async () => {
      const dataWithProducts = {
        ...mockLeadData,
        selectedProducts: ['checking', 'savings', 'money-market']
      }

      mockPrismaService.lead.findUnique.mockResolvedValue(null)
      mockPrismaService.lead.create.mockResolvedValue({ id: 'test', documentAcceptances: [] })

      await service.createOrUpdateLead(dataWithProducts)

      expect(mockPrismaService.lead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          selectedProducts: [ProductType.CHECKING, ProductType.SAVINGS, ProductType.MONEY_MARKET]
        }),
        include: { documentAcceptances: true }
      })
    })
  })

  describe('getLeadBySessionId', () => {
    it('should return lead data by session ID', async () => {
      const mockLead = {
        id: 'lead-123',
        sessionId: 'session-123',
        customerInfo: { firstName: 'John', lastName: 'Doe' },
        identificationInfo: { ssn: '123-45-6789' },
        ipAddress: '192.168.1.1',
        documentAcceptances: []
      }

      mockPrismaService.lead.findUnique.mockResolvedValue(mockLead)

      const result = await service.getLeadBySessionId('session-123')

      expect(result).toEqual(mockLead)
    })

    it('should return null for non-existent session', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(null)

      const result = await service.getLeadBySessionId('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('updateLeadCreditCheck', () => {
    it('should update credit check results correctly', async () => {
      const creditCheckResult = {
        status: 'requires_verification',
        requiresVerification: true,
        message: 'Additional verification required'
      }

      const updatedLead = {
        id: 'lead-123',
        creditCheckStatus: CreditStatus.REQUIRES_VERIFICATION,
        requiresVerification: true,
        creditCheckMessage: 'Additional verification required',
        documentAcceptances: []
      }

      mockPrismaService.lead.update.mockResolvedValue(updatedLead)

      const result = await service.updateLeadCreditCheck('lead-123', creditCheckResult)

      expect(mockPrismaService.lead.update).toHaveBeenCalledWith({
        where: { id: 'lead-123' },
        data: {
          creditCheckStatus: CreditStatus.REQUIRES_VERIFICATION,
          requiresVerification: true,
          creditCheckMessage: 'Additional verification required',
          creditCheckAt: expect.any(Date),
          lastActivity: expect.any(Date)
        },
        include: { documentAcceptances: true }
      })

      expect(result).toEqual(updatedLead)
    })

    it('should map different credit status values correctly', async () => {
      const testCases = [
        { input: 'approved', expected: CreditStatus.APPROVED },
        { input: 'pending', expected: CreditStatus.PENDING },
        { input: 'unknown', expected: CreditStatus.ERROR }
      ]

      for (const testCase of testCases) {
        mockPrismaService.lead.update.mockResolvedValue({ documentAcceptances: [] })

        await service.updateLeadCreditCheck('lead-123', {
          status: testCase.input,
          requiresVerification: false,
          message: 'Test'
        })

        expect(mockPrismaService.lead.update).toHaveBeenCalledWith({
          where: { id: 'lead-123' },
          data: expect.objectContaining({
            creditCheckStatus: testCase.expected
          }),
          include: { documentAcceptances: true }
        })
      }
    })
  })

  describe('updateLeadDocumentAcceptances', () => {
    it('should update document acceptances correctly', async () => {
      const acceptances = [
        { documentId: 'terms-of-service', accepted: true },
        { documentId: 'privacy-policy', accepted: true }
      ]

      const mockDocAcceptances = [
        { id: 'acc1', leadId: 'lead-123', documentId: 'terms-of-service', accepted: true },
        { id: 'acc2', leadId: 'lead-123', documentId: 'privacy-policy', accepted: true }
      ]

      mockPrismaService.documentAcceptance.create
        .mockResolvedValueOnce(mockDocAcceptances[0])
        .mockResolvedValueOnce(mockDocAcceptances[1])

      const result = await service.updateLeadDocumentAcceptances('lead-123', acceptances)

      // Should delete existing acceptances first
      expect(mockPrismaService.documentAcceptance.deleteMany).toHaveBeenCalledWith({
        where: { leadId: 'lead-123' }
      })

      // Should create new acceptances
      expect(mockPrismaService.documentAcceptance.create).toHaveBeenCalledTimes(2)

      // Should update lead's allDocumentsAccepted status
      expect(mockPrismaService.lead.update).toHaveBeenCalledWith({
        where: { id: 'lead-123' },
        data: {
          allDocumentsAccepted: true,
          lastActivity: expect.any(Date)
        }
      })

      expect(result).toEqual(mockDocAcceptances)
    })

    it('should handle partial document acceptances', async () => {
      const acceptances = [
        { documentId: 'terms-of-service', accepted: true },
        { documentId: 'privacy-policy', accepted: false }
      ]

      mockPrismaService.documentAcceptance.create.mockResolvedValue({})

      await service.updateLeadDocumentAcceptances('lead-123', acceptances)

      // Should set allDocumentsAccepted to false
      expect(mockPrismaService.lead.update).toHaveBeenCalledWith({
        where: { id: 'lead-123' },
        data: {
          allDocumentsAccepted: false,
          lastActivity: expect.any(Date)
        }
      })
    })
  })

  describe('submitLead', () => {
    it('should submit lead and update status correctly', async () => {
      const submittedLead = {
        id: 'lead-123',
        status: LeadStatus.SUBMITTED,
        submittedAt: expect.any(Date),
        documentAcceptances: []
      }

      mockPrismaService.lead.update.mockResolvedValue(submittedLead)

      const result = await service.submitLead('lead-123')

      expect(result).toEqual(submittedLead)
      expect(mockPrismaService.lead.update).toHaveBeenCalledWith({
        where: { id: 'lead-123' },
        data: {
          status: LeadStatus.SUBMITTED,
          submittedAt: expect.any(Date),
          lastActivity: expect.any(Date)
        },
        include: { documentAcceptances: true }
      })

      expect(result.status).toBe(LeadStatus.SUBMITTED)
    })
  })

  describe('getAllLeads', () => {
    it('should return leads with filtering', async () => {
      const mockLeads = [
        {
          id: 'lead-1',
          status: LeadStatus.SUBMITTED,
          financialInstitution: 'testbank',
          customerInfo: { firstName: 'John' },
          identificationInfo: null,
          ipAddress: null,
          documentAcceptances: []
        },
        {
          id: 'lead-2',
          status: LeadStatus.IN_PROGRESS,
          financialInstitution: 'testbank',
          customerInfo: { firstName: 'Jane' },
          identificationInfo: null,
          ipAddress: null,
          documentAcceptances: []
        }
      ]

      mockPrismaService.lead.findMany.mockResolvedValue(mockLeads)

      const result = await service.getAllLeads({
        status: LeadStatus.SUBMITTED,
        financialInstitution: 'testbank',
        limit: 10,
        offset: 0
      })

      expect(mockPrismaService.lead.findMany).toHaveBeenCalledWith({
        where: {
          status: LeadStatus.SUBMITTED,
          financialInstitution: 'testbank'
        },
        include: { documentAcceptances: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0
      })

      expect(result).toHaveLength(2)
      expect(result).toEqual(mockLeads)
    })

    it('should use default pagination when not specified', async () => {
      mockPrismaService.lead.findMany.mockResolvedValue([])

      await service.getAllLeads()

      expect(mockPrismaService.lead.findMany).toHaveBeenCalledWith({
        where: {},
        include: { documentAcceptances: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0
      })
    })
  })

  describe('performCreditCheck', () => {
    it('should return approved for good SSN', async () => {
      mockConfigService.getBadSSNs.mockReturnValue({
        badSSNs: ['666-12-3456', '123-45-6789']
      })

      const result = await service.performCreditCheck('555-11-2222')

      expect(result).toEqual({
        status: 'approved',
        requiresVerification: false,
        message: 'Credit check passed'
      })
    })

    it('should return requires_verification for bad SSN', async () => {
      mockConfigService.getBadSSNs.mockReturnValue({
        badSSNs: ['666-12-3456', '123-45-6789']
      })

      const result = await service.performCreditCheck('123-45-6789')

      expect(result).toEqual({
        status: 'requires_verification',
        requiresVerification: true,
        message: 'Additional verification required - a representative will contact you'
      })
    })

    it('should handle formatted SSN variations', async () => {
      mockConfigService.getBadSSNs.mockReturnValue({
        badSSNs: ['123456789'] // Unformatted in config
      })

      const result = await service.performCreditCheck('123-45-6789') // Formatted input

      expect(result.requiresVerification).toBe(true)
    })

    it('should throw error when config is unavailable', async () => {
      mockConfigService.getBadSSNs.mockReturnValue(null)

      await expect(service.performCreditCheck('123-45-6789')).rejects.toThrow(
        'Credit check service unavailable'
      )
    })
  })
})