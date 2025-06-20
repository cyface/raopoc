import { Controller, Get, Post, Body, Req, Res, Logger } from '@nestjs/common'
import { Request, Response } from 'express'

@Controller('api/session')
export class SessionController {
  private readonly logger = new Logger(SessionController.name)

  @Get('info')
  getSessionInfo(@Req() req: Request) {
    const session = req.session
    
    // Increment visit count
    session.visitCount = (session.visitCount || 0) + 1
    session.lastVisit = new Date()

    this.logger.debug(`Session info requested. Session ID: ${session.id}, Visit count: ${session.visitCount}`)

    return {
      sessionId: session.id,
      visitCount: session.visitCount,
      lastVisit: session.lastVisit,
      userId: session.userId,
      username: session.username,
      hasSession: !!session.id
    }
  }

  @Post('login')
  login(@Body() body: { username: string }, @Req() req: Request) {
    const { username } = body
    
    if (!username) {
      return { error: 'Username is required' }
    }

    req.session.userId = `user_${Date.now()}`
    req.session.username = username
    req.session.visitCount = (req.session.visitCount || 0) + 1
    req.session.lastVisit = new Date()

    this.logger.log(`User logged in: ${username}, Session ID: ${req.session.id}`)

    return {
      message: 'Logged in successfully',
      sessionId: req.session.id,
      userId: req.session.userId,
      username: req.session.username
    }
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.session.id
    const username = req.session.username

    req.session.destroy((err) => {
      if (err) {
        this.logger.error('Error destroying session:', err)
        return res.status(500).json({ error: 'Failed to logout' })
      }

      this.logger.log(`User logged out: ${username}, Session ID: ${sessionId}`)
      res.clearCookie('connect.sid') // Clear the session cookie
      res.json({ message: 'Logged out successfully' })
    })
  }

  @Get('health')
  health(@Req() req: Request) {
    const hasRedisStore = req.session.store && req.session.store.constructor.name === 'RedisStore'
    
    return {
      sessionEnabled: true,
      storeType: hasRedisStore ? 'redis' : 'memory',
      sessionId: req.session.id,
      timestamp: new Date().toISOString()
    }
  }
}