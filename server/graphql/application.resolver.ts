import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql'
import { Injectable } from '@nestjs/common'
import { ApplicationService } from '../services/application.service'
import { ApplicationResult, HealthStatus } from './object-types'
import { CreateApplicationInput } from './input-types'
import GraphQLJSON from 'graphql-type-json'

@Resolver()
@Injectable()
export class ApplicationResolver {
  constructor(private readonly applicationService: ApplicationService) {}

  @Query(() => GraphQLJSON, { nullable: true })
  async application(@Args('id', { type: () => ID }) id: string) {
    return await this.applicationService.getApplication(id)
  }

  @Mutation(() => ApplicationResult)
  async createApplication(@Args('input') input: CreateApplicationInput): Promise<ApplicationResult> {
    const applicationData = {
      selectedProducts: input.selectedProducts,
      customerInfo: input.customerInfo,
      identificationInfo: input.identificationInfo,
      documentAcceptance: input.documentAcceptance ? {
        acceptances: input.documentAcceptance.reduce((acc, item) => {
          acc[item.documentId] = {
            documentId: item.documentId,
            accepted: item.accepted,
            acceptedAt: item.accepted ? new Date().toISOString() : undefined
          }
          return acc
        }, {} as Record<string, any>),
        allAccepted: input.documentAcceptance.every(item => item.accepted)
      } : undefined
    }

    return await this.applicationService.createApplication(
      applicationData,
      input.userAgent,
      input.ipAddress
    )
  }

  @Query(() => HealthStatus)
  healthCheck(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date()
    }
  }
}