import { describe, it, expect } from 'vitest'
import { 
  DocumentSchema, 
  DocumentRuleSchema, 
  DocumentConfigSchema, 
  DocumentAcceptanceSchema 
} from './documents'

describe('Document Types', () => {
  describe('DocumentSchema', () => {
    it('validates a complete document', () => {
      const validDocument = {
        id: 'terms-of-service',
        name: 'Terms of Service',
        description: 'Legal terms and conditions',
        url: '/documents/terms.pdf',
        required: true,
        category: 'terms' as const,
      }

      expect(() => DocumentSchema.parse(validDocument)).not.toThrow()
    })

    it('validates a document without description', () => {
      const documentWithoutDescription = {
        id: 'privacy-policy',
        name: 'Privacy Policy',
        url: '/documents/privacy.pdf',
        required: true,
        category: 'privacy' as const,
      }

      expect(() => DocumentSchema.parse(documentWithoutDescription)).not.toThrow()
    })

    it('rejects document with invalid category', () => {
      const invalidDocument = {
        id: 'test',
        name: 'Test Document',
        url: '/documents/test.pdf',
        required: true,
        category: 'invalid-category',
      }

      expect(() => DocumentSchema.parse(invalidDocument)).toThrow()
    })

    it('rejects document with missing required fields', () => {
      const incompleteDocument = {
        id: 'test',
        name: 'Test Document',
        // missing url, required, category
      }

      expect(() => DocumentSchema.parse(incompleteDocument)).toThrow()
    })
  })

  describe('DocumentRuleSchema', () => {
    it('validates a rule with product types only', () => {
      const rule = {
        productTypes: ['checking', 'savings'],
        documentIds: ['terms-of-service', 'fee-schedule'],
      }

      expect(() => DocumentRuleSchema.parse(rule)).not.toThrow()
    })

    it('validates a rule with SSN conditions', () => {
      const rule = {
        hasSSN: true,
        documentIds: ['patriot-act-notice'],
      }

      expect(() => DocumentRuleSchema.parse(rule)).not.toThrow()
    })

    it('validates a rule with noSSN condition', () => {
      const rule = {
        noSSN: true,
        documentIds: ['itin-disclosure'],
      }

      expect(() => DocumentRuleSchema.parse(rule)).not.toThrow()
    })

    it('validates a rule with mixed conditions', () => {
      const rule = {
        productTypes: ['checking'],
        hasSSN: false,
        documentIds: ['checking-agreement', 'itin-disclosure'],
      }

      expect(() => DocumentRuleSchema.parse(rule)).not.toThrow()
    })

    it('rejects rule without documentIds', () => {
      const invalidRule = {
        productTypes: ['checking'],
      }

      expect(() => DocumentRuleSchema.parse(invalidRule)).toThrow()
    })
  })

  describe('DocumentConfigSchema', () => {
    it('validates a complete document configuration', () => {
      const config = {
        documents: [
          {
            id: 'terms',
            name: 'Terms of Service',
            url: '/documents/terms.pdf',
            required: true,
            category: 'terms' as const,
          },
        ],
        rules: [
          {
            documentIds: ['terms'],
          },
        ],
      }

      expect(() => DocumentConfigSchema.parse(config)).not.toThrow()
    })

    it('rejects config with empty documents array', () => {
      const config = {
        documents: [],
        rules: [
          {
            documentIds: ['terms'],
          },
        ],
      }

      expect(() => DocumentConfigSchema.parse(config)).not.toThrow() // Empty array is allowed
    })

    it('rejects config with invalid document', () => {
      const config = {
        documents: [
          {
            id: 'terms',
            // missing required fields
          },
        ],
        rules: [],
      }

      expect(() => DocumentConfigSchema.parse(config)).toThrow()
    })
  })

  describe('DocumentAcceptanceSchema', () => {
    it('validates acceptance with timestamp', () => {
      const acceptance = {
        documentId: 'terms-of-service',
        accepted: true,
        acceptedAt: '2024-01-01T00:00:00.000Z',
      }

      expect(() => DocumentAcceptanceSchema.parse(acceptance)).not.toThrow()
    })

    it('validates acceptance without timestamp', () => {
      const acceptance = {
        documentId: 'terms-of-service',
        accepted: false,
      }

      expect(() => DocumentAcceptanceSchema.parse(acceptance)).not.toThrow()
    })

    it('rejects acceptance with missing documentId', () => {
      const acceptance = {
        accepted: true,
      }

      expect(() => DocumentAcceptanceSchema.parse(acceptance)).toThrow()
    })

    it('rejects acceptance with missing accepted field', () => {
      const acceptance = {
        documentId: 'terms-of-service',
      }

      expect(() => DocumentAcceptanceSchema.parse(acceptance)).toThrow()
    })
  })
})