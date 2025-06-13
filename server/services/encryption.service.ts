import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import * as fs from 'fs/promises'
import * as path from 'path'

interface EncryptedValue {
  _encrypted: true
  encrypted: string
  iv: string
  tag: string
  salt: string
}

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

@Injectable()
export class EncryptionService {
  private readonly ALGORITHM = 'aes-256-gcm'
  private readonly KEY_LENGTH = 32
  private readonly IV_LENGTH = 16
  private readonly SALT_LENGTH = 32

  private readonly SENSITIVE_FIELDS = [
    'ssn',
    'socialSecurityNumber',
    'dateOfBirth',
    'phoneNumber',
    'email',
    'identificationNumber',
    'driverLicenseNumber',
    'driversLicenseNumber',
    'passportNumber',
    'stateIdNumber',
    'militaryIdNumber',
    'street',
    'address',
    'zipCode',
    'postalCode',
    'routingNumber',
    'accountNumber',
    'initialDepositAmount'
  ]

  private async deriveKey(masterKey: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(masterKey, salt, 100000, this.KEY_LENGTH, 'sha256', (err, derivedKey) => {
        if (err) reject(err)
        else resolve(derivedKey)
      })
    })
  }

  private async getMasterKey(): Promise<string> {
    if (process.env.ENCRYPTION_KEY) {
      const key = process.env.ENCRYPTION_KEY.trim()
      if (key.length >= 44) {
        return key
      } else {
        console.warn('⚠️  ENCRYPTION_KEY environment variable is too short, falling back to file-based key')
      }
    }

    const keyPath = path.join(process.cwd(), '..', '.encryption-key')
    
    try {
      const key = await fs.readFile(keyPath, 'utf-8')
      return key.trim()
    } catch {
      const newKey = crypto.randomBytes(this.KEY_LENGTH).toString('base64')
      await fs.writeFile(keyPath, newKey, { mode: 0o600 })
      console.log('⚠️  New encryption key generated and saved to .encryption-key')
      console.log('⚠️  Make sure to backup this key securely and add .encryption-key to .gitignore')
      console.log('⚠️  For production, consider using the ENCRYPTION_KEY environment variable instead')
      return newKey
    }
  }

  async encryptValue(value: string, masterKey?: string): Promise<{
    encrypted: string
    iv: string
    tag: string
    salt: string
  }> {
    const key = masterKey || await this.getMasterKey()
    const salt = crypto.randomBytes(this.SALT_LENGTH)
    const derivedKey = await this.deriveKey(key, salt)
    
    const iv = crypto.randomBytes(this.IV_LENGTH)
    const cipher = crypto.createCipheriv(this.ALGORITHM, derivedKey, iv)
    
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

  async decryptValue(encryptedData: {
    encrypted: string
    iv: string
    tag: string
    salt: string
  }, masterKey?: string): Promise<string> {
    const key = masterKey || await this.getMasterKey()
    const salt = Buffer.from(encryptedData.salt, 'base64')
    const derivedKey = await this.deriveKey(key, salt)
    
    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
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

  async encryptSensitiveFields(obj: unknown, path: string[] = []): Promise<unknown> {
    if (obj === null || obj === undefined) {
      return obj
    }
    
    if (typeof obj !== 'object') {
      return obj
    }
    
    if (Array.isArray(obj)) {
      return Promise.all(obj.map((item, index) => 
        this.encryptSensitiveFields(item, [...path, index.toString()])
      ))
    }
    
    const result: Record<string, unknown> = {}
    
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const currentPath = [...path, key]
      const fieldName = currentPath[currentPath.length - 1]
      
      if (this.SENSITIVE_FIELDS.includes(fieldName) && typeof value === 'string' && value.length > 0) {
        const encryptedData = await this.encryptValue(value)
        result[key] = {
          _encrypted: true,
          ...encryptedData
        }
      } else if (typeof value === 'object' && value !== null) {
        result[key] = await this.encryptSensitiveFields(value, currentPath)
      } else {
        result[key] = value
      }
    }
    
    return result
  }

  async decryptSensitiveFields(obj: unknown): Promise<unknown> {
    if (obj === null || obj === undefined) {
      return obj
    }
    
    if (typeof obj !== 'object') {
      return obj
    }
    
    if (Array.isArray(obj)) {
      return Promise.all(obj.map(item => this.decryptSensitiveFields(item)))
    }
    
    if (isEncryptedValue(obj)) {
      try {
        return await this.decryptValue({
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
        result[key] = await this.decryptSensitiveFields(value)
      } else {
        result[key] = value
      }
    }
    
    return result
  }

  getSensitiveFields(): string[] {
    return [...this.SENSITIVE_FIELDS]
  }
}