import { Resolver, Query, Args } from '@nestjs/graphql'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '../services/config.service'
import { 
  State, 
  Country, 
  IdentificationType, 
  Product, 
  DocumentConfig, 
  BankInfo 
} from './object-types'

@Resolver()
@Injectable()
export class ConfigResolver {
  constructor(private readonly configService: ConfigService) {}

  @Query(() => [State])
  async states(@Args('bankSlug', { nullable: true }) bankSlug?: string): Promise<State[]> {
    if (bankSlug) {
      const config = await this.configService.loadConfigWithFallback('states', bankSlug) as State[]
      return config || []
    }
    return this.configService.getStates() || []
  }

  @Query(() => [Country])
  async countries(@Args('bankSlug', { nullable: true }) bankSlug?: string): Promise<Country[]> {
    if (bankSlug) {
      const config = await this.configService.loadConfigWithFallback('countries', bankSlug) as Country[]
      return config || []
    }
    return this.configService.getCountries() || []
  }

  @Query(() => [IdentificationType])
  async identificationTypes(@Args('bankSlug', { nullable: true }) bankSlug?: string): Promise<IdentificationType[]> {
    if (bankSlug) {
      const config = await this.configService.loadConfigWithFallback('identification-types', bankSlug) as IdentificationType[]
      return config || []
    }
    return this.configService.getIdentificationTypes() || []
  }

  @Query(() => [Product])
  async products(@Args('bankSlug', { nullable: true }) bankSlug?: string): Promise<Product[]> {
    if (bankSlug) {
      const config = await this.configService.loadConfigWithFallback('products', bankSlug) as Product[]
      return config || []
    }
    return this.configService.getProducts() || []
  }

  @Query(() => DocumentConfig)
  async documentConfig(@Args('bankSlug', { nullable: true }) bankSlug?: string): Promise<DocumentConfig> {
    if (bankSlug) {
      const config = await this.configService.loadConfigWithFallback('documents', bankSlug) as DocumentConfig
      return config || { showAcceptAllButton: true, documents: [], rules: [] }
    }
    return this.configService.getDocuments() || { showAcceptAllButton: true, documents: [], rules: [] }
  }

  @Query(() => BankInfo, { nullable: true })
  async bankInfo(@Args('bankSlug', { nullable: true }) bankSlug?: string): Promise<BankInfo | null> {
    if (bankSlug) {
      const config = await this.configService.loadConfigWithFallback('bank-info', bankSlug) as BankInfo
      return config || null
    }
    return this.configService.getBankInfo() || null
  }
}