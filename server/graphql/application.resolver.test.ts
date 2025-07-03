import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ApplicationResolver } from './application.resolver'
import { ProductType } from '@prisma/client'

describe('ApplicationResolver', () => {
  let resolver: ApplicationResolver
  let mockApplicationService: any

  beforeEach(() => {
    mockApplicationService = {
      getApplication: vi.fn(),
      createApplication: vi.fn()
    }

    resolver = new ApplicationResolver(mockApplicationService)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('application query', () => {
    it('should return application by ID', async () => {
      // Arrange
      const mockApplication = {
        id: 'app-123',
        submittedAt: '2023-01-01T00:00:00Z',
        status: 'submitted',
        data: {
          selectedProducts: ['checking'],
          customerInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
          }
        },
        metadata: {
          userAgent: 'Mozilla/5.0',
          ipAddress: '192.168.1.1',
          submissionSource: 'web-onboarding'
        }
      }

      mockApplicationService.getApplication.mockResolvedValue(mockApplication)

      // Act
      const result = await resolver.application('app-123')

      // Assert
      expect(mockApplicationService.getApplication).toHaveBeenCalledWith('app-123')
      expect(result).toEqual(mockApplication)
    })

    it('should return null for non-existent application', async () => {
      // Arrange
      mockApplicationService.getApplication.mockResolvedValue(null)

      // Act
      const result = await resolver.application('nonexistent-id')

      // Assert
      expect(mockApplicationService.getApplication).toHaveBeenCalledWith('nonexistent-id')
      expect(result).toBeNull()
    })
  })

  describe('createApplication mutation', () => {
    it('should create application successfully', async () => {
      // Arrange
      const input = {
        selectedProducts: [ProductType.CHECKING, ProductType.SAVINGS],
        customerInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phoneNumber: '555-123-4567',
          mailingAddress: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'NY',
            zipCode: '12345'
          },
          useSameAddress: true
        },
        identificationInfo: {
          identificationType: 'driversLicense',
          identificationNumber: 'DL123456',
          state: 'NY',
          socialSecurityNumber: '123-45-6789',
          noSSN: false,
          dateOfBirth: '1990-01-01'
        },
        documentAcceptance: [
          { documentId: 'terms', accepted: true },
          { documentId: 'privacy', accepted: true }
        ],
        userAgent: 'Mozilla/5.0 Test',
        ipAddress: '192.168.1.100'
      }

      const expectedResult = {
        applicationId: 'app-456',
        status: 'submitted',
        message: 'Application submitted successfully',
        filename: 'app-456-Smith.json'
      }

      mockApplicationService.createApplication.mockResolvedValue(expectedResult)

      // Act
      const result = await resolver.createApplication(input)

      // Assert
      expect(mockApplicationService.createApplication).toHaveBeenCalledWith(
        {
          selectedProducts: [ProductType.CHECKING, ProductType.SAVINGS],
          customerInfo: input.customerInfo,
          identificationInfo: input.identificationInfo,
          documentAcceptance: {
            acceptances: {
              terms: {
                documentId: 'terms',
                accepted: true,
                acceptedAt: expect.any(String)
              },
              privacy: {
                documentId: 'privacy',
                accepted: true,
                acceptedAt: expect.any(String)
              }
            },
            allAccepted: true
          }
        },
        'Mozilla/5.0 Test',
        '192.168.1.100'
      )
      expect(result).toEqual(expectedResult)
    })

    it('should create application with partial document acceptance', async () => {
      // Arrange
      const input = {
        selectedProducts: [ProductType.CHECKING],
        documentAcceptance: [
          { documentId: 'terms', accepted: true },
          { documentId: 'privacy', accepted: false }
        ]
      }

      const expectedResult = {
        applicationId: 'app-789',
        status: 'submitted',
        message: 'Application submitted successfully',
        filename: 'app-789-Unknown.json'
      }

      mockApplicationService.createApplication.mockResolvedValue(expectedResult)

      // Act
      const result = await resolver.createApplication(input)

      // Assert
      expect(mockApplicationService.createApplication).toHaveBeenCalledWith(
        {
          selectedProducts: [ProductType.CHECKING],
          customerInfo: undefined,
          identificationInfo: undefined,
          documentAcceptance: {
            acceptances: {
              terms: {
                documentId: 'terms',
                accepted: true,
                acceptedAt: expect.any(String)
              },
              privacy: {
                documentId: 'privacy',
                accepted: false,
                acceptedAt: undefined
              }
            },
            allAccepted: false
          }
        },
        undefined,
        undefined
      )
      expect(result).toEqual(expectedResult)
    })

    it('should create application without document acceptance', async () => {
      // Arrange
      const input = {
        selectedProducts: [ProductType.MONEY_MARKET],
        customerInfo: {
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob@example.com',
          phoneNumber: '555-987-6543',
          mailingAddress: {
            street: '456 Oak Ave',
            city: 'Somewhere',
            state: 'CA',
            zipCode: '90210'
          },
          useSameAddress: true
        }
      }

      const expectedResult = {
        applicationId: 'app-101',
        status: 'submitted',
        message: 'Application submitted successfully',
        filename: 'app-101-Johnson.json'
      }

      mockApplicationService.createApplication.mockResolvedValue(expectedResult)

      // Act
      const result = await resolver.createApplication(input)

      // Assert
      expect(mockApplicationService.createApplication).toHaveBeenCalledWith(
        {
          selectedProducts: [ProductType.MONEY_MARKET],
          customerInfo: input.customerInfo,
          identificationInfo: undefined,
          documentAcceptance: undefined
        },
        undefined,
        undefined
      )
      expect(result).toEqual(expectedResult)
    })
  })

  describe('healthCheck query', () => {
    it('should return health status', () => {
      // Act
      const result = resolver.healthCheck()

      // Assert
      expect(result.status).toBe('ok')
      expect(result.timestamp).toBeInstanceOf(Date)
    })
  })
})