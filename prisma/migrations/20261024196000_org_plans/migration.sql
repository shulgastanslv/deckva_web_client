-- CreateEnum
CREATE TYPE "OrgPlan" AS ENUM ('starter', 'business', 'enterprise');

-- Drop invite code
DROP INDEX IF EXISTS "Organization_inviteCode_key";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "inviteCode";

-- Migrate plan column to enum
ALTER TABLE "Organization" ADD COLUMN "plan_new" "OrgPlan" NOT NULL DEFAULT 'starter';

UPDATE "Organization"
SET "plan_new" = CASE
  WHEN lower("plan") IN ('business', 'pro', 'team') THEN 'business'::"OrgPlan"
  WHEN lower("plan") IN ('enterprise', 'ent') THEN 'enterprise'::"OrgPlan"
  ELSE 'starter'::"OrgPlan"
END;

ALTER TABLE "Organization" DROP COLUMN "plan";
ALTER TABLE "Organization" RENAME COLUMN "plan_new" TO "plan";
