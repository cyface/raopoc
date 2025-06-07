import * as crypto from 'crypto'
import * as fs from 'fs/promises'
import * as path from 'path'

// Type for encrypted data structure
interface EncryptedValue {
  _encrypted: true
  encrypted: string
  iv: string
  tag: string
  salt: string
}

// Type guard to check if an object is an encrypted value
function isEncryptedValue(obj: unknown): obj is EncryptedValue {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '_encrypted' in obj &&
    'encrypted' in obj &&
    'iv' in obj &&
    'tag' in obj &&
    'salt' in obj
  )
}

// Encryption configuration
const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16 // 128 bits
const SALT_LENGTH = 32 // 256 bits

// Fields that should be encrypted
const SENSITIVE_FIELDS = [
  'ssn',
  'dateOfBirth',
  'phoneNumber',
  'email',
  'driverLicenseNumber',
  'passportNumber',
  'stateIdNumber',
  'routingNumber',
  'accountNumber',
  'initialDepositAmount'
]

// Derive encryption key from master key using PBKDF2
async function deriveKey(masterKey: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(masterKey, salt, 100000, KEY_LENGTH, 'sha256', (err, derivedKey) => {
      if (err) reject(err)
      else resolve(derivedKey)
    })
  })
}

// Get or create master encryption key
async function getMasterKey(): Promise<string> {
  // First check environment variable
  if (process.env.ENCRYPTION_KEY) {
    const key = process.env.ENCRYPTION_KEY.trim()
    // Validate key length (should be base64 encoded 32 bytes = 44 chars with padding)
    if (key.length >= 44) {
      return key
    } else {
      console.warn('⚠️  ENCRYPTION_KEY environment variable is too short, falling back to file-based key')
    }
  }

  const keyPath = path.join(__dirname, '..', '..', '.encryption-key')
  
  try {
    // Try to read existing key
    const key = await fs.readFile(keyPath, 'utf-8')
    return key.trim()
  } catch {
    // Generate new key if not exists
    const newKey = crypto.randomBytes(KEY_LENGTH).toString('base64')
    await fs.writeFile(keyPath, newKey, { mode: 0o600 }) // Restricted file permissions
    console.log('⚠️  New encryption key generated and saved to .encryption-key')
    console.log('⚠️  Make sure to backup this key securely and add .encryption-key to .gitignore')
    console.log('⚠️  For production, consider using the ENCRYPTION_KEY environment variable instead')
    return newKey
  }
}

// Encrypt a single value
export async function encryptValue(value: string, masterKey?: string): Promise<{
  encrypted: string
  iv: string
  tag: string
  salt: string
}> {
  const key = masterKey || await getMasterKey()
  const salt = crypto.randomBytes(SALT_LENGTH)
  const derivedKey = await deriveKey(key, salt)
  
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv)
  
  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final()
  ])
  
  const tag = cipher.getAuthTag()
  
  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    salt: salt.toString('base64')
  }
}

// Decrypt a single value
export async function decryptValue(encryptedData: {
  encrypted: string
  iv: string
  tag: string
  salt: string
}, masterKey?: string): Promise<string> {
  const key = masterKey || await getMasterKey()
  const salt = Buffer.from(encryptedData.salt, 'base64')
  const derivedKey = await deriveKey(key, salt)
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    derivedKey,
    Buffer.from(encryptedData.iv, 'base64')
  )
  
  decipher.setAuthTag(Buffer.from(encryptedData.tag, 'base64'))
  
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData.encrypted, 'base64')),
    decipher.final()
  ])
  
  return decrypted.toString('utf8')
}

// Recursively encrypt sensitive fields in an object
export async function encryptSensitiveFields(obj: unknown, path: string[] = []): Promise<unknown> {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (typeof obj !== 'object') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return Promise.all(obj.map((item, index) => 
      encryptSensitiveFields(item, [...path, index.toString()])
    ))
  }
  
  const result: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const currentPath = [...path, key]
    const fieldName = currentPath[currentPath.length - 1]
    
    // Check if this field should be encrypted
    if (SENSITIVE_FIELDS.includes(fieldName) && typeof value === 'string' && value.length > 0) {
      // Encrypt the value
      const encryptedData = await encryptValue(value)
      result[key] = {
        _encrypted: true,
        ...encryptedData
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively process nested objects
      result[key] = await encryptSensitiveFields(value, currentPath)
    } else {
      // Keep non-sensitive fields as-is
      result[key] = value
    }
  }
  
  return result
}

// Recursively decrypt sensitive fields in an object
export async function decryptSensitiveFields(obj: unknown): Promise<unknown> {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (typeof obj !== 'object') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => decryptSensitiveFields(item)))
  }
  
  // Check if this is an encrypted value
  if (isEncryptedValue(obj)) {
    try {
      return await decryptValue({
        encrypted: obj.encrypted,
        iv: obj.iv,
        tag: obj.tag,
        salt: obj.salt
      })
    } catch (error) {
      console.error('Failed to decrypt value:', error)
      return '[DECRYPTION_FAILED]'
    }
  }
  
  const result: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = await decryptSensitiveFields(value)
    } else {
      result[key] = value
    }
  }
  
  return result
}

// Utility to get current sensitive fields
export function getSensitiveFields(): string[] {
  return [...SENSITIVE_FIELDS]
}