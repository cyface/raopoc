import { Router } from 'express'
import { readFile, access } from 'fs/promises'
import path from 'path'

const router = Router()

// Base path for translation files
const TRANSLATIONS_BASE_PATH = path.join(process.cwd(), 'translations')

// Supported languages - could be dynamic in the future
const SUPPORTED_LANGUAGES = ['en', 'es']

// Available namespaces
const NAMESPACES = [
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

/**
 * Health check for translation service
 * GET /api/translations/health
 */
router.get('/health', async (_req, res) => {
  try {
    // Check if translations directory exists
    await access(TRANSLATIONS_BASE_PATH)
    
    res.json({
      status: 'healthy',
      languages: SUPPORTED_LANGUAGES,
      namespaces: NAMESPACES
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Translations directory not accessible'
    })
  }
})

/**
 * Get translation manifest
 * GET /api/translations/manifest
 */
router.get('/manifest', async (_req, res) => {
  try {
    // In the future, this could check Redis or database
    // For now, return static configuration
    const manifest = {
      languages: SUPPORTED_LANGUAGES,
      namespaces: NAMESPACES,
      version: '1.0.0',
      lastModified: new Date().toISOString()
    }

    res.json(manifest)
  } catch (error) {
    console.error('Error fetching translation manifest:', error)
    res.status(500).json({ error: 'Failed to fetch manifest' })
  }
})

/**
 * Get all translations for a language
 * GET /api/translations/:language
 */
router.get('/:language', async (req, res) => {
  const { language } = req.params

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(404).json({ error: 'Language not supported' })
  }

  try {
    const translations: Record<string, any> = {}
    
    // Load all namespaces for this language
    const loadPromises = NAMESPACES.map(async (namespace) => {
      try {
        const filePath = path.join(TRANSLATIONS_BASE_PATH, language, `${namespace}.json`)
        const content = await readFile(filePath, 'utf-8')
        translations[namespace] = JSON.parse(content)
      } catch (error) {
        console.warn(`Failed to load ${namespace} for ${language}:`, error)
        translations[namespace] = {}
      }
    })

    await Promise.all(loadPromises)

    // Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'ETag': `"${language}-${Date.now()}"` // Simple ETag for now
    })

    res.json(translations)
  } catch (error) {
    console.error(`Error loading translations for ${language}:`, error)
    res.status(500).json({ error: 'Failed to load translations' })
  }
})

/**
 * Get specific namespace translations for a language
 * GET /api/translations/:language/:namespace
 */
router.get('/:language/:namespace', async (req, res) => {
  const { language, namespace } = req.params

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(404).json({ error: 'Language not supported' })
  }

  if (!NAMESPACES.includes(namespace)) {
    return res.status(404).json({ error: 'Namespace not found' })
  }

  try {
    const filePath = path.join(TRANSLATIONS_BASE_PATH, language, `${namespace}.json`)
    
    // Check if file exists
    await access(filePath)
    
    // Read and parse file
    const content = await readFile(filePath, 'utf-8')
    const translations = JSON.parse(content)

    // Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'ETag': `"${language}-${namespace}-${Date.now()}"` // Simple ETag
    })

    res.json(translations)
  } catch (error) {
    console.error(`Error loading ${namespace} for ${language}:`, error)
    
    // If file doesn't exist, return empty object
    if ((error as any).code === 'ENOENT') {
      return res.json({})
    }
    
    res.status(500).json({ error: 'Failed to load translations' })
  }
})


// Future enhancement: Redis-based translation loading
/*
async function loadFromRedis(language: string, namespace?: string) {
  // Example Redis implementation
  const redis = getRedisClient()
  
  if (namespace) {
    const key = `translations:${language}:${namespace}`
    return await redis.get(key)
  } else {
    // Load all namespaces
    const pattern = `translations:${language}:*`
    const keys = await redis.keys(pattern)
    const values = await redis.mget(keys)
    // Transform to object...
  }
}
*/

export default router