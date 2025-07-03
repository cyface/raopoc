-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "customerInfoHistory" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "identificationInfoHistory" JSONB[] DEFAULT ARRAY[]::JSONB[];
