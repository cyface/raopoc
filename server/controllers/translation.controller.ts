import { Controller, Get, Param, HttpException, HttpStatus, Res } from '@nestjs/common'
import { Response } from 'express'
import { TranslationService } from '../services/translation.service'

@Controller('api/translations')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Get('health')
  async getHealth(@Res() res: Response) {
    const health = await this.translationService.checkHealth()
    
    if (health.status === 'unhealthy') {
      return res.status(503).json(health)
    }
    
    return res.json(health)
  }

  @Get('manifest')
  getManifest() {
    return this.translationService.getManifest()
  }

  @Get(':language')
  async getAllTranslations(@Param('language') language: string, @Res() res: Response) {
    try {
      const translations = await this.translationService.getAllTranslations(language)
      
      res.set({
        'Cache-Control': 'public, max-age=300',
        'ETag': `"${language}-${Date.now()}"`
      })
      
      return res.json(translations)
    } catch (error) {
      if (error instanceof Error && error.message === 'Language not supported') {
        throw new HttpException('Language not supported', HttpStatus.NOT_FOUND)
      }
      
      console.error(`Error loading translations for ${language}:`, error)
      throw new HttpException('Failed to load translations', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get(':language/:namespace')
  async getNamespaceTranslations(
    @Param('language') language: string,
    @Param('namespace') namespace: string,
    @Res() res: Response
  ) {
    try {
      const translations = await this.translationService.getNamespaceTranslations(language, namespace)
      
      res.set({
        'Cache-Control': 'public, max-age=300',
        'ETag': `"${language}-${namespace}-${Date.now()}"`
      })
      
      return res.json(translations)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Language not supported') {
          throw new HttpException('Language not supported', HttpStatus.NOT_FOUND)
        }
        if (error.message === 'Namespace not found') {
          throw new HttpException('Namespace not found', HttpStatus.NOT_FOUND)
        }
      }
      
      console.error(`Error loading ${namespace} for ${language}:`, error)
      throw new HttpException('Failed to load translations', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}