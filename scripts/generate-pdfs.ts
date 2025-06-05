#!/usr/bin/env tsx

import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface Document {
  id: string
  name: string
  description: string
  url: string
  required: boolean
  category: string
}

interface DocumentConfig {
  showAcceptAllButton: boolean
  documents: Document[]
  rules: unknown[]
}

async function generatePDF(document: Document, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    })

    // Create write stream
    const stream = fs.createWriteStream(outputPath)
    doc.pipe(stream)

    // Add title
    doc.fontSize(20)
       .text(document.name, { align: 'center' })
       .moveDown()

    // Add description
    doc.fontSize(12)
       .text(document.description, { align: 'left' })
       .moveDown()

    // Add placeholder content
    doc.text('This is a placeholder document for demonstration purposes.', { align: 'left' })
       .moveDown()
    
    doc.text('In a real banking application, this document would contain:', { align: 'left' })
       .moveDown()

    // Add bullet points based on document type
    const bulletPoints = getBulletPoints(document)
    bulletPoints.forEach(point => {
      doc.text(`• ${point}`, { indent: 20 })
    })

    doc.moveDown()
       .text('Generated on: ' + new Date().toLocaleDateString(), { align: 'right' })

    // Finalize the PDF
    doc.end()

    stream.on('finish', resolve)
    stream.on('error', reject)
  })
}

function getBulletPoints(document: Document): string[] {
  switch (document.category) {
    case 'terms':
      return [
        'Terms and conditions for account usage',
        'Rights and responsibilities of the account holder',
        'Bank policies and procedures',
        'Dispute resolution process'
      ]
    case 'privacy':
      return [
        'How personal information is collected',
        'How data is used and shared',
        'Customer privacy rights',
        'Data security measures'
      ]
    case 'agreement':
      return [
        'Account features and benefits',
        'Interest rates and fees',
        'Transaction limits and restrictions',
        'Account maintenance requirements'
      ]
    case 'disclosure':
      return [
        'Fee schedules and charges',
        'Important account disclosures',
        'Regulatory compliance information',
        'Rate and fee change notifications'
      ]
    case 'notice':
      return [
        'Important regulatory notices',
        'Required customer disclosures',
        'Compliance requirements',
        'Customer obligations'
      ]
    default:
      return [
        'Important banking information',
        'Customer responsibilities',
        'Account terms and conditions'
      ]
  }
}

async function main() {
  try {
    // Read the documents configuration
    const configPath = path.join(__dirname, '..', 'config', 'documents.json')
    const configData = fs.readFileSync(configPath, 'utf-8')
    const config: DocumentConfig = JSON.parse(configData)

    // Ensure output directory exists
    const outputDir = path.join(__dirname, '..', 'public', 'documents')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    console.log('Generating PDF documents...')
    
    // Generate PDFs for each document
    for (const document of config.documents) {
      const filename = `${document.id}.pdf`
      const outputPath = path.join(outputDir, filename)
      
      console.log(`Generating: ${filename}`)
      await generatePDF(document, outputPath)
      console.log(`✓ Generated: ${filename}`)
    }

    console.log(`\n✅ Successfully generated ${config.documents.length} PDF documents`)
    console.log(`📁 Documents saved to: ${outputDir}`)
    
  } catch (error) {
    console.error('❌ Error generating PDFs:', error)
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)