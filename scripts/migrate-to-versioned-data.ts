#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface VersionedCustomerInfo {
  version: number
  timestamp: string
  data: any
  source?: string
  changeReason?: string
}

interface VersionedIdentificationInfo {
  version: number
  timestamp: string
  data: any
  source?: string
  changeReason?: string
}

async function migrateToVersionedData() {
  console.log('Starting migration to versioned data...')
  
  try {
    // First, add the new columns to the database
    await prisma.$executeRaw`
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS "customerInfoHistory" JSONB DEFAULT '[]'::jsonb
    `
    
    await prisma.$executeRaw`
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS "identificationInfoHistory" JSONB DEFAULT '[]'::jsonb
    `
    
    console.log('Added new versioned columns')
    
    // Get all leads with existing customer or identification info
    const leadsWithData = await prisma.lead.findMany({
      where: {
        OR: [
          { customerInfo: { not: null } },
          { identificationInfo: { not: null } }
        ]
      },
      select: {
        id: true,
        customerInfo: true,
        identificationInfo: true,
        createdAt: true
      }
    })
    
    console.log(`Found ${leadsWithData.length} leads with existing data to migrate`)
    
    // Migrate each lead
    for (const lead of leadsWithData) {
      const updates: any = {}
      
      // Migrate customer info
      if (lead.customerInfo) {
        const versionedCustomerInfo: VersionedCustomerInfo = {
          version: 1,
          timestamp: lead.createdAt.toISOString(),
          data: lead.customerInfo,
          source: 'legacy_migration',
          changeReason: 'migrated_from_single_field'
        }
        updates.customerInfoHistory = [versionedCustomerInfo]
      }
      
      // Migrate identification info
      if (lead.identificationInfo) {
        const versionedIdentificationInfo: VersionedIdentificationInfo = {
          version: 1,
          timestamp: lead.createdAt.toISOString(),
          data: lead.identificationInfo,
          source: 'legacy_migration',
          changeReason: 'migrated_from_single_field'
        }
        updates.identificationInfoHistory = [versionedIdentificationInfo]
      }
      
      // Update the lead with versioned data
      if (Object.keys(updates).length > 0) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: updates
        })
        console.log(`Migrated lead ${lead.id}`)
      }
    }
    
    console.log('Migration completed successfully!')
    console.log('You can now safely remove the old customerInfo and identificationInfo columns')
    
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateToVersionedData()
  .then(() => {
    console.log('Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration script failed:', error)
    process.exit(1)
  })

export { migrateToVersionedData }