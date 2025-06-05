import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import chokidar from 'chokidar'
import { randomUUID } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Enable CORS for development
app.use(cors())
app.use(express.json())

// Cache for config files
const configCache: Record<string, any> = {}

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
    configCache.identificationTypes = await loadConfigFile('identification-types.json')
    configCache.products = await loadConfigFile('products.json')
    configCache.documents = await loadConfigFile('documents.json')
    configCache.bankInfo = await loadConfigFile('bank-info.json')
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
      } else if (filename === 'identification-types.json') {
        configCache.identificationTypes = await loadConfigFile(filename)
      } else if (filename === 'products.json') {
        configCache.products = await loadConfigFile(filename)
      } else if (filename === 'documents.json') {
        configCache.documents = await loadConfigFile(filename)
      } else if (filename === 'bank-info.json') {
        configCache.bankInfo = await loadConfigFile(filename)
      }
      console.log(`Successfully reloaded ${filename}`)
    } catch (error) {
      console.error(`Error reloading ${filename}:`, error)
    }
  })
}

// API Routes
app.get('/api/config/states', (_req, res) => {
  if (!configCache.states) {
    return res.status(500).json({ error: 'States configuration not loaded' })
  }
  res.json(configCache.states)
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
    
    const document = documentsConfig.documents.find((doc: any) => doc.id === documentId)
    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    // In a real implementation, you would serve the actual PDF file
    // For now, we'll return a mock PDF response
    const mockPdfPath = path.join(__dirname, '..', 'public', 'mock-document.pdf')
    
    try {
      await fs.access(mockPdfPath)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="${document.name}.pdf"`)
      const pdfBuffer = await fs.readFile(mockPdfPath)
      res.send(pdfBuffer)
    } catch {
      // If mock PDF doesn't exist, return a simple text response
      res.setHeader('Content-Type', 'text/plain')
      res.send(`Mock document content for: ${document.name}\n\nThis is where the actual document content would be displayed.`)
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
    
    const document = documentsConfig.documents.find((doc: any) => doc.id === documentId)
    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    // In a real implementation, you would serve the actual PDF file for download
    const mockPdfPath = path.join(__dirname, '..', 'public', 'mock-document.pdf')
    
    try {
      await fs.access(mockPdfPath)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${document.name}.pdf"`)
      const pdfBuffer = await fs.readFile(mockPdfPath)
      res.send(pdfBuffer)
    } catch {
      // If mock PDF doesn't exist, return a simple text file
      res.setHeader('Content-Type', 'text/plain')
      res.setHeader('Content-Disposition', `attachment; filename="${document.name}.txt"`)
      res.send(`Mock document content for: ${document.name}\n\nThis is where the actual document content would be displayed.`)
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
    
    // Create application record with metadata
    const application = {
      id: applicationId,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      data: applicationData,
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
    
    res.json(application)
    
  } catch (error) {
    console.error('Error retrieving application:', error)
    res.status(500).json({ error: 'Failed to retrieve application' })
  }
})

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
async function start() {
  await loadAllConfigs()
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log('Config endpoints available at:')
    console.log(`  - http://localhost:${PORT}/api/config/states`)
    console.log(`  - http://localhost:${PORT}/api/config/identification-types`)
    console.log(`  - http://localhost:${PORT}/api/config/products`)
    console.log(`  - http://localhost:${PORT}/api/config/documents`)
    console.log(`  - http://localhost:${PORT}/api/config/bank-info`)
  })
}

start().catch(console.error)