import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock the configService with all methods
vi.mock('../services/configService', () => ({
  configService: {
    getStates: vi.fn().mockResolvedValue([
      { code: 'CA', name: 'California' },
      { code: 'NY', name: 'New York' },
    ]),
    getIdentificationTypes: vi.fn().mockResolvedValue([
      { value: 'passport', label: 'Passport', requiresState: false },
      { value: 'drivers-license', label: "Driver's License", requiresState: true },
    ]),
    getProducts: vi.fn().mockResolvedValue([
      { type: 'checking', title: 'Checking Account', description: 'Basic checking', icon: 'CreditCard' },
      { type: 'savings', title: 'Savings Account', description: 'Basic savings', icon: 'PiggyBank' },
    ]),
    getDocuments: vi.fn().mockResolvedValue({
      documents: [],
      rules: [],
    }),
    getBankInfo: vi.fn().mockResolvedValue({
      bankName: 'Cool Bank',
      displayName: 'Cool Bank',
      contact: {
        phone: '1-800-COOLBNK',
        phoneDisplay: '1-800-COOLBNK (1-800-XXX-XXXX)',
        email: 'support@coolbank.com',
        hours: 'Monday - Friday 8:00 AM - 8:00 PM EST',
      },
      branding: {
        primaryColor: '#3b82f6',
        logoIcon: 'Building2',
      },
    }),
    getIdentificationTypesThatRequireState: vi.fn().mockResolvedValue(['drivers-license']),
    clearCache: vi.fn(),
  },
}))