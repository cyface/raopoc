import { Injectable, Logger } from '@nestjs/common'
import * as fs from 'fs/promises'
import * as path from 'path'
import { randomUUID } from 'crypto'
import { ConfigService } from './config.service'
import { PrismaService } from './prisma.service'
import { LeadStatus, ProductType, CreditStatus } from '@prisma/client'
import { VersionedCustomerInfo, VersionedIdentificationInfo } from '../dto/application.dto'

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name)
  
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async createApplication(applicationData: {
    selectedProducts: string[]
    customerInfo?: {
      firstName: string
      lastName: string
      email: string
      phoneNumber: string
      mailingAddress: {
        street: string
        city: string
        state: string
        zipCode: string
      }
      billingAddress?: {
        street: string
        city: string
        state: string
        zipCode: string
      }
      useSameAddress: boolean
    }
    identificationInfo?: {
      identificationType: string
      identificationNumber: string
      state?: string
      country?: string
      socialSecurityNumber?: string
      noSSN: boolean
      dateOfBirth: string
    }
    documentAcceptance?: {
      acceptances: Record<string, {
        documentId: string
        accepted: boolean
        acceptedAt?: string
      }>
      allAccepted: boolean
    }
    metadata?: Record<string, unknown>
  }, userAgent?: string, ipAddress?: string) {
    const applicationId = randomUUID()
    
    const lastName = applicationData.customerInfo?.lastName || 'Unknown'
    const sanitizedLastName = lastName.replace(/[^a-zA-Z0-9]/g, '')
    const filename = `${applicationId}-${sanitizedLastName}.json`
    
    const application = {
      id: applicationId,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      data: applicationData,
      metadata: {
        userAgent,
        ipAddress,
        submissionSource: 'web-onboarding'
      }
    }
    
    const applicationsDir = path.join(process.cwd(), '..', 'applications')
    await fs.mkdir(applicationsDir, { recursive: true })
    
    const filePath = path.join(applicationsDir, filename)
    await fs.writeFile(filePath, JSON.stringify(application, null, 2))
    
    this.logger.log(`Application saved: ${filename}`)
    this.logger.log(`Mock confirmation email sent to: ${applicationData.customerInfo?.email}`)
    
    return {
      applicationId,
      status: 'submitted',
      message: 'Application submitted successfully',
      filename
    }
  }

  async getApplication(id: string) {
    const applicationsDir = path.join(process.cwd(), '..', 'applications')
    
    const files = await fs.readdir(applicationsDir)
    const applicationFile = files.find(file => file.startsWith(id))
    
    if (!applicationFile) {
      return null
    }
    
    const filePath = path.join(applicationsDir, applicationFile)
    const applicationData = await fs.readFile(filePath, 'utf-8')
    const application = JSON.parse(applicationData)
    
    // No decryption needed anymore
    
    return application
  }

  async performCreditCheck(ssn: string) {
    const badSSNConfig = this.configService.getBadSSNs()
    
    if (!badSSNConfig) {
      throw new Error('Credit check service unavailable')
    }

    const normalizedSSN = ssn.replace(/[^0-9]/g, '')
    const badSSNs = badSSNConfig.badSSNs.map(badSSN => badSSN.replace(/[^0-9]/g, ''))

    const isOnBadList = badSSNs.includes(normalizedSSN)

    this.logger.log(`Credit check performed for SSN: ${ssn.substring(0, 3)}-XX-XXXX`)
    this.logger.log(`Credit check result: ${isOnBadList ? 'REQUIRES_VERIFICATION' : 'PASSED'}`)

    return {
      status: isOnBadList ? 'requires_verification' : 'approved',
      requiresVerification: isOnBadList,
      message: isOnBadList 
        ? 'Additional verification required - a representative will contact you'
        : 'Credit check passed'
    }
  }

  // New Lead Management Methods using Prisma

  /**
   * Create or update a lead in the database
   */
  async createOrUpdateLead(data: {
    sessionId?: string
    selectedProducts?: string[]
    customerInfo?: any
    identificationInfo?: any
    currentStep?: number
    completedSteps?: number[]
    financialInstitution?: string
    language?: string
    theme?: string
    devStep?: number
    mockScenario?: string
    userAgent?: string
    ipAddress?: string
  }) {
    const leadData: any = {
      status: LeadStatus.IN_PROGRESS,
      currentStep: data.currentStep || 1,
      completedSteps: data.completedSteps || [],
      financialInstitution: data.financialInstitution,
      language: data.language || 'en',
      theme: data.theme,
      sessionId: data.sessionId,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress || null,
      devStep: data.devStep,
      mockScenario: data.mockScenario,
      lastActivity: new Date()
    }

    // Convert and set selected products
    if (data.selectedProducts) {
      leadData.selectedProducts = data.selectedProducts.map(product => {
        switch (product.toLowerCase()) {
          case 'checking': return ProductType.CHECKING
          case 'savings': return ProductType.SAVINGS
          case 'money-market': return ProductType.MONEY_MARKET
          default: return ProductType.CHECKING
        }
      })
    }

    // Set customer info as versioned data AND legacy field
    if (data.customerInfo) {
      leadData.customerInfoHistory = [this.createVersionedCustomerInfo(data.customerInfo)]
      leadData.customerInfo = data.customerInfo // Also populate legacy field
    }

    // Set identification info as versioned data AND legacy field
    if (data.identificationInfo) {
      leadData.identificationInfoHistory = [this.createVersionedIdentificationInfo(data.identificationInfo)]
      leadData.identificationInfo = data.identificationInfo // Also populate legacy field
    }

    // Try to update existing lead by session ID, or create new one
    if (data.sessionId) {
      const existingLead = await this.prisma.lead.findUnique({
        where: { sessionId: data.sessionId }
      })

      if (existingLead) {
        const updatedLead = await this.prisma.lead.update({
          where: { sessionId: data.sessionId },
          data: leadData,
          include: { documentAcceptances: true }
        })
        
        this.logger.log(`Lead updated: ${updatedLead.id}`)
        return updatedLead
      }
    }

    // Create new lead
    const newLead = await this.prisma.lead.create({
      data: leadData,
      include: { documentAcceptances: true }
    })

    this.logger.log(`Lead created: ${newLead.id}`)
    return newLead
  }

  /**
   * Get lead by session ID
   */
  async getLeadBySessionId(sessionId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { sessionId },
      include: { documentAcceptances: true }
    })

    if (!lead) {
      return null
    }

    // No decryption needed anymore
    return lead
  }

  /**
   * Get lead by ID
   */
  async getLeadById(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: { documentAcceptances: true }
    })

    if (!lead) {
      return null
    }

    // No decryption needed anymore
    return lead
  }

  /**
   * Update lead credit check results
   */
  async updateLeadCreditCheck(leadId: string, creditCheckResult: {
    status: string
    requiresVerification: boolean
    message: string
  }) {
    let creditStatus: CreditStatus
    switch (creditCheckResult.status) {
      case 'approved': creditStatus = CreditStatus.APPROVED; break
      case 'requires_verification': creditStatus = CreditStatus.REQUIRES_VERIFICATION; break
      case 'pending': creditStatus = CreditStatus.PENDING; break
      default: creditStatus = CreditStatus.ERROR
    }

    const updatedLead = await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        creditCheckStatus: creditStatus,
        requiresVerification: creditCheckResult.requiresVerification,
        creditCheckMessage: creditCheckResult.message,
        creditCheckAt: new Date(),
        lastActivity: new Date()
      },
      include: { documentAcceptances: true }
    })

    this.logger.log(`Credit check updated for lead: ${leadId}`)
    return updatedLead
  }

  /**
   * Update document acceptances for a lead
   */
  async updateLeadDocumentAcceptances(leadId: string, acceptances: {
    documentId: string
    accepted: boolean
  }[]) {
    // Delete existing acceptances for this lead
    await this.prisma.documentAcceptance.deleteMany({
      where: { leadId }
    })

    // Create new acceptances
    const documentAcceptances = await Promise.all(
      acceptances.map(acceptance =>
        this.prisma.documentAcceptance.create({
          data: {
            leadId,
            documentId: acceptance.documentId,
            accepted: acceptance.accepted,
            acceptedAt: acceptance.accepted ? new Date() : null
          }
        })
      )
    )

    // Update lead's allDocumentsAccepted status
    const allAccepted = acceptances.every(acc => acc.accepted)
    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        allDocumentsAccepted: allAccepted,
        lastActivity: new Date()
      }
    })

    this.logger.log(`Document acceptances updated for lead: ${leadId}`)
    return documentAcceptances
  }

  /**
   * Update lead step progress
   */
  async updateLeadStep(leadId: string, stepData: {
    currentStep: number
    completedSteps?: number[]
    stepData?: any
  }) {
    const updateData: any = {
      currentStep: stepData.currentStep,
      lastActivity: new Date()
    }

    // Update completed steps array
    if (stepData.completedSteps) {
      updateData.completedSteps = stepData.completedSteps
    } else {
      // Auto-generate completed steps based on current step
      updateData.completedSteps = Array.from({ length: stepData.currentStep }, (_, i) => i + 1)
    }

    // Update step-specific data
    if (stepData.stepData) {
      switch (stepData.currentStep) {
        case 1:
          // Product selection step
          if (stepData.stepData.selectedProducts) {
            updateData.selectedProducts = stepData.stepData.selectedProducts.map((product: string) => {
              switch (product.toLowerCase()) {
                case 'checking': return ProductType.CHECKING
                case 'savings': return ProductType.SAVINGS
                case 'money-market': return ProductType.MONEY_MARKET
                default: return ProductType.CHECKING
              }
            })
          }
          break
        case 2:
          // Customer info step - handle as versioned data AND legacy field
          if (stepData.stepData.customerInfo) {
            // Get existing lead to check for current customer info
            const existingLead = await this.prisma.lead.findUnique({
              where: { id: leadId },
              select: { customerInfoHistory: true }
            })
            
            if (existingLead && Array.isArray(existingLead.customerInfoHistory) && existingLead.customerInfoHistory.length > 0) {
              // Add new version to existing history
              const currentHistory = existingLead.customerInfoHistory as unknown as VersionedCustomerInfo[]
              const nextVersion = Math.max(...currentHistory.map(v => v.version)) + 1
              const newVersionedRecord: VersionedCustomerInfo = {
                version: nextVersion,
                timestamp: new Date().toISOString(),
                data: stepData.stepData.customerInfo,
                source: 'web-onboarding',
                changeReason: 'step_completion'
              }
              updateData.customerInfoHistory = [...currentHistory, newVersionedRecord] as any
            } else {
              // Create initial version
              updateData.customerInfoHistory = [this.createVersionedCustomerInfo(stepData.stepData.customerInfo, 'web-onboarding', 'step_completion')] as any
            }
            // Also update legacy field for backward compatibility
            updateData.customerInfo = stepData.stepData.customerInfo
          }
          break
        case 3:
          // Identification step - handle as versioned data AND legacy field
          if (stepData.stepData.identificationInfo) {
            // Get existing lead to check for current identification info
            const existingLead = await this.prisma.lead.findUnique({
              where: { id: leadId },
              select: { identificationInfoHistory: true }
            })
            
            if (existingLead && Array.isArray(existingLead.identificationInfoHistory) && existingLead.identificationInfoHistory.length > 0) {
              // Add new version to existing history
              const currentHistory = existingLead.identificationInfoHistory as unknown as VersionedIdentificationInfo[]
              const nextVersion = Math.max(...currentHistory.map(v => v.version)) + 1
              const newVersionedRecord: VersionedIdentificationInfo = {
                version: nextVersion,
                timestamp: new Date().toISOString(),
                data: stepData.stepData.identificationInfo,
                source: 'web-onboarding',
                changeReason: 'step_completion'
              }
              updateData.identificationInfoHistory = [...currentHistory, newVersionedRecord] as any
            } else {
              // Create initial version
              updateData.identificationInfoHistory = [this.createVersionedIdentificationInfo(stepData.stepData.identificationInfo, 'web-onboarding', 'step_completion')] as any
            }
            // Also update legacy field for backward compatibility
            updateData.identificationInfo = stepData.stepData.identificationInfo
          }
          break
        case 4:
          // Documents step - handled separately via updateLeadDocumentAcceptances
          break
        case 5:
          // Confirmation step - mark as submitted
          updateData.status = LeadStatus.SUBMITTED
          updateData.submittedAt = new Date()
          break
      }
    }

    const updatedLead = await this.prisma.lead.update({
      where: { id: leadId },
      data: updateData,
      include: { documentAcceptances: true }
    })

    this.logger.log(`Lead step updated: ${leadId} - Step ${stepData.currentStep}`)
    return updatedLead
  }

  /**
   * Submit lead (mark as submitted)
   */
  async submitLead(leadId: string) {
    const submittedLead = await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        status: LeadStatus.SUBMITTED,
        submittedAt: new Date(),
        lastActivity: new Date()
      },
      include: { documentAcceptances: true }
    })

    this.logger.log(`Lead submitted: ${leadId}`)
    return submittedLead
  }

  /**
   * Get all leads (for back-office)
   */
  async getAllLeads(params?: {
    status?: LeadStatus
    financialInstitution?: string
    limit?: number
    offset?: number
  }) {
    const where: any = {}
    if (params?.status) where.status = params.status
    if (params?.financialInstitution) where.financialInstitution = params.financialInstitution

    const leads = await this.prisma.lead.findMany({
      where,
      include: { documentAcceptances: true },
      orderBy: { createdAt: 'desc' },
      take: params?.limit || 50,
      skip: params?.offset || 0
    })

    // No decryption needed anymore
    return leads
  }

  // Versioned Data Management Methods

  /**
   * Create versioned customer info record
   */
  private createVersionedCustomerInfo(data: any, source?: string, changeReason?: string): VersionedCustomerInfo {
    return {
      version: 1,
      timestamp: new Date().toISOString(),
      data: data,
      source: source || 'web-onboarding',
      changeReason: changeReason || 'initial_entry'
    }
  }

  /**
   * Create versioned identification info record
   */
  private createVersionedIdentificationInfo(data: any, source?: string, changeReason?: string): VersionedIdentificationInfo {
    return {
      version: 1,
      timestamp: new Date().toISOString(),
      data: data,
      source: source || 'web-onboarding',
      changeReason: changeReason || 'initial_entry'
    }
  }

  /**
   * Add new version of customer info to existing lead
   */
  async addCustomerInfoVersion(leadId: string, customerInfo: any, source?: string, changeReason?: string) {
    const existingLead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { customerInfoHistory: true }
    })

    if (!existingLead) {
      throw new Error('Lead not found')
    }

    const currentHistory = existingLead.customerInfoHistory as unknown as VersionedCustomerInfo[]
    const nextVersion = currentHistory.length > 0 ? Math.max(...currentHistory.map(v => v.version)) + 1 : 1

    const newVersionedRecord: VersionedCustomerInfo = {
      version: nextVersion,
      timestamp: new Date().toISOString(),
      data: customerInfo,
      source: source || 'web-onboarding',
      changeReason: changeReason || 'data_update'
    }

    const updatedHistory = [...currentHistory, newVersionedRecord]

    const updatedLead = await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        customerInfoHistory: updatedHistory as any,
        lastActivity: new Date()
      },
      include: { documentAcceptances: true }
    })

    this.logger.log(`Customer info version ${nextVersion} added for lead: ${leadId}`)
    return updatedLead
  }

  /**
   * Add new version of identification info to existing lead
   */
  async addIdentificationInfoVersion(leadId: string, identificationInfo: any, source?: string, changeReason?: string) {
    const existingLead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { identificationInfoHistory: true }
    })

    if (!existingLead) {
      throw new Error('Lead not found')
    }

    const currentHistory = existingLead.identificationInfoHistory as unknown as VersionedIdentificationInfo[]
    const nextVersion = currentHistory.length > 0 ? Math.max(...currentHistory.map(v => v.version)) + 1 : 1

    const newVersionedRecord: VersionedIdentificationInfo = {
      version: nextVersion,
      timestamp: new Date().toISOString(),
      data: identificationInfo,
      source: source || 'web-onboarding',
      changeReason: changeReason || 'data_update'
    }

    const updatedHistory = [...currentHistory, newVersionedRecord]

    const updatedLead = await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        identificationInfoHistory: updatedHistory as any,
        lastActivity: new Date()
      },
      include: { documentAcceptances: true }
    })

    this.logger.log(`Identification info version ${nextVersion} added for lead: ${leadId}`)
    return updatedLead
  }

  /**
   * Get latest version of customer info
   */
  getLatestCustomerInfo(customerInfoHistory: VersionedCustomerInfo[]): VersionedCustomerInfo | null {
    if (!customerInfoHistory || customerInfoHistory.length === 0) {
      return null
    }
    return customerInfoHistory.reduce((latest, current) => 
      current.version > latest.version ? current : latest
    )
  }

  /**
   * Get latest version of identification info
   */
  getLatestIdentificationInfo(identificationInfoHistory: VersionedIdentificationInfo[]): VersionedIdentificationInfo | null {
    if (!identificationInfoHistory || identificationInfoHistory.length === 0) {
      return null
    }
    return identificationInfoHistory.reduce((latest, current) => 
      current.version > latest.version ? current : latest
    )
  }

  /**
   * Get version history for customer info
   */
  getCustomerInfoHistory(leadId: string) {
    return this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { customerInfoHistory: true }
    })
  }

  /**
   * Get version history for identification info
   */
  getIdentificationInfoHistory(leadId: string) {
    return this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { identificationInfoHistory: true }
    })
  }
}