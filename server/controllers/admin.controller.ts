import { Controller, Post, Get, Body, Req, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AdminLoginDto } from '../dto/admin-login.dto';
import { AdminGuard } from '../guards/admin.guard';
import { ApplicationService } from '../services/application.service';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('login')
  async login(
    @Body() loginDto: AdminLoginDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    // Simple hardcoded admin credentials for demo
    // In production, use proper authentication with hashed passwords
    const isValid = loginDto.username === 'admin' && loginDto.password === 'admin123';
    
    if (!isValid) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Invalid credentials',
      });
    }

    // Set admin session
    (request.session as any).adminAuthenticated = true;
    
    return response.json({
      message: 'Login successful',
      authenticated: true,
    });
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res() response: Response) {
    (request.session as any).adminAuthenticated = false;
    return response.json({ message: 'Logged out successfully' });
  }

  @Get('status')
  async getStatus(@Req() request: Request) {
    const session = request.session as any;
    return {
      authenticated: !!session?.adminAuthenticated,
    };
  }

  @Get('leads')
  @UseGuards(AdminGuard)
  async getLeads() {
    return this.applicationService.getAllLeads();
  }

  @Get('leads/:id')
  @UseGuards(AdminGuard)
  async getLeadById(@Req() request: Request) {
    const { id } = request.params;
    return this.applicationService.getLeadById(id);
  }
}