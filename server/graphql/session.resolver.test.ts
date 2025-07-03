import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SessionResolver } from './session.resolver'

interface MockSession {
  id?: string
  visitCount?: number
  lastVisit?: Date
  store?: { constructor: { name: string } }
  userId?: string
  username?: string
  isAdmin?: boolean
  adminUsername?: string
  destroy?: (callback: (err?: Error) => void) => void
}

describe('SessionResolver', () => {
  let resolver: SessionResolver

  beforeEach(() => {
    resolver = new SessionResolver()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('sessionInfo query', () => {
    it('should return session information with memory store', async () => {
      // Arrange
      const mockSession = {
        id: 'session-123',
        visitCount: 0,
        lastVisit: undefined,
        store: { constructor: { name: 'MemoryStore' } }
      }
      const mockRequest = { session: mockSession }
      const mockContext = { req: mockRequest }

      // Act
      const result = await resolver.sessionInfo(mockContext)

      // Assert
      expect(result.sessionId).toBe('session-123')
      expect(result.visitCount).toBe(1) // Should increment
      expect(result.storeType).toBe('memory')
      expect(result.lastVisit).toBeInstanceOf(Date)
    })

    it('should return session information with Redis store', async () => {
      // Arrange
      const mockSession = {
        id: 'session-456',
        visitCount: 5,
        lastVisit: new Date('2023-01-01'),
        store: { constructor: { name: 'RedisStore' } }
      }
      const mockRequest = { session: mockSession }
      const mockContext = { req: mockRequest }

      // Act
      const result = await resolver.sessionInfo(mockContext)

      // Assert
      expect(result.sessionId).toBe('session-456')
      expect(result.visitCount).toBe(6) // Should increment
      expect(result.storeType).toBe('redis')
      expect(result.lastVisit).toBeInstanceOf(Date)
    })
  })

  describe('sessionLogin mutation', () => {
    it('should login user successfully', async () => {
      // Arrange
      const mockSession = {
        userId: undefined,
        username: undefined,
        visitCount: 0,
        lastVisit: undefined
      }
      const mockRequest = { session: mockSession }
      const mockContext = { req: mockRequest }
      const input = { username: 'testuser' }

      // Act
      const result = await resolver.sessionLogin(input, mockContext)

      // Assert
      expect(result).toBe(true)
      expect(mockSession.username).toBe('testuser')
      expect(mockSession.userId).toMatch(/^user_\d+$/)
      expect(mockSession.visitCount).toBe(1)
      expect(mockSession.lastVisit).toBeInstanceOf(Date)
    })

    it('should fail login with empty username', async () => {
      // Arrange
      const mockSession = {}
      const mockRequest = { session: mockSession }
      const mockContext = { req: mockRequest }
      const input = { username: '' }

      // Act
      const result = await resolver.sessionLogin(input, mockContext)

      // Assert
      expect(result).toBe(false)
    })
  })

  describe('sessionLogout mutation', () => {
    it('should logout user successfully', async () => {
      // Arrange
      const mockSession = {
        destroy: vi.fn((callback) => callback(null))
      }
      const mockRequest = { session: mockSession }
      const mockContext = { req: mockRequest }

      // Act
      const result = await resolver.sessionLogout(mockContext)

      // Assert
      expect(result).toBe(true)
      expect(mockSession.destroy).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should fail logout on session destroy error', async () => {
      // Arrange
      const mockSession = {
        destroy: vi.fn((callback) => callback(new Error('Destroy failed')))
      }
      const mockRequest = { session: mockSession }
      const mockContext = { req: mockRequest }

      // Act
      const result = await resolver.sessionLogout(mockContext)

      // Assert
      expect(result).toBe(false)
      expect(mockSession.destroy).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('sessionHealth query', () => {
    it('should return health status', async () => {
      // Act
      const result = await resolver.sessionHealth()

      // Assert
      expect(result.status).toBe('ok')
      expect(result.timestamp).toBeInstanceOf(Date)
    })
  })

  describe('adminLogin mutation', () => {
    it('should login admin with correct credentials', async () => {
      // Arrange
      const mockSession: MockSession = {}
      const mockRequest = { session: mockSession }
      const mockContext = { req: mockRequest }
      const input = { username: 'admin', password: 'password' }

      // Act
      const result = await resolver.adminLogin(input, mockContext)

      // Assert
      expect(result).toBe(true)
      expect(mockSession.isAdmin).toBe(true)
      expect(mockSession.adminUsername).toBe('admin')
    })

    it('should fail admin login with incorrect credentials', async () => {
      // Arrange
      const mockSession: MockSession = {}
      const mockRequest = { session: mockSession }
      const mockContext = { req: mockRequest }
      const input = { username: 'admin', password: 'wrongpassword' }

      // Act
      const result = await resolver.adminLogin(input, mockContext)

      // Assert
      expect(result).toBe(false)
      expect(mockSession.isAdmin).toBeUndefined()
      expect(mockSession.adminUsername).toBeUndefined()
    })

    it('should fail admin login with wrong username', async () => {
      // Arrange
      const mockSession: MockSession = {}
      const mockRequest = { session: mockSession }
      const mockContext = { req: mockRequest }
      const input = { username: 'user', password: 'password' }

      // Act
      const result = await resolver.adminLogin(input, mockContext)

      // Assert
      expect(result).toBe(false)
      expect(mockSession.isAdmin).toBeUndefined()
    })
  })

  describe('adminLogout mutation', () => {
    it('should logout admin', async () => {
      // Arrange
      const mockSession = {
        isAdmin: true,
        adminUsername: 'admin'
      }
      const mockRequest = { session: mockSession }
      const mockContext = { req: mockRequest }

      // Act
      const result = await resolver.adminLogout(mockContext)

      // Assert
      expect(result).toBe(true)
      expect(mockSession.isAdmin).toBeUndefined()
      expect(mockSession.adminUsername).toBeUndefined()
    })
  })

  describe('adminStatus query', () => {
    it('should return authenticated admin status', async () => {
      // Arrange
      const mockSession = {
        isAdmin: true,
        adminUsername: 'admin'
      }
      const mockRequest = { session: mockSession }
      const mockContext = { req: mockRequest }

      // Act
      const result = await resolver.adminStatus(mockContext)

      // Assert
      expect(result.isAuthenticated).toBe(true)
      expect(result.username).toBe('admin')
    })

    it('should return unauthenticated admin status', async () => {
      // Arrange
      const mockSession: MockSession = {}
      const mockRequest = { session: mockSession }
      const mockContext = { req: mockRequest }

      // Act
      const result = await resolver.adminStatus(mockContext)

      // Assert
      expect(result.isAuthenticated).toBe(false)
      expect(result.username).toBeUndefined()
    })

    it('should handle missing session', async () => {
      // Arrange
      const mockRequest = { session: undefined }
      const mockContext = { req: mockRequest }

      // Act
      const result = await resolver.adminStatus(mockContext)

      // Assert
      expect(result.isAuthenticated).toBe(false)
      expect(result.username).toBeUndefined()
    })
  })
})