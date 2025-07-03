import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql'
import { Injectable } from '@nestjs/common'
import { SessionInfo, AdminStatus, HealthStatus } from './object-types'
import { AdminLoginInput, SessionLoginInput } from './input-types'

@Resolver()
@Injectable()
export class SessionResolver {
  @Query(() => SessionInfo)
  async sessionInfo(@Context() context: any): Promise<SessionInfo> {
    const req = context.req
    const session = req.session
    
    // Increment visit count
    session.visitCount = (session.visitCount || 0) + 1
    session.lastVisit = new Date()
    
    const hasRedisStore = session.store && session.store.constructor.name === 'RedisStore'
    
    return {
      sessionId: session.id,
      visitCount: session.visitCount,
      lastVisit: session.lastVisit,
      storeType: hasRedisStore ? 'redis' : 'memory'
    }
  }

  @Mutation(() => Boolean)
  async sessionLogin(
    @Args('input') input: SessionLoginInput,
    @Context() context: any
  ): Promise<boolean> {
    const req = context.req
    
    if (!input.username) {
      return false
    }

    req.session.userId = `user_${Date.now()}`
    req.session.username = input.username
    req.session.visitCount = (req.session.visitCount || 0) + 1
    req.session.lastVisit = new Date()

    return true
  }

  @Mutation(() => Boolean)
  async sessionLogout(@Context() context: any): Promise<boolean> {
    const req = context.req
    
    return new Promise((resolve) => {
      req.session.destroy((err: any) => {
        if (err) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  }

  @Query(() => HealthStatus)
  async sessionHealth(): Promise<HealthStatus> {
    // Health check - simple status response
    return {
      status: 'ok',
      timestamp: new Date()
    }
  }

  @Mutation(() => Boolean)
  async adminLogin(
    @Args('input') input: AdminLoginInput,
    @Context() context: any
  ): Promise<boolean> {
    const req = context.req
    // Simple hardcoded admin auth (matching the original controller)
    if (input.username === 'admin' && input.password === 'password') {
      req.session.isAdmin = true
      req.session.adminUsername = input.username
      return true
    }
    return false
  }

  @Mutation(() => Boolean)
  async adminLogout(@Context() context: any): Promise<boolean> {
    const req = context.req
    delete req.session.isAdmin
    delete req.session.adminUsername
    return true
  }

  @Query(() => AdminStatus)
  async adminStatus(@Context() context: any): Promise<AdminStatus> {
    const req = context.req
    return {
      isAuthenticated: req.session?.isAdmin || false,
      username: req.session?.adminUsername || undefined
    }
  }
}