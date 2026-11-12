-- Credits wallet: plan + topup balances, ledger, CREDITS payment kind.

CREATE TYPE "CreditBucket" AS ENUM ('PLAN', 'TOPUP');
CREATE TYPE "CreditLedgerKind" AS ENUM ('GRANT', 'SPEND', 'REFUND', 'ADJUSTMENT');

ALTER TYPE "BillingPaymentKind" ADD VALUE IF NOT EXISTS 'CREDITS';

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "creditPlanBalance" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "creditTopupBalance" INTEGER NOT NULL DEFAULT 0;

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

CREATE INDEX IF NOT EXISTS "CreditLedgerEntry_userId_createdAt_idx"
  ON "CreditLedgerEntry"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "CreditLedgerEntry_coraRunId_idx"
  ON "CreditLedgerEntry"("coraRunId");

DO $$ BEGIN
  ALTER TABLE "CreditLedgerEntry"
    ADD CONSTRAINT "CreditLedgerEntry_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Existing active Pro subscribers get one monthly plan grant.
UPDATE "User"
SET "creditPlanBalance" = 50
WHERE "subscriptionStatus" = 'ACTIVE'
  AND "creditPlanBalance" = 0
  AND "creditTopupBalance" = 0;
