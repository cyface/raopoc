import { Controller, Post, Get, Body, Param, HttpException, HttpStatus, Req, Logger } from '@nestjs/common'
import { Request } from 'express'
import { ApplicationService } from '../services/application.service'
import { CreateApplicationDto, CreditCheckDto } from '../dto/application.dto'

@Controller('api')
export class ApplicationController {
  private readonly logger = new Logger(ApplicationController.name)
  
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('applications')
  async createApplication(@Body() createApplicationDto: CreateApplicationDto, @Req() req: Request) {
    try {
      const result = await this.applicationService.createApplication(
        createApplicationDto,
        req.headers['user-agent'],
        req.ip || req.socket.remoteAddress
      )
      return result
    } catch (error) {
      this.logger.error('Error saving application:', error)
      throw new HttpException(
        {
          error: 'Failed to save application',
          message: 'Please try again later'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Get('applications/:id')
  async getApplication(@Param('id') id: string) {
    try {
      const application = await this.applicationService.getApplication(id)
      
      if (!application) {
        throw new HttpException('Application not found', HttpStatus.NOT_FOUND)
      }
      
      return application
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      this.logger.error('Error retrieving application:', error)
      throw new HttpException('Failed to retrieve application', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Post('credit-check')
  async performCreditCheck(@Body() creditCheckDto: CreditCheckDto) {
    try {
      const result = await this.applicationService.performCreditCheck(creditCheckDto.ssn)
      return result
    } catch (error) {
      this.logger.error('Error performing credit check:', error)
      throw new HttpException(
        {
          error: 'Credit check failed',
          message: 'Please try again later'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }
}