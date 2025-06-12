import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import chokidar from 'chokidar'
import { randomUUID } from 'crypto'
import translationsRouter from './routes/translations.js'
import { encryptSensitiveFields, decryptSensitiveFields } from './utils/encryption.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = Number(process.env.PORT) || 3000

// Enable CORS for development
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://app.localhost',
    'http://localhost:3000', // For testing
    'https://api.localhost'   // For testing
  ],
  credentials: true
}))
app.use(express.json())

// Cache for config files
interface State {
  code: string
  name: string
}

interface Country {
  code: string
  name: string
}

interface IdentificationType {
  value: string
  label: string
  requiresState: boolean
}

interface Product {
  type: string
  title: string
  description: string
  icon: string
}

interface Document {
  id: string
  name: string
  description?: string
  url: string
  required: boolean
  category: string
}

interface DocumentRule {
  productTypes?: string[]
  hasSSN?: boolean
  noSSN?: boolean
  documentIds: string[]
}

interface DocumentConfig {
  showAcceptAllButton: boolean
  documents: Document[]
  rules: DocumentRule[]
}

interface BankInfo {
  bankName: string
  displayName: string
  contact: {
    phone: string
    phoneDisplay: string
    email: string
    hours: string
  }
  branding: {
    primaryColor: string
    logoIcon: string
  }
}

interface BadSSNConfig {
  badSSNs: string[]
  description: string
}

interface ConfigCache {
  states?: State[]
  countries?: Country[]
  identificationTypes?: IdentificationType[]
  products?: Product[]
  documents?: DocumentConfig
  bankInfo?: BankInfo
  badSSNs?: BadSSNConfig
}

const configCache: ConfigCache = {}

