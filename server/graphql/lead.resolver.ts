import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql'
import { Injectable } from '@nestjs/common'
import { ApplicationService } from '../services/application.service'
import { ConfigService } from '../services/config.service'
import { Lead, CreditCheckResult, Product } from './object-types'
import { 
  CreateLeadInput, 
  UpdateLeadStepInput,
  UpdateLeadCreditCheckInput,
  UpdateLeadDocumentsInput,
  CreditCheckInput,
  LeadFilterInput
} from './input-types'

@Resolver(() => Lead)
@Injectable()
export class LeadResolver {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly configService: ConfigService
  ) {}

  @Query(() => Lead, { nullable: true })
  async lead(@Args('id', { type: () => ID }) id: string): Promise<Lead | null> {
    const lead = await this.applicationService.getLeadById(id)
    if (!lead) return null

    // Transform the lead data to match GraphQL schema
    return this.transformLead(lead)
  }

  @Query(() => Lead, { nullable: true })
  async leadBySessionId(@Args('sessionId') sessionId: string): Promise<Lead | null> {
    const lead = await this.applicationService.getLeadBySessionId(sessionId)
    if (!lead) return null

    return this.transformLead(lead)
  }

  @Query(() => [Lead])
  async leads(@Args('filter', { nullable: true }) filter?: LeadFilterInput): Promise<Lead[]> {
    const leads = await this.applicationService.getAllLeads({
      status: filter?.status,
      financialInstitution: filter?.financialInstitution,
      limit: filter?.limit,
      offset: filter?.offset
    })

    return leads.map(lead => this.transformLead(lead))
  }

  @Mutation(() => Lead)
  async createOrUpdateLead(@Args('input') input: CreateLeadInput): Promise<Lead> {
    const lead = await this.applicationService.createOrUpdateLead({
      sessionId: input.sessionId,
      selectedProducts: input.selectedProducts,
      customerInfo: input.customerInfo,
      identificationInfo: input.identificationInfo,
      currentStep: input.currentStep,
      completedSteps: input.completedSteps,
      financialInstitution: input.financialInstitution,
      language: input.language,
      theme: input.theme,
      devStep: input.devStep,
      mockScenario: input.mockScenario,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress
    })

    return this.transformLead(lead)
  }

  @Mutation(() => Lead)
  async updateLeadStep(@Args('input') input: UpdateLeadStepInput): Promise<Lead> {
    const stepData = input.stepData ? JSON.parse(input.stepData) : undefined
    
    const lead = await this.applicationService.updateLeadStep(input.leadId, {
      currentStep: input.currentStep,
      completedSteps: input.completedSteps,
      stepData
    })

    return this.transformLead(lead)
  }

  @Mutation(() => Lead)
  async updateLeadCreditCheck(@Args('input') input: UpdateLeadCreditCheckInput): Promise<Lead> {
    const lead = await this.applicationService.updateLeadCreditCheck(input.leadId, {
      status: input.status,
      requiresVerification: input.requiresVerification,
      message: input.message
    })

    return this.transformLead(lead)
  }

  @Mutation(() => [String])
  async updateLeadDocuments(@Args('input') input: UpdateLeadDocumentsInput): Promise<string[]> {
    await this.applicationService.updateLeadDocumentAcceptances(
      input.leadId,
      input.acceptances.map(acc => ({
        documentId: acc.documentId,
        accepted: acc.accepted
      }))
    )

    return input.acceptances.map(acc => acc.documentId)
  }

  @Mutation(() => Lead)
  async submitLead(@Args('leadId', { type: () => ID }) leadId: string): Promise<Lead> {
    const lead = await this.applicationService.submitLead(leadId)
    return this.transformLead(lead)
  }

  @Mutation(() => CreditCheckResult)
  async performCreditCheck(@Args('input') input: CreditCheckInput): Promise<CreditCheckResult> {
    return await this.applicationService.performCreditCheck(input.ssn)
  }

  @ResolveField(() => [Product])
  async products(@Parent() lead: Lead): Promise<Product[]> {
    // Get products based on the lead's financial institution for multi-tenant support
    let allProducts: Product[]
    
    try {
      // Try to get bank-specific products first
      allProducts = await this.configService.loadConfigWithFallback('products', lead.financialInstitution) as Product[]
    } catch (error) {
      // Fallback to default products if bank-specific config fails
      allProducts = this.configService.getProducts() || []
    }
    
    // Filter products to only include those selected by the lead
    // Convert enum values to lowercase strings to match product.type format
    const selectedProductStrings = lead.selectedProducts.map((productType: any) => String(productType).toLowerCase())
    return allProducts.filter(product => 
      selectedProductStrings.includes(product.type)
    )
  }

  private transformLead(lead: any): Lead {
    // Get latest customer info and identification info from versioned histories
    const customerInfoHistory = lead.customerInfoHistory as any[] || []
    const identificationInfoHistory = lead.identificationInfoHistory as any[] || []
    
    const latestCustomerInfo = this.applicationService.getLatestCustomerInfo(customerInfoHistory)
    const latestIdentificationInfo = this.applicationService.getLatestIdentificationInfo(identificationInfoHistory)

    return {
      ...lead,
      customerInfo: latestCustomerInfo?.data || null,
      identificationInfo: latestIdentificationInfo?.data || null,
      documentAcceptances: lead.documentAcceptances || []
    }
  }
}