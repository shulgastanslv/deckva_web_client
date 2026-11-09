-- CreateEnum
CREATE TYPE "CreditBucket" AS ENUM ('PROMO', 'PLAN', 'TOPUP');

-- CreateEnum
CREATE TYPE "CreditLedgerKind" AS ENUM ('GRANT', 'SPEND', 'REFUND', 'ADJUSTMENT');

-- AlterTable User: AI credits
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditPromoBalance" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditPlanBalance" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditTopupBalance" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditPromoGrantedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CreditLedgerEntry" (
    "id" TEXT NOT NULL,
    "kind" "CreditLedgerKind" NOT NULL,
    "bucket" "CreditBucket" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "modelId" TEXT,
    "coraRunId" TEXT,
    "projectId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CreditLedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CreditLedgerEntry_userId_createdAt_idx" ON "CreditLedgerEntry"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "CreditLedgerEntry_coraRunId_idx" ON "CreditLedgerEntry"("coraRunId");

DO $$ BEGIN
  ALTER TABLE "CreditLedgerEntry"
    ADD CONSTRAINT "CreditLedgerEntry_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Drop Artifact (if present — was schema-only / unused in some envs)
ALTER TABLE "Project" DROP CONSTRAINT IF EXISTS "Project_artifact_fkey";
ALTER TABLE "Artifact" DROP CONSTRAINT IF EXISTS "Artifact_parentId_fkey";
ALTER TABLE "Artifact" DROP CONSTRAINT IF EXISTS "Artifact_projectId_fkey";
ALTER TABLE "Artifact" DROP CONSTRAINT IF EXISTS "Artifact_userId_fkey";
ALTER TABLE "Artifact" DROP CONSTRAINT IF EXISTS "Artifact_organizationId_fkey";
ALTER TABLE "Artifact" DROP CONSTRAINT IF EXISTS "Artifact_folderId_fkey";
DROP TABLE IF EXISTS "Artifact";
DROP TYPE IF EXISTS "ArtifactKind";
DROP TYPE IF EXISTS "ArtifactStatus";
