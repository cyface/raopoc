import { Injectable } from '@nestjs/common'
import * as fs from 'fs/promises'
import * as path from 'path'
import { randomUUID } from 'crypto'
import { EncryptionService } from './encryption.service'
import { ConfigService } from './config.service'

@Injectable()
export class ApplicationService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService
  ) {}

  async createApplication(applicationData: any, userAgent?: string, ipAddress?: string) {
    const applicationId = randomUUID()
    
    const lastName = applicationData.customerInfo?.lastName || 'Unknown'
    const sanitizedLastName = lastName.replace(/[^a-zA-Z0-9]/g, '')
    const filename = `${applicationId}-${sanitizedLastName}.json`
    
    const encryptedData = await this.encryptionService.encryptSensitiveFields(applicationData)
    
    const application = {
      id: applicationId,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      data: encryptedData,
      metadata: {
        userAgent,
        ipAddress,
        submissionSource: 'web-onboarding'
      }
    }
    
    const applicationsDir = path.join(process.cwd(), '..', 'applications')
    await fs.mkdir(applicationsDir, { recursive: true })
    
    const filePath = path.join(applicationsDir, filename)
    await fs.writeFile(filePath, JSON.stringify(application, null, 2))
    
    console.log(`✅ Application saved: ${filename}`)
    console.log(`📧 Mock confirmation email sent to: ${applicationData.customerInfo?.email}`)
    
    return {
      applicationId,
      status: 'submitted',
      message: 'Application submitted successfully',
      filename
    }
  }

  async getApplication(id: string) {
    const applicationsDir = path.join(process.cwd(), '..', 'applications')
    
    const files = await fs.readdir(applicationsDir)
    const applicationFile = files.find(file => file.startsWith(id))
    
    if (!applicationFile) {
      return null
    }
    
    const filePath = path.join(applicationsDir, applicationFile)
    const applicationData = await fs.readFile(filePath, 'utf-8')
    const application = JSON.parse(applicationData)
    
    if (application.data) {
      application.data = await this.encryptionService.decryptSensitiveFields(application.data)
    }
    
    return application
  }

  async performCreditCheck(ssn: string) {
    const badSSNConfig = this.configService.getBadSSNs()
    
    if (!badSSNConfig) {
      throw new Error('Credit check service unavailable')
    }

    const normalizedSSN = ssn.replace(/[^0-9]/g, '')
    const badSSNs = badSSNConfig.badSSNs.map(badSSN => badSSN.replace(/[^0-9]/g, ''))

    const isOnBadList = badSSNs.includes(normalizedSSN)

    console.log(`🔍 Credit check performed for SSN: ${ssn.substring(0, 3)}-XX-XXXX`)
    console.log(`📊 Credit check result: ${isOnBadList ? 'REQUIRES_VERIFICATION' : 'PASSED'}`)

    return {
      status: isOnBadList ? 'requires_verification' : 'approved',
      requiresVerification: isOnBadList,
      message: isOnBadList 
        ? 'Additional verification required - a representative will contact you'
        : 'Credit check passed'
    }
  }
}