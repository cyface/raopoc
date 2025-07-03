import { Resolver, Query, Args } from '@nestjs/graphql'
import { Injectable } from '@nestjs/common'
import { TranslationService } from '../services/translation.service'
import { TranslationManifest, HealthStatus } from './object-types'
import GraphQLJSON from 'graphql-type-json'

@Resolver()
@Injectable()
export class TranslationResolver {
  constructor(private readonly translationService: TranslationService) {}

  @Query(() => TranslationManifest)
  async translationManifest(): Promise<TranslationManifest> {
    return await this.translationService.getManifest()
  }

  @Query(() => GraphQLJSON)
  async translations(
    @Args('language') language: string,
    @Args('namespace', { nullable: true }) namespace?: string
  ) {
    if (namespace) {
      return await this.translationService.getNamespaceTranslations(language, namespace)
    }
    return await this.translationService.getAllTranslations(language)
  }

  @Query(() => HealthStatus)
  async translationHealth(): Promise<HealthStatus> {
    const health = await this.translationService.checkHealth()
    return {
      status: health.status === 'healthy' ? 'ok' : 'error',
      timestamp: new Date()
    }
  }
}