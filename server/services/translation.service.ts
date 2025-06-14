import { Injectable, Logger } from '@nestjs/common'
import { readFile, access } from 'fs/promises'
import * as path from 'path'

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name)
  private readonly TRANSLATIONS_BASE_PATH = path.join(process.cwd(), '..', 'translations')
  private readonly SUPPORTED_LANGUAGES = ['en', 'es']
  private readonly NAMESPACES = [
    'common',
    'navigation',
    'products',
    'customer-info',
    'identification',
    'documents',
    'confirmation',
    'validation',
    'bank-info'
  ]

  async checkHealth() {
    try {
      await access(this.TRANSLATIONS_BASE_PATH)
      return {
        status: 'healthy',
        languages: this.SUPPORTED_LANGUAGES,
        namespaces: this.NAMESPACES
      }
    } catch {
      return {
        status: 'unhealthy',
        error: 'Translations directory not accessible'
      }
    }
  }

  getManifest() {
    return {
      languages: this.SUPPORTED_LANGUAGES,
      namespaces: this.NAMESPACES,
      version: '1.0.0',
      lastModified: new Date().toISOString()
    }
  }

  async getAllTranslations(language: string) {
    if (!this.SUPPORTED_LANGUAGES.includes(language)) {
      throw new Error('Language not supported')
    }

    const translations: Record<string, Record<string, string>> = {}
    
    const loadPromises = this.NAMESPACES.map(async (namespace) => {
      try {
        const filePath = path.join(this.TRANSLATIONS_BASE_PATH, language, `${namespace}.json`)
        const content = await readFile(filePath, 'utf-8')
        translations[namespace] = JSON.parse(content)
      } catch (error) {
        this.logger.warn(`Failed to load ${namespace} for ${language}:`, error)
        translations[namespace] = {}
      }
    })

    await Promise.all(loadPromises)
    return translations
  }

  async getNamespaceTranslations(language: string, namespace: string) {
    if (!this.SUPPORTED_LANGUAGES.includes(language)) {
      throw new Error('Language not supported')
    }

    if (!this.NAMESPACES.includes(namespace)) {
      throw new Error('Namespace not found')
    }

    try {
      const filePath = path.join(this.TRANSLATIONS_BASE_PATH, language, `${namespace}.json`)
      
      await access(filePath)
      
      const content = await readFile(filePath, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      this.logger.error(`Error loading ${namespace} for ${language}:`, error)
      
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {}
      }
      
      throw error
    }
  }

  getSupportedLanguages() {
    return this.SUPPORTED_LANGUAGES
  }

  getNamespaces() {
    return this.NAMESPACES
  }
}