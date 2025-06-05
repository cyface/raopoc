import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import chokidar from 'chokidar'

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
  })
}

start().catch(console.error)