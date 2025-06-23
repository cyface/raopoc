import { Controller, Get, Res } from '@nestjs/common'
import { Response } from 'express'
import { join } from 'path'

@Controller()
export class SpaController {
  @Get(['/', '/step/*path', '/onboarding/*path', '/login', '/register'])
  serveSpa(@Res() res: Response): void {
    // Serve the React SPA for specific routes that should be handled by React Router
    res.sendFile(join(__dirname, '..', '..', '..', 'dist', 'index.html'))
  }
}