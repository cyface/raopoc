-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REQUIRES_VERIFICATION', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('CHECKING', 'SAVINGS', 'MONEY_MARKET');

-- CreateEnum
CREATE TYPE "CreditStatus" AS ENUM ('APPROVED', 'REQUIRES_VERIFICATION', 'PENDING', 'ERROR');

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'DRAFT',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "completedSteps" INTEGER[],
    "financialInstitution" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "theme" TEXT,
    "selectedProducts" "ProductType"[],
    "customerInfo" JSONB,
    "identificationInfo" JSONB,
    "creditCheckStatus" "CreditStatus",
    "requiresVerification" BOOLEAN NOT NULL DEFAULT false,
    "creditCheckMessage" TEXT,
    "creditCheckAt" TIMESTAMP(3),
    "allDocumentsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "submissionSource" TEXT NOT NULL DEFAULT 'web-onboarding',
    "browserFingerprint" TEXT,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "devStep" INTEGER,
    "mockScenario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_acceptances" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "document_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_sessionId_key" ON "leads"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "document_acceptances_leadId_documentId_key" ON "document_acceptances"("leadId", "documentId");

-- AddForeignKey
ALTER TABLE "document_acceptances" ADD CONSTRAINT "document_acceptances_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