// Function to load config file
async function loadConfigFile(filename: string) {
  try {
    const filePath = path.join(__dirname, '..', 'config', filename)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error loading config file ${filename}:`, error)
    throw error
  }
}

// Load all config files on startup
async function loadAllConfigs() {
  try {
    configCache.states = await loadConfigFile('states.json')
    configCache.countries = await loadConfigFile('countries.json')
    configCache.identificationTypes = await loadConfigFile('identification-types.json')
    configCache.products = await loadConfigFile('products.json')
    configCache.documents = await loadConfigFile('documents.json')
    configCache.bankInfo = await loadConfigFile('bank-info.json')
    configCache.badSSNs = await loadConfigFile('bad-ssns.json')
    console.log('All config files loaded successfully')
  } catch (error) {
    console.error('Error loading config files:', error)
  }
}

// Watch for config file changes in development
if (process.env.NODE_ENV !== 'production') {
  const configPath = path.join(__dirname, '..', 'config')
  const watcher = chokidar.watch(configPath, {
    persistent: true,
    ignoreInitial: true
  })

  watcher.on('change', async (filePath) => {
    const filename = path.basename(filePath)
    console.log(`Config file ${filename} changed, reloading...`)
    
    try {
      if (filename === 'states.json') {
        configCache.states = await loadConfigFile(filename)
      } else if (filename === 'countries.json') {
        configCache.countries = await loadConfigFile(filename)
      } else if (filename === 'identification-types.json') {
        configCache.identificationTypes = await loadConfigFile(filename)
      } else if (filename === 'products.json') {
        configCache.products = await loadConfigFile(filename)
      } else if (filename === 'documents.json') {
        configCache.documents = await loadConfigFile(filename)
      } else if (filename === 'bank-info.json') {
        configCache.bankInfo = await loadConfigFile(filename)
      } else if (filename === 'bad-ssns.json') {
        configCache.badSSNs = await loadConfigFile(filename)
      }
      console.log(`Successfully reloaded ${filename}`)
    } catch (error) {
      console.error(`Error reloading ${filename}:`, error)
    }
  })
}

// Helper function to load config with bank-specific and language-specific fallback
async function loadConfigWithFallback(configName: string, bankSlug?: string): Promise<unknown> {
  const configDir = path.join(__dirname, '..', 'config')
  
  // Ensure configName has .json extension if it doesn't already
  const configFileName = configName.endsWith('.json') ? configName : `${configName}.json`
  
  // Determine if this is a language-specific request
  const isLanguageSpecific = configFileName.includes('.es.json')
  const baseConfigName = isLanguageSpecific ? configFileName.replace('.es.json', '.json') : configFileName
  
  // Try bank-specific config first if bank slug is provided
  if (bankSlug) {
    const bankConfigDir = path.join(configDir, bankSlug)
    
    // Try bank-specific localized version first
    const bankSpecificPath = path.join(bankConfigDir, configFileName)
    try {
      await fs.access(bankSpecificPath)
      const content = await fs.readFile(bankSpecificPath, 'utf-8')
      return JSON.parse(content)
    } catch {
      // Bank-specific localized config not found
    }
    
    // If language-specific version not found, try bank-specific English version
    if (isLanguageSpecific) {
      const bankSpecificEnglishPath = path.join(bankConfigDir, baseConfigName)
      try {
        await fs.access(bankSpecificEnglishPath)
        const content = await fs.readFile(bankSpecificEnglishPath, 'utf-8')
        console.log(`Warning: Bank-specific localized config ${configFileName} not found for ${bankSlug}, using English version`)
        return JSON.parse(content)
      } catch {
        // Bank-specific English config not found either
      }
    }
  }
  
  // Try default localized version
  const defaultPath = path.join(configDir, configFileName)
  try {
    await fs.access(defaultPath)
    const content = await fs.readFile(defaultPath, 'utf-8')
    return JSON.parse(content)
  } catch {
    // Default localized version not found
  }
  
  // If language-specific version not found, try default English version
  if (isLanguageSpecific) {
    const basePath = path.join(configDir, baseConfigName)
    try {
      await fs.access(basePath)
      const content = await fs.readFile(basePath, 'utf-8')
      console.log(`Warning: Localized config ${configFileName} not found, falling back to English version`)
      return JSON.parse(content)
    } catch {
      throw new Error(`Neither localized config ${configFileName} nor English config ${baseConfigName} found`)
    }
  }
  
  throw new Error(`Config file ${configFileName} not found`)
}

// API Routes
app.get('/api/config/states', (_req, res) => {
  if (!configCache.states) {
    return res.status(500).json({ error: 'States configuration not loaded' })
  }
  res.json(configCache.states)
})

// Bank-specific config endpoints
app.get('/api/config/:bankSlug/:configName', async (req, res) => {
  try {
    const { bankSlug, configName } = req.params
    const config = await loadConfigWithFallback(configName, bankSlug)
    res.json(config)
  } catch (error) {
    console.error(`Error loading bank-specific ${req.params.configName} config:`, error)
    res.status(500).json({ error: `Failed to load ${req.params.configName} configuration` })
  }
})

// Legacy bank-specific routes (keep for backward compatibility)
app.get('/api/config/:bankSlug/states', async (req, res) => {
  try {
    const config = await loadConfigWithFallback('states.json', req.params.bankSlug)
    res.json(config)
  } catch (error) {
    console.error('Error loading bank-specific states config:', error)
    res.status(500).json({ error: 'Failed to load states configuration' })
  }
})

app.get('/api/config/:bankSlug/countries', async (req, res) => {
  try {
    const config = await loadConfigWithFallback('countries', req.params.bankSlug)
    res.json(config)
  } catch (error) {
    console.error('Error loading bank-specific countries config:', error)
    res.status(500).json({ error: 'Failed to load countries configuration' })
  }
})

app.get('/api/config/:bankSlug/identification-types', async (req, res) => {
  try {
    const config = await loadConfigWithFallback('identification-types', req.params.bankSlug)
    res.json(config)
  } catch (error) {
    console.error('Error loading bank-specific identification-types config:', error)
    res.status(500).json({ error: 'Failed to load identification-types configuration' })
  }
})

app.get('/api/config/:bankSlug/products', async (req, res) => {
  try {
    const config = await loadConfigWithFallback('products', req.params.bankSlug)
    res.json(config)
  } catch (error) {
    console.error('Error loading bank-specific products config:', error)
    res.status(500).json({ error: 'Failed to load products configuration' })
  }
})

app.get('/api/config/:bankSlug/documents', async (req, res) => {
  try {
    const config = await loadConfigWithFallback('documents', req.params.bankSlug)
    res.json(config)
  } catch (error) {
    console.error('Error loading bank-specific documents config:', error)
    res.status(500).json({ error: 'Failed to load documents configuration' })
  }
})

app.get('/api/config/:bankSlug/bank-info', async (req, res) => {
  try {
    const config = await loadConfigWithFallback('bank-info', req.params.bankSlug)
    res.json(config)
  } catch (error) {
    console.error('Error loading bank-specific bank-info config:', error)
    res.status(500).json({ error: 'Failed to load bank-info configuration' })
  }
})

// Default config endpoints with localization support
app.get('/api/config/:configName', async (req, res) => {
  try {
    const { configName } = req.params
    const config = await loadConfigWithFallback(configName)
    res.json(config)
  } catch (error) {
    console.error(`Error loading ${req.params.configName} config:`, error)
    res.status(500).json({ error: `Failed to load ${req.params.configName} configuration` })
  }
})

// Legacy default config endpoints (kept for backward compatibility)
app.get('/api/config/countries', (_req, res) => {
  if (!configCache.countries) {
    return res.status(500).json({ error: 'Countries configuration not loaded' })
  }
  res.json(configCache.countries)
})

app.get('/api/config/identification-types', (_req, res) => {
  if (!configCache.identificationTypes) {
    return res.status(500).json({ error: 'Identification types configuration not loaded' })
  }
  res.json(configCache.identificationTypes)
})

app.get('/api/config/products', (_req, res) => {
  if (!configCache.products) {
    return res.status(500).json({ error: 'Products configuration not loaded' })
  }
  res.json(configCache.products)
})

app.get('/api/config/documents', (_req, res) => {
  if (!configCache.documents) {
    return res.status(500).json({ error: 'Documents configuration not loaded' })
  }
  res.json(configCache.documents)
})

app.get('/api/config/bank-info', (_req, res) => {
  if (!configCache.bankInfo) {
    return res.status(500).json({ error: 'Bank info configuration not loaded' })
  }
  res.json(configCache.bankInfo)
})

// Document endpoints
app.get('/api/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params
    const documentsConfig = configCache.documents
    
    if (!documentsConfig) {
      return res.status(500).json({ error: 'Documents configuration not loaded' })
    }
    
    const document = documentsConfig.documents.find((doc: { id: string; name: string }) => doc.id === documentId)
    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    // Serve the actual generated PDF file
    const pdfPath = path.join(__dirname, '..', 'public', 'documents', `${documentId}.pdf`)
    
    try {
      await fs.access(pdfPath)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="${document.name}.pdf"`)
      const pdfBuffer = await fs.readFile(pdfPath)
      res.send(pdfBuffer)
    } catch (error) {
      console.error(`Error serving document ${documentId}:`, error)
      res.status(404).json({ error: 'Document file not found' })
    }
  } catch (error) {
    console.error('Error serving document:', error)
    res.status(500).json({ error: 'Failed to serve document' })
  }
})

app.get('/api/documents/:documentId/download', async (req, res) => {
  try {
    const { documentId } = req.params
    const documentsConfig = configCache.documents
    
    if (!documentsConfig) {
      return res.status(500).json({ error: 'Documents configuration not loaded' })
    }
    
    const document = documentsConfig.documents.find((doc: { id: string; name: string }) => doc.id === documentId)
    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    // Serve the actual generated PDF file for download
    const pdfPath = path.join(__dirname, '..', 'public', 'documents', `${documentId}.pdf`)
    
    try {
      await fs.access(pdfPath)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${document.name}.pdf"`)
      const pdfBuffer = await fs.readFile(pdfPath)
      res.send(pdfBuffer)
    } catch (error) {
      console.error(`Error downloading document ${documentId}:`, error)
      res.status(404).json({ error: 'Document file not found' })
    }
  } catch (error) {
    console.error('Error downloading document:', error)
    res.status(500).json({ error: 'Failed to download document' })
  }
})

// Application submission endpoint
app.post('/api/applications', async (req, res) => {
  try {
    const applicationData = req.body
    
    // Generate unique application ID
    const applicationId = randomUUID()
    
    // Extract last name for filename
    const lastName = applicationData.customerInfo?.lastName || 'Unknown'
    const sanitizedLastName = lastName.replace(/[^a-zA-Z0-9]/g, '')
    const filename = `${applicationId}-${sanitizedLastName}.json`
    
    // Encrypt sensitive fields in the application data
    const encryptedData = await encryptSensitiveFields(applicationData)
    
    // Create application record with metadata
    const application = {
      id: applicationId,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      data: encryptedData,
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.socket.remoteAddress,
        submissionSource: 'web-onboarding'
      }
    }
    
    // Ensure applications directory exists
    const applicationsDir = path.join(__dirname, '..', 'applications')
    await fs.mkdir(applicationsDir, { recursive: true })
    
    // Save application to file
    const filePath = path.join(applicationsDir, filename)
    await fs.writeFile(filePath, JSON.stringify(application, null, 2))
    
    console.log(`✅ Application saved: ${filename}`)
    console.log(`📧 Mock confirmation email sent to: ${applicationData.customerInfo?.email}`)
    
    res.status(201).json({
      applicationId,
      status: 'submitted',
      message: 'Application submitted successfully',
      filename
    })
    
  } catch (error) {
    console.error('Error saving application:', error)
    res.status(500).json({ 
      error: 'Failed to save application',
      message: 'Please try again later'
    })
  }
})

// Get application by ID endpoint
app.get('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params
    const applicationsDir = path.join(__dirname, '..', 'applications')
    
    // Find file that starts with the application ID
    const files = await fs.readdir(applicationsDir)
    const applicationFile = files.find(file => file.startsWith(id))
    
    if (!applicationFile) {
      return res.status(404).json({ error: 'Application not found' })
    }
    
    const filePath = path.join(applicationsDir, applicationFile)
    const applicationData = await fs.readFile(filePath, 'utf-8')
    const application = JSON.parse(applicationData)
    
    // Decrypt sensitive fields before sending
    if (application.data) {
      application.data = await decryptSensitiveFields(application.data)
    }
    
    res.json(application)
    
  } catch (error) {
    console.error('Error retrieving application:', error)
    res.status(500).json({ error: 'Failed to retrieve application' })
  }
})

// Credit check endpoint
app.post('/api/credit-check', async (req, res) => {
  try {
    const { ssn } = req.body

    if (!ssn) {
      return res.status(400).json({ error: 'SSN is required' })
    }

    if (!configCache.badSSNs) {
      return res.status(500).json({ error: 'Credit check service unavailable' })
    }

    // Normalize SSN format (remove dashes for comparison)
    const normalizedSSN = ssn.replace(/[^0-9]/g, '')
    const badSSNs = configCache.badSSNs.badSSNs.map(badSSN => badSSN.replace(/[^0-9]/g, ''))

    const isOnBadList = badSSNs.includes(normalizedSSN)

    console.log(`🔍 Credit check performed for SSN: ${ssn.substring(0, 3)}-XX-XXXX`)
    console.log(`📊 Credit check result: ${isOnBadList ? 'REQUIRES_VERIFICATION' : 'PASSED'}`)

    res.json({
      status: isOnBadList ? 'requires_verification' : 'approved',
      requiresVerification: isOnBadList,
      message: isOnBadList 
        ? 'Additional verification required - a representative will contact you'
        : 'Credit check passed'
    })

  } catch (error) {
    console.error('Error performing credit check:', error)
    res.status(500).json({ 
      error: 'Credit check failed',
      message: 'Please try again later'
    })
  }
})

// Mount translations router
app.use('/api/translations', translationsRouter)

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
async function start() {
  await loadAllConfigs()
  
  const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`)
    console.log('Config endpoints available at:')
    console.log(`  - http://127.0.0.1:${PORT}/api/config/states`)
    console.log(`  - http://127.0.0.1:${PORT}/api/config/countries`)
    console.log(`  - http://127.0.0.1:${PORT}/api/config/identification-types`)
    console.log(`  - http://127.0.0.1:${PORT}/api/config/products`)
    console.log(`  - http://127.0.0.1:${PORT}/api/config/documents`)
    console.log(`  - http://127.0.0.1:${PORT}/api/config/bank-info`)
  })
  
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please free up the port or set a different PORT environment variable.`)
      process.exit(1)
    } else {
      console.error('Server error:', err)
      process.exit(1)
    }
  })
}

start().catch(console.error)