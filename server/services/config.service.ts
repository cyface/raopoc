import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as chokidar from 'chokidar'
import { 
  State, 
  Country, 
  IdentificationType, 
  Product, 
  DocumentConfig, 
  BankInfo, 
  BadSSNConfig, 
  ConfigCache 
} from '../types/config.types'

// Use process.cwd() for CommonJS compatibility

@Injectable()
export class ConfigService implements OnModuleInit {
  private readonly logger = new Logger(ConfigService.name)
  private configCache: ConfigCache = {}

  async onModuleInit() {
    await this.loadAllConfigs()
    
    if (process.env.NODE_ENV !== 'production') {
      this.watchConfigFiles()
    }
  }

  private async loadConfigFile(filename: string) {
    try {
      const filePath = path.join(process.cwd(), '..', 'config', filename)
      const data = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      this.logger.error(`Error loading config file ${filename}:`, error)
      throw error
    }
  }

  private async loadAllConfigs() {
    try {
      this.configCache.states = await this.loadConfigFile('states.json')
      this.configCache.countries = await this.loadConfigFile('countries.json')
      this.configCache.identificationTypes = await this.loadConfigFile('identification-types.json')
      this.configCache.products = await this.loadConfigFile('products.json')
      this.configCache.documents = await this.loadConfigFile('documents.json')
      this.configCache.bankInfo = await this.loadConfigFile('bank-info.json')
      this.configCache.badSSNs = await this.loadConfigFile('bad-ssns.json')
      this.logger.log('All config files loaded successfully')
    } catch (error) {
      this.logger.error('Error loading config files:', error)
      this.logger.error('Server will continue without config files loaded')
    }
  }

  private watchConfigFiles() {
    const configPath = path.join(process.cwd(), '..', 'config')
    const watcher = chokidar.watch(configPath, {
      persistent: true,
      ignoreInitial: true
    })

    watcher.on('change', async (filePath) => {
      const filename = path.basename(filePath)
      this.logger.log(`Config file ${filename} changed, reloading...`)
      
      try {
        if (filename === 'states.json') {
          this.configCache.states = await this.loadConfigFile(filename)
        } else if (filename === 'countries.json') {
          this.configCache.countries = await this.loadConfigFile(filename)
        } else if (filename === 'identification-types.json') {
          this.configCache.identificationTypes = await this.loadConfigFile(filename)
        } else if (filename === 'products.json') {
          this.configCache.products = await this.loadConfigFile(filename)
        } else if (filename === 'documents.json') {
          this.configCache.documents = await this.loadConfigFile(filename)
        } else if (filename === 'bank-info.json') {
          this.configCache.bankInfo = await this.loadConfigFile(filename)
        } else if (filename === 'bad-ssns.json') {
          this.configCache.badSSNs = await this.loadConfigFile(filename)
        }
        this.logger.log(`Successfully reloaded ${filename}`)
      } catch (error) {
        this.logger.error(`Error reloading ${filename}:`, error)
      }
    })
  }

  async loadConfigWithFallback(configName: string, bankSlug?: string): Promise<unknown> {
    const configDir = path.join(process.cwd(), '..', 'config')
    
    const configFileName = configName.endsWith('.json') ? configName : `${configName}.json`
    
    const isLanguageSpecific = configFileName.includes('.es.json')
    const baseConfigName = isLanguageSpecific ? configFileName.replace('.es.json', '.json') : configFileName
    
    if (bankSlug) {
      const bankConfigDir = path.join(configDir, bankSlug)
      
      const bankSpecificPath = path.join(bankConfigDir, configFileName)
      try {
        await fs.access(bankSpecificPath)
        const content = await fs.readFile(bankSpecificPath, 'utf-8')
        return JSON.parse(content)
      } catch {
        // Bank-specific localized config not found
      }
      
      if (isLanguageSpecific) {
        const bankSpecificEnglishPath = path.join(bankConfigDir, baseConfigName)
        try {
          await fs.access(bankSpecificEnglishPath)
          const content = await fs.readFile(bankSpecificEnglishPath, 'utf-8')
          this.logger.warn(`Bank-specific localized config ${configFileName} not found for ${bankSlug}, using English version`)
          return JSON.parse(content)
        } catch {
          // Bank-specific English config not found either
        }
      }
    }
    
    const defaultPath = path.join(configDir, configFileName)
    try {
      await fs.access(defaultPath)
      const content = await fs.readFile(defaultPath, 'utf-8')
      return JSON.parse(content)
    } catch {
      // Default localized version not found
    }
    
    if (isLanguageSpecific) {
      const basePath = path.join(configDir, baseConfigName)
      try {
        await fs.access(basePath)
        const content = await fs.readFile(basePath, 'utf-8')
        this.logger.warn(`Localized config ${configFileName} not found, falling back to English version`)
        return JSON.parse(content)
      } catch {
        throw new Error(`Neither localized config ${configFileName} nor English config ${baseConfigName} found`)
      }
    }
    
    throw new Error(`Config file ${configFileName} not found`)
  }

  getStates(): State[] | undefined {
    return this.configCache.states
  }

  getCountries(): Country[] | undefined {
    return this.configCache.countries
  }

  getIdentificationTypes(): IdentificationType[] | undefined {
    return this.configCache.identificationTypes
  }

  getProducts(): Product[] | undefined {
    return this.configCache.products
  }

  getDocuments(): DocumentConfig | undefined {
    return this.configCache.documents
  }

  getBankInfo(): BankInfo | undefined {
    return this.configCache.bankInfo
  }

  getBadSSNs(): BadSSNConfig | undefined {
    return this.configCache.badSSNs
  }
}