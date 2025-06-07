import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'url'
import {
  encryptValue,
  decryptValue,
  encryptSensitiveFields,
  decryptSensitiveFields,
  getSensitiveFields
} from './encryption'

/* eslint-disable @typescript-eslint/no-explicit-any */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Encryption Utilities', () => {
  const testKeyPath = path.join(__dirname, '..', '..', '.encryption-key')
  let originalKey: string | null = null

  beforeAll(async () => {
    // Backup existing key if present
    try {
      originalKey = await fs.readFile(testKeyPath, 'utf-8')
    } catch {
      // No existing key
    }
  })

  afterAll(async () => {
    // Restore original key or clean up test key
    if (originalKey) {
      await fs.writeFile(testKeyPath, originalKey)
    } else {
      try {
        await fs.unlink(testKeyPath)
      } catch {
        // File doesn't exist
      }
    }
  })

  describe('encryptValue and decryptValue', () => {
    it('should encrypt and decrypt a simple string', async () => {
      const originalValue = 'This is a test string'
      const encrypted = await encryptValue(originalValue)

      expect(encrypted).toHaveProperty('encrypted')
      expect(encrypted).toHaveProperty('iv')
      expect(encrypted).toHaveProperty('tag')
      expect(encrypted).toHaveProperty('salt')
      expect(encrypted.encrypted).not.toBe(originalValue)

      const decrypted = await decryptValue(encrypted)
      expect(decrypted).toBe(originalValue)
    })

    it('should generate different ciphertexts for the same plaintext', async () => {
      const originalValue = 'Same value encrypted twice'
      const encrypted1 = await encryptValue(originalValue)
      const encrypted2 = await encryptValue(originalValue)

      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted)
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
      expect(encrypted1.salt).not.toBe(encrypted2.salt)

      const decrypted1 = await decryptValue(encrypted1)
      const decrypted2 = await decryptValue(encrypted2)
      expect(decrypted1).toBe(originalValue)
      expect(decrypted2).toBe(originalValue)
    })

    it('should handle special characters and unicode', async () => {
      const originalValue = '✨ Special characters: !@#$%^&*() 你好世界 🌍'
      const encrypted = await encryptValue(originalValue)
      const decrypted = await decryptValue(encrypted)
      expect(decrypted).toBe(originalValue)
    })
  })

  describe('encryptSensitiveFields and decryptSensitiveFields', () => {
    it('should encrypt sensitive fields in a flat object', async () => {
      const originalData = {
        firstName: 'John',
        lastName: 'Doe',
        ssn: '123-45-6789',
        email: 'john.doe@example.com',
        phoneNumber: '555-123-4567'
      }

      const encrypted = await encryptSensitiveFields(originalData)

      // Non-sensitive fields should remain unchanged
      expect((encrypted as any).firstName).toBe('John')
      expect((encrypted as any).lastName).toBe('Doe')

      // Sensitive fields should be encrypted
      expect((encrypted as any).ssn).toHaveProperty('_encrypted', true)
      expect((encrypted as any).ssn).toHaveProperty('encrypted')
      expect((encrypted as any).email).toHaveProperty('_encrypted', true)
      expect((encrypted as any).phoneNumber).toHaveProperty('_encrypted', true)

      // Decrypt and verify
      const decrypted = await decryptSensitiveFields(encrypted)
      expect(decrypted).toEqual(originalData)
    })

    it('should handle nested objects', async () => {
      const originalData = {
        customerInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          ssn: '987-65-4321',
          dateOfBirth: '1990-01-01'
        },
        identificationInfo: {
          type: 'driverLicense',
          driverLicenseNumber: 'DL123456',
          state: 'CA'
        },
        bankAccountInfo: {
          routingNumber: '123456789',
          accountNumber: '9876543210'
        }
      }

      const encrypted = await encryptSensitiveFields(originalData)

      // Check that nested sensitive fields are encrypted
      expect((encrypted as any).customerInfo.ssn).toHaveProperty('_encrypted', true)
      expect((encrypted as any).customerInfo.dateOfBirth).toHaveProperty('_encrypted', true)
      expect((encrypted as any).identificationInfo.driverLicenseNumber).toHaveProperty('_encrypted', true)
      expect((encrypted as any).bankAccountInfo.routingNumber).toHaveProperty('_encrypted', true)
      expect((encrypted as any).bankAccountInfo.accountNumber).toHaveProperty('_encrypted', true)

      // Non-sensitive fields should remain unchanged
      expect((encrypted as any).customerInfo.firstName).toBe('Jane')
      expect((encrypted as any).identificationInfo.type).toBe('driverLicense')
      expect((encrypted as any).identificationInfo.state).toBe('CA')

      // Decrypt and verify
      const decrypted = await decryptSensitiveFields(encrypted)
      expect(decrypted).toEqual(originalData)
    })

    it('should handle arrays and mixed data structures', async () => {
      const originalData = {
        products: ['checking', 'savings'],
        documents: [
          { id: 'doc1', accepted: true },
          { id: 'doc2', accepted: false }
        ],
        additionalInfo: {
          referralCode: 'REF123',
          email: 'test@example.com',
          notes: ['Note 1', 'Note 2']
        }
      }

      const encrypted = await encryptSensitiveFields(originalData)

      // Arrays should be preserved
      expect((encrypted as any).products).toEqual(['checking', 'savings'])
      expect((encrypted as any).documents).toEqual(originalData.documents)

      // Email should be encrypted
      expect((encrypted as any).additionalInfo.email).toHaveProperty('_encrypted', true)

      // Decrypt and verify
      const decrypted = await decryptSensitiveFields(encrypted)
      expect(decrypted).toEqual(originalData)
    })

    it('should handle null and undefined values', async () => {
      const originalData = {
        firstName: 'Test',
        ssn: null,
        email: undefined,
        phoneNumber: ''
      }

      const encrypted = await encryptSensitiveFields(originalData)

      expect((encrypted as any).firstName).toBe('Test')
      expect((encrypted as any).ssn).toBeNull()
      expect((encrypted as any).email).toBeUndefined()
      expect((encrypted as any).phoneNumber).toBe('') // Empty strings are not encrypted

      const decrypted = await decryptSensitiveFields(encrypted)
      expect(decrypted).toEqual(originalData)
    })

    it('should handle complex real-world application data', async () => {
      const applicationData = {
        customerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          ssn: '123-45-6789',
          dateOfBirth: '1990-05-15',
          phoneNumber: '555-123-4567',
          email: 'john.doe@example.com',
          address: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345'
          }
        },
        identificationInfo: {
          type: 'passport',
          passportNumber: 'P123456789',
          countryOfIssuance: 'US'
        },
        selectedProducts: ['checking', 'savings'],
        fundingInfo: {
          initialDepositAmount: '1000',
          fundingSource: 'wire'
        },
        acceptedDocuments: {
          'terms-of-service': true,
          'privacy-policy': true
        }
      }

      const encrypted = await encryptSensitiveFields(applicationData)
      
      // Verify sensitive fields are encrypted
      expect((encrypted as any).customerInfo.ssn).toHaveProperty('_encrypted', true)
      expect((encrypted as any).customerInfo.dateOfBirth).toHaveProperty('_encrypted', true)
      expect((encrypted as any).customerInfo.phoneNumber).toHaveProperty('_encrypted', true)
      expect((encrypted as any).customerInfo.email).toHaveProperty('_encrypted', true)
      expect((encrypted as any).identificationInfo.passportNumber).toHaveProperty('_encrypted', true)
      expect((encrypted as any).fundingInfo.initialDepositAmount).toHaveProperty('_encrypted', true)

      // Verify non-sensitive fields remain unchanged
      expect((encrypted as any).customerInfo.firstName).toBe('John')
      expect((encrypted as any).customerInfo.address.street).toBe('123 Main St')
      expect((encrypted as any).selectedProducts).toEqual(['checking', 'savings'])
      expect((encrypted as any).acceptedDocuments).toEqual(applicationData.acceptedDocuments)

      // Decrypt and verify full equality
      const decrypted = await decryptSensitiveFields(encrypted)
      expect(decrypted).toEqual(applicationData)
    })
  })

  describe('getSensitiveFields', () => {
    it('should return the list of sensitive fields', () => {
      const fields = getSensitiveFields()
      expect(fields).toContain('ssn')
      expect(fields).toContain('dateOfBirth')
      expect(fields).toContain('email')
      expect(fields).toContain('phoneNumber')
      expect(fields).toContain('routingNumber')
      expect(fields).toContain('accountNumber')
    })
  })
})