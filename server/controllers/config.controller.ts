import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '../services/config.service'
import { 
  State, 
  Country, 
  IdentificationType, 
  Product, 
  DocumentConfig, 
  BankInfo 
} from '../types/config.types'

@Controller('api/config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('states')
  getStates(): State[] {
    const states = this.configService.getStates()
    if (!states) {
      throw new HttpException('States configuration not loaded', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return states
  }

  @Get('countries')
  getCountries(): Country[] {
    const countries = this.configService.getCountries()
    if (!countries) {
      throw new HttpException('Countries configuration not loaded', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return countries
  }

  @Get('identification-types')
  getIdentificationTypes(): IdentificationType[] {
    const identificationTypes = this.configService.getIdentificationTypes()
    if (!identificationTypes) {
      throw new HttpException('Identification types configuration not loaded', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return identificationTypes
  }

  @Get('products')
  getProducts(): Product[] {
    const products = this.configService.getProducts()
    if (!products) {
      throw new HttpException('Products configuration not loaded', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return products
  }

  @Get('documents')
  getDocuments(): DocumentConfig {
    const documents = this.configService.getDocuments()
    if (!documents) {
      throw new HttpException('Documents configuration not loaded', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return documents
  }

  @Get('bank-info')
  getBankInfo(): BankInfo {
    const bankInfo = this.configService.getBankInfo()
    if (!bankInfo) {
      throw new HttpException('Bank info configuration not loaded', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return bankInfo
  }

  // Bank-specific config endpoints
  @Get(':bankSlug/:configName')
  async getBankSpecificConfig(@Param('bankSlug') bankSlug: string, @Param('configName') configName: string) {
    try {
      const config = await this.configService.loadConfigWithFallback(configName, bankSlug)
      return config
    } catch (error) {
      console.error(`Error loading bank-specific ${configName} config:`, error)
      throw new HttpException(`Failed to load ${configName} configuration`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  // Legacy bank-specific routes (for backward compatibility)
  @Get(':bankSlug/states')
  async getBankSpecificStates(@Param('bankSlug') bankSlug: string) {
    try {
      const config = await this.configService.loadConfigWithFallback('states.json', bankSlug)
      return config
    } catch (error) {
      console.error('Error loading bank-specific states config:', error)
      throw new HttpException('Failed to load states configuration', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get(':bankSlug/countries')
  async getBankSpecificCountries(@Param('bankSlug') bankSlug: string) {
    try {
      const config = await this.configService.loadConfigWithFallback('countries', bankSlug)
      return config
    } catch (error) {
      console.error('Error loading bank-specific countries config:', error)
      throw new HttpException('Failed to load countries configuration', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get(':bankSlug/identification-types')
  async getBankSpecificIdentificationTypes(@Param('bankSlug') bankSlug: string) {
    try {
      const config = await this.configService.loadConfigWithFallback('identification-types', bankSlug)
      return config
    } catch (error) {
      console.error('Error loading bank-specific identification-types config:', error)
      throw new HttpException('Failed to load identification-types configuration', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get(':bankSlug/products')
  async getBankSpecificProducts(@Param('bankSlug') bankSlug: string) {
    try {
      const config = await this.configService.loadConfigWithFallback('products', bankSlug)
      return config
    } catch (error) {
      console.error('Error loading bank-specific products config:', error)
      throw new HttpException('Failed to load products configuration', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get(':bankSlug/documents')
  async getBankSpecificDocuments(@Param('bankSlug') bankSlug: string) {
    try {
      const config = await this.configService.loadConfigWithFallback('documents', bankSlug)
      return config
    } catch (error) {
      console.error('Error loading bank-specific documents config:', error)
      throw new HttpException('Failed to load documents configuration', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get(':bankSlug/bank-info')
  async getBankSpecificBankInfo(@Param('bankSlug') bankSlug: string) {
    try {
      const config = await this.configService.loadConfigWithFallback('bank-info', bankSlug)
      return config
    } catch (error) {
      console.error('Error loading bank-specific bank-info config:', error)
      throw new HttpException('Failed to load bank-info configuration', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  // Default config endpoints with localization support
  @Get(':configName')
  async getConfig(@Param('configName') configName: string) {
    try {
      const config = await this.configService.loadConfigWithFallback(configName)
      return config
    } catch (error) {
      console.error(`Error loading ${configName} config:`, error)
      throw new HttpException(`Failed to load ${configName} configuration`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}