import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as session from 'express-session'
import { createClient } from 'redis'
import type { RequestHandler } from 'express'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { RedisStore } = require('connect-redis')

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name)

  constructor(private configService: ConfigService) {}

  async createSessionMiddleware(): Promise<RequestHandler> {
    const sessionSecret = this.configService.get<string>('SESSION_SECRET') || 'fallback-secret-change-in-production'
    const redisUrl = this.configService.get<string>('REDIS_URL')

    const sessionConfig: session.SessionOptions = {
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        sameSite: 'lax'
      }
    }

    // Configure Redis store if Redis URL is available
    if (redisUrl) {
      try {
        this.logger.log(`Configuring Redis session store with URL: ${redisUrl.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1***$2')}`)
        
        const redisClient = createClient({
          url: redisUrl,
          socket: {
            reconnectStrategy: (retries: number) => Math.min(retries * 50, 500)
          }
        })

        redisClient.on('error', (err) => {
          this.logger.error('Redis client error:', err)
        })

        redisClient.on('connect', () => {
          this.logger.log('Connected to Redis for session storage')
        })

        redisClient.on('reconnecting', () => {
          this.logger.warn('Reconnecting to Redis...')
        })

        await redisClient.connect()

        // Create Redis store - connect-redis v9 directly exports the store class
        const redisStore = new RedisStore({
          client: redisClient,
          prefix: 'raopoc:sess:',
          ttl: 60 * 60 * 24 // 24 hours in seconds
        })

        sessionConfig.store = redisStore
        this.logger.log('Redis session store configured successfully')
        
      } catch (error) {
        this.logger.error('Failed to configure Redis session store, falling back to memory store:', error)
        this.logger.warn('⚠️  Using in-memory session store - sessions will not persist across server restarts')
      }
    } else {
      this.logger.log('No REDIS_URL found, using in-memory session store')
      this.logger.warn('⚠️  Using in-memory session store - sessions will not persist across server restarts')
    }

    return session(sessionConfig)
  }
}