import { Controller, Get, Post, Put, Body, Param, Query, Headers, Ip } from '@nestjs/common'
import { ApplicationService } from '../services/application.service'
import { LeadStatus } from '@prisma/client'

@Controller('api/leads')
export class LeadController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  async createOrUpdateLead(
    @Body() leadData: {
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
    },
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string
  ) {
    return this.applicationService.createOrUpdateLead({
      ...leadData,
      userAgent,
      ipAddress
    })
  }

  @Get('session/:sessionId')
  async getLeadBySessionId(@Param('sessionId') sessionId: string) {
    return this.applicationService.getLeadBySessionId(sessionId)
  }

  @Get(':id')
  async getLeadById(@Param('id') id: string) {
    return this.applicationService.getLeadById(id)
  }

  @Put(':id/credit-check')
  async updateCreditCheck(
    @Param('id') leadId: string,
    @Body() creditCheckResult: {
      status: string
      requiresVerification: boolean
      message: string
    }
  ) {
    return this.applicationService.updateLeadCreditCheck(leadId, creditCheckResult)
  }

  @Put(':id/documents')
  async updateDocumentAcceptances(
    @Param('id') leadId: string,
    @Body() body: {
      acceptances: {
        documentId: string
        accepted: boolean
      }[]
    }
  ) {
    return this.applicationService.updateLeadDocumentAcceptances(leadId, body.acceptances)
  }

  @Put(':id/submit')
  async submitLead(@Param('id') leadId: string) {
    return this.applicationService.submitLead(leadId)
  }

  @Get()
  async getAllLeads(
    @Query('status') status?: LeadStatus,
    @Query('financialInstitution') financialInstitution?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    return this.applicationService.getAllLeads({
      status,
      financialInstitution,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined
    })
  }
}