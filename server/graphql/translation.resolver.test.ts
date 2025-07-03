import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { TranslationResolver } from './translation.resolver'

describe('TranslationResolver', () => {
  let resolver: TranslationResolver
  let mockTranslationService: any

  beforeEach(() => {
    mockTranslationService = {
      getManifest: vi.fn(),
      getNamespaceTranslations: vi.fn(),
      getAllTranslations: vi.fn(),
      checkHealth: vi.fn()
    }

    resolver = new TranslationResolver(mockTranslationService)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('translationManifest query', () => {
    it('should return translation manifest', async () => {
      // Arrange
      const mockManifest = {
        languages: ['en', 'es'],
        namespaces: ['common', 'navigation', 'products'],
        version: '1.0.0',
        lastModified: '2023-01-01T00:00:00Z'
      }

      mockTranslationService.getManifest.mockReturnValue(mockManifest)

      // Act
      const result = await resolver.translationManifest()

      // Assert
      expect(mockTranslationService.getManifest).toHaveBeenCalledWith()
      expect(result).toEqual(mockManifest)
    })
  })

  describe('translations query', () => {
    it('should return specific namespace translations', async () => {
      // Arrange
      const mockTranslations = {
        'welcome': 'Welcome',
        'goodbye': 'Goodbye',
        'hello': 'Hello'
      }

      mockTranslationService.getNamespaceTranslations.mockResolvedValue(mockTranslations)

      // Act
      const result = await resolver.translations('en', 'common')

      // Assert
      expect(mockTranslationService.getNamespaceTranslations).toHaveBeenCalledWith('en', 'common')
      expect(result).toEqual(mockTranslations)
    })

    it('should return all translations when no namespace specified', async () => {
      // Arrange
      const mockAllTranslations = {
        common: {
          'welcome': 'Welcome',
          'goodbye': 'Goodbye'
        },
        navigation: {
          'home': 'Home',
          'about': 'About'
        }
      }

      mockTranslationService.getAllTranslations.mockResolvedValue(mockAllTranslations)

      // Act
      const result = await resolver.translations('en')

      // Assert
      expect(mockTranslationService.getAllTranslations).toHaveBeenCalledWith('en')
      expect(result).toEqual(mockAllTranslations)
    })

    it('should handle Spanish translations', async () => {
      // Arrange
      const mockSpanishTranslations = {
        'welcome': 'Bienvenido',
        'goodbye': 'Adiós',
        'hello': 'Hola'
      }

      mockTranslationService.getNamespaceTranslations.mockResolvedValue(mockSpanishTranslations)

      // Act
      const result = await resolver.translations('es', 'common')

      // Assert
      expect(mockTranslationService.getNamespaceTranslations).toHaveBeenCalledWith('es', 'common')
      expect(result).toEqual(mockSpanishTranslations)
    })

    it('should handle empty translations', async () => {
      // Arrange
      mockTranslationService.getNamespaceTranslations.mockResolvedValue({})

      // Act
      const result = await resolver.translations('en', 'nonexistent')

      // Assert
      expect(mockTranslationService.getNamespaceTranslations).toHaveBeenCalledWith('en', 'nonexistent')
      expect(result).toEqual({})
    })
  })

  describe('translationHealth query', () => {
    it('should return healthy status', async () => {
      // Arrange
      const mockHealth = {
        status: 'healthy',
        languages: ['en', 'es'],
        namespaces: ['common', 'navigation']
      }

      mockTranslationService.checkHealth.mockResolvedValue(mockHealth)

      // Act
      const result = await resolver.translationHealth()

      // Assert
      expect(mockTranslationService.checkHealth).toHaveBeenCalledWith()
      expect(result.status).toBe('ok')
      expect(result.timestamp).toBeInstanceOf(Date)
    })

    it('should return unhealthy status', async () => {
      // Arrange
      const mockHealth = {
        status: 'unhealthy',
        error: 'Translations directory not accessible'
      }

      mockTranslationService.checkHealth.mockResolvedValue(mockHealth)

      // Act
      const result = await resolver.translationHealth()

      // Assert
      expect(mockTranslationService.checkHealth).toHaveBeenCalledWith()
      expect(result.status).toBe('error')
      expect(result.timestamp).toBeInstanceOf(Date)
    })
  })
})