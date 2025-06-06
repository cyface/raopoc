import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Namespaces to split translations into
const NAMESPACES = {
  common: ['common'],
  navigation: ['navigation'],
  products: ['productSelection'],
  'customer-info': ['customerInfo'],
  identification: ['identificationInfo'],
  documents: ['documentAcceptance'],
  confirmation: ['confirmationScreen'],
  validation: ['validation'],
  'bank-info': ['bankInfo']
}

/**
 * Flatten nested object to dot notation keys
 */
function flattenObject(obj: any, prefix = '', result: Record<string, string> = {}): Record<string, string> {
  for (const key in obj) {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenObject(value, newKey, result)
    } else {
      result[newKey] = value
    }
  }
  
  return result
}

/**
 * Split flattened translations by namespace
 */
function splitByNamespace(flatTranslations: Record<string, string>): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {}
  
  // Initialize all namespaces
  Object.keys(NAMESPACES).forEach(ns => {
    result[ns] = {}
  })
  
  // Distribute keys to appropriate namespaces
  for (const [key, value] of Object.entries(flatTranslations)) {
    let assigned = false
    
    for (const [namespace, prefixes] of Object.entries(NAMESPACES)) {
      if (prefixes.some(prefix => key.startsWith(prefix + '.'))) {
        result[namespace][key] = value
        assigned = true
        break
      }
    }
    
    // If not assigned to any namespace, put in common
    if (!assigned) {
      console.warn(`Key "${key}" not assigned to any namespace, adding to common`)
      result.common[key] = value
    }
  }
  
  return result
}

/**
 * Main conversion function
 */
async function convertTranslations() {
  const languages = ['en', 'es']
  const srcDir = path.join(__dirname, '..', 'src', 'i18n', 'locales')
  const outputDir = path.join(__dirname, '..', 'translations')
  
  console.log('🔄 Converting translations from nested to flat structure...')
  
  for (const lang of languages) {
    console.log(`\n📝 Processing ${lang} translations...`)
    
    // Read source file
    const sourceFile = path.join(srcDir, `${lang}.json`)
    const sourceContent = await fs.readFile(sourceFile, 'utf-8')
    const sourceData = JSON.parse(sourceContent)
    
    // Flatten the translations
    const flatTranslations = flattenObject(sourceData)
    console.log(`  ✅ Flattened ${Object.keys(flatTranslations).length} keys`)
    
    // Split by namespace
    const splitTranslations = splitByNamespace(flatTranslations)
    
    // Create output directory
    const langDir = path.join(outputDir, lang)
    await fs.mkdir(langDir, { recursive: true })
    
    // Write each namespace file
    for (const [namespace, translations] of Object.entries(splitTranslations)) {
      const outputFile = path.join(langDir, `${namespace}.json`)
      
      if (Object.keys(translations).length > 0) {
        await fs.writeFile(outputFile, JSON.stringify(translations, null, 2))
        console.log(`  ✅ Created ${namespace}.json with ${Object.keys(translations).length} keys`)
      } else {
        console.log(`  ⏭️  Skipped ${namespace}.json (no keys)`)
      }
    }
  }
  
  // Create a manifest file
  const manifest = {
    languages: languages,
    namespaces: Object.keys(NAMESPACES),
    version: '1.0.0',
    lastModified: new Date().toISOString()
  }
  
  await fs.writeFile(
    path.join(outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  )
  
  console.log('\n✅ Translation conversion complete!')
  console.log(`📁 Output directory: ${outputDir}`)
}

// Run the conversion
convertTranslations().catch(console.error)