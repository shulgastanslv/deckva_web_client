-- AlterTable
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "inviteCode" TEXT;

-- Backfill missing invite codes
UPDATE "Organization"
SET "inviteCode" = md5(random()::text || id || clock_timestamp()::text)
WHERE "inviteCode" IS NULL;

-- Enforce not null + unique
ALTER TABLE "Organization" ALTER COLUMN "inviteCode" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Organization_inviteCode_key" ON "Organization"("inviteCode");
