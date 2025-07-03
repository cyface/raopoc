import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { LeadController } from './lead.controller'
import { ApplicationService } from '../services/application.service'
import { LeadStatus } from '@prisma/client'

describe('LeadController', () => {
  let controller: LeadController

  const mockApplicationService = {
    createOrUpdateLead: vi.fn(),
    getLeadBySessionId: vi.fn(),
    getLeadById: vi.fn(),
    updateLeadCreditCheck: vi.fn(),
    updateLeadDocumentAcceptances: vi.fn(),
    submitLead: vi.fn(),
    getAllLeads: vi.fn()
  }

  beforeEach(async () => {
    // Create controller instance manually with mocked service
    controller = new LeadController(mockApplicationService as any)

    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  describe('createOrUpdateLead', () => {
    it('should create or update a lead with provided data', async () => {
      const leadData = {
        sessionId: 'session-123',
        selectedProducts: ['checking', 'savings'],
        customerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        currentStep: 3,
        completedSteps: [1, 2, 3],
        financialInstitution: 'testbank',
        language: 'en'
      }

      const userAgent = 'Mozilla/5.0 (test browser)'
      const ipAddress = '192.168.1.1'

      const expectedResult = {
        id: 'lead-123',
        ...leadData,
        userAgent,
        ipAddress
      }

      mockApplicationService.createOrUpdateLead.mockResolvedValue(expectedResult)

      const result = await controller.createOrUpdateLead(leadData, userAgent, ipAddress)

      expect(mockApplicationService.createOrUpdateLead).toHaveBeenCalledWith({
        ...leadData,
        userAgent,
        ipAddress
      })

      expect(result).toEqual(expectedResult)
    })

    it('should handle missing user agent and IP address', async () => {
      const leadData = {
        selectedProducts: ['checking']
      }

      const expectedResult = { id: 'lead-456' }
      mockApplicationService.createOrUpdateLead.mockResolvedValue(expectedResult)

      const result = await controller.createOrUpdateLead(leadData)

      expect(mockApplicationService.createOrUpdateLead).toHaveBeenCalledWith({
        ...leadData,
        userAgent: undefined,
        ipAddress: undefined
      })

      expect(result).toEqual(expectedResult)
    })
  })

  describe('getLeadBySessionId', () => {
    it('should retrieve lead by session ID', async () => {
      const sessionId = 'session-123'
      const expectedLead = {
        id: 'lead-123',
        sessionId,
        status: LeadStatus.IN_PROGRESS,
        customerInfo: { firstName: 'John', lastName: 'Doe' }
      }

      mockApplicationService.getLeadBySessionId.mockResolvedValue(expectedLead)

      const result = await controller.getLeadBySessionId(sessionId)

      expect(mockApplicationService.getLeadBySessionId).toHaveBeenCalledWith(sessionId)
      expect(result).toEqual(expectedLead)
    })

    it('should return null for non-existent session', async () => {
      mockApplicationService.getLeadBySessionId.mockResolvedValue(null)

      const result = await controller.getLeadBySessionId('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('getLeadById', () => {
    it('should retrieve lead by ID', async () => {
      const leadId = 'lead-123'
      const expectedLead = {
        id: leadId,
        status: LeadStatus.SUBMITTED,
        customerInfo: { firstName: 'Jane', lastName: 'Smith' }
      }

      mockApplicationService.getLeadById.mockResolvedValue(expectedLead)

      const result = await controller.getLeadById(leadId)

      expect(mockApplicationService.getLeadById).toHaveBeenCalledWith(leadId)
      expect(result).toEqual(expectedLead)
    })
  })

  describe('updateCreditCheck', () => {
    it('should update credit check results for a lead', async () => {
      const leadId = 'lead-123'
      const creditCheckResult = {
        status: 'requires_verification',
        requiresVerification: true,
        message: 'Additional verification required'
      }

      const updatedLead = {
        id: leadId,
        creditCheckStatus: 'REQUIRES_VERIFICATION',
        requiresVerification: true,
        creditCheckMessage: 'Additional verification required'
      }

      mockApplicationService.updateLeadCreditCheck.mockResolvedValue(updatedLead)

      const result = await controller.updateCreditCheck(leadId, creditCheckResult)

      expect(mockApplicationService.updateLeadCreditCheck).toHaveBeenCalledWith(
        leadId,
        creditCheckResult
      )
      expect(result).toEqual(updatedLead)
    })
  })

  describe('updateDocumentAcceptances', () => {
    it('should update document acceptances for a lead', async () => {
      const leadId = 'lead-123'
      const acceptances = [
        { documentId: 'terms-of-service', accepted: true },
        { documentId: 'privacy-policy', accepted: true }
      ]

      const updatedAcceptances = [
        { id: 'acc1', leadId, documentId: 'terms-of-service', accepted: true },
        { id: 'acc2', leadId, documentId: 'privacy-policy', accepted: true }
      ]

      mockApplicationService.updateLeadDocumentAcceptances.mockResolvedValue(updatedAcceptances)

      const result = await controller.updateDocumentAcceptances(leadId, { acceptances })

      expect(mockApplicationService.updateLeadDocumentAcceptances).toHaveBeenCalledWith(
        leadId,
        acceptances
      )
      expect(result).toEqual(updatedAcceptances)
    })
  })

  describe('submitLead', () => {
    it('should submit a lead', async () => {
      const leadId = 'lead-123'
      const submittedLead = {
        id: leadId,
        status: LeadStatus.SUBMITTED,
        submittedAt: new Date()
      }

      mockApplicationService.submitLead.mockResolvedValue(submittedLead)

      const result = await controller.submitLead(leadId)

      expect(mockApplicationService.submitLead).toHaveBeenCalledWith(leadId)
      expect(result).toEqual(submittedLead)
    })
  })

  describe('getAllLeads', () => {
    it('should retrieve all leads with default parameters', async () => {
      const leads = [
        { id: 'lead-1', status: LeadStatus.SUBMITTED },
        { id: 'lead-2', status: LeadStatus.IN_PROGRESS }
      ]

      mockApplicationService.getAllLeads.mockResolvedValue(leads)

      const result = await controller.getAllLeads()

      expect(mockApplicationService.getAllLeads).toHaveBeenCalledWith({
        status: undefined,
        financialInstitution: undefined,
        limit: undefined,
        offset: undefined
      })
      expect(result).toEqual(leads)
    })

    it('should retrieve leads with filtering parameters', async () => {
      const status = LeadStatus.SUBMITTED
      const financialInstitution = 'testbank'
      const limit = '25'
      const offset = '10'

      const filteredLeads = [
        { id: 'lead-1', status: LeadStatus.SUBMITTED, financialInstitution: 'testbank' }
      ]

      mockApplicationService.getAllLeads.mockResolvedValue(filteredLeads)

      const result = await controller.getAllLeads(status, financialInstitution, limit, offset)

      expect(mockApplicationService.getAllLeads).toHaveBeenCalledWith({
        status,
        financialInstitution,
        limit: 25,
        offset: 10
      })
      expect(result).toEqual(filteredLeads)
    })

    it('should handle invalid limit and offset strings', async () => {
      const invalidLimit = 'not-a-number'
      const invalidOffset = 'also-not-a-number'

      mockApplicationService.getAllLeads.mockResolvedValue([])

      await controller.getAllLeads(undefined, undefined, invalidLimit, invalidOffset)

      expect(mockApplicationService.getAllLeads).toHaveBeenCalledWith({
        status: undefined,
        financialInstitution: undefined,
        limit: NaN, // parseInt returns NaN for invalid strings
        offset: NaN // parseInt returns NaN for invalid strings
      })
    })

    it('should parse valid limit and offset strings to numbers', async () => {
      const limit = '50'
      const offset = '100'

      mockApplicationService.getAllLeads.mockResolvedValue([])

      await controller.getAllLeads(undefined, undefined, limit, offset)

      expect(mockApplicationService.getAllLeads).toHaveBeenCalledWith({
        status: undefined,
        financialInstitution: undefined,
        limit: 50,
        offset: 100
      })
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete lead lifecycle', async () => {
      const sessionId = 'session-complete'
      const leadData = {
        sessionId,
        selectedProducts: ['checking'],
        customerInfo: { firstName: 'Test', lastName: 'User' },
        currentStep: 1
      }

      // Create lead
      const createdLead = { id: 'lead-complete', ...leadData }
      mockApplicationService.createOrUpdateLead.mockResolvedValue(createdLead)

      const createResult = await controller.createOrUpdateLead(leadData)
      expect(createResult).toEqual(createdLead)

      // Update credit check
      const creditResult = { status: 'approved', requiresVerification: false, message: 'Approved' }
      const leadWithCredit = { ...createdLead, creditCheckStatus: 'APPROVED' }
      mockApplicationService.updateLeadCreditCheck.mockResolvedValue(leadWithCredit)

      const creditUpdateResult = await controller.updateCreditCheck('lead-complete', creditResult)
      expect(creditUpdateResult).toEqual(leadWithCredit)

      // Submit lead
      const submittedLead = { ...leadWithCredit, status: LeadStatus.SUBMITTED }
      mockApplicationService.submitLead.mockResolvedValue(submittedLead)

      const submitResult = await controller.submitLead('lead-complete')
      expect(submitResult).toEqual(submittedLead)

      // Verify all service methods were called correctly
      expect(mockApplicationService.createOrUpdateLead).toHaveBeenCalledWith(leadData)
      expect(mockApplicationService.updateLeadCreditCheck).toHaveBeenCalledWith('lead-complete', creditResult)
      expect(mockApplicationService.submitLead).toHaveBeenCalledWith('lead-complete')
    })
  })
})