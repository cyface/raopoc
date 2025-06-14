import { Injectable, Logger } from '@nestjs/common'
import * as fs from 'fs/promises'
import * as path from 'path'
import { ConfigService } from './config.service'

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name)
  
  constructor(private readonly configService: ConfigService) {}

  async getDocument(documentId: string): Promise<{ buffer: Buffer; document: any }> {
    const documentsConfig = this.configService.getDocuments()
    
    if (!documentsConfig) {
      throw new Error('Documents configuration not loaded')
    }
    
    const document = documentsConfig.documents.find((doc: { id: string; name: string }) => doc.id === documentId)
    if (!document) {
      throw new Error('Document not found')
    }
    
    const pdfPath = path.join(process.cwd(), '..', 'public', 'documents', `${documentId}.pdf`)
    
    try {
      await fs.access(pdfPath)
      const pdfBuffer = await fs.readFile(pdfPath)
      return { buffer: pdfBuffer, document }
    } catch (error) {
      this.logger.error(`Error serving document ${documentId}:`, error)
      throw new Error('Document file not found')
    }
  }
}