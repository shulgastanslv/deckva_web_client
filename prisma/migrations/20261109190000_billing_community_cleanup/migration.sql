-- Billing: drop credit wallet, add free generation counter, rename provider customer id.
-- Community: replace Template catalogue with public Project fields.
-- Cleanup: drop ProjectAnnotation / Template if present.

-- ---- Credits → free generations ----
DROP TABLE IF EXISTS "CreditLedgerEntry";
DROP TYPE IF EXISTS "CreditLedgerKind";
DROP TYPE IF EXISTS "CreditBucket";

ALTER TABLE "User"
  DROP COLUMN IF EXISTS "creditPromoBalance",
  DROP COLUMN IF EXISTS "creditPlanBalance",
  DROP COLUMN IF EXISTS "creditTopupBalance",
  DROP COLUMN IF EXISTS "creditPromoGrantedAt";

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "freeGenerationsUsed" INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'bepaidCustomerId'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'paymentCustomerId'
  ) THEN
    ALTER TABLE "User" RENAME COLUMN "bepaidCustomerId" TO "paymentCustomerId";
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'paymentCustomerId'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "paymentCustomerId" TEXT;
  END IF;
END $$;

-- ---- Community on Project ----
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CommunityStatus') THEN
    CREATE TYPE "CommunityStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');
  END IF;
END $$;

ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "communityStatus" "CommunityStatus" NOT NULL DEFAULT 'DRAFT';

CREATE INDEX IF NOT EXISTS "Project_communityStatus_publishedAt_idx"
  ON "Project"("communityStatus", "publishedAt");
CREATE INDEX IF NOT EXISTS "Project_isPublic_communityStatus_idx"
  ON "Project"("isPublic", "communityStatus");

-- ---- Drop legacy Template / notes ----
DROP TABLE IF EXISTS "Template";
DROP TYPE IF EXISTS "TemplateStatus";
DROP TABLE IF EXISTS "ProjectAnnotation";
