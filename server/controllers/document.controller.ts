import { Controller, Get, Param, HttpException, HttpStatus, Res, Logger } from '@nestjs/common'
import { Response } from 'express'
import { DocumentService } from '../services/document.service'

@Controller('api/documents')
export class DocumentController {
  private readonly logger = new Logger(DocumentController.name)
  
  constructor(private readonly documentService: DocumentService) {}

  @Get(':documentId')
  async getDocument(@Param('documentId') documentId: string, @Res() res: Response) {
    try {
      const { buffer, document } = await this.documentService.getDocument(documentId)
      
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="${document.name}.pdf"`)
      res.send(buffer)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Documents configuration not loaded') {
          throw new HttpException('Documents configuration not loaded', HttpStatus.INTERNAL_SERVER_ERROR)
        }
        if (error.message === 'Document not found') {
          throw new HttpException('Document not found', HttpStatus.NOT_FOUND)
        }
        if (error.message === 'Document file not found') {
          throw new HttpException('Document file not found', HttpStatus.NOT_FOUND)
        }
      }
      
      this.logger.error('Error serving document:', error)
      throw new HttpException('Failed to serve document', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get(':documentId/download')
  async downloadDocument(@Param('documentId') documentId: string, @Res() res: Response) {
    try {
      const { buffer, document } = await this.documentService.getDocument(documentId)
      
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${document.name}.pdf"`)
      res.send(buffer)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Documents configuration not loaded') {
          throw new HttpException('Documents configuration not loaded', HttpStatus.INTERNAL_SERVER_ERROR)
        }
        if (error.message === 'Document not found') {
          throw new HttpException('Document not found', HttpStatus.NOT_FOUND)
        }
        if (error.message === 'Document file not found') {
          throw new HttpException('Document file not found', HttpStatus.NOT_FOUND)
        }
      }
      
      this.logger.error('Error downloading document:', error)
      throw new HttpException('Failed to download document', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}