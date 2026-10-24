-- Add boolean upgrade flag; migrate paid enum plans into it.
ALTER TABLE "Organization" ADD COLUMN "isUpgrade" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Organization"
SET "isUpgrade" = true
WHERE "plan"::text IN ('business', 'enterprise');

ALTER TABLE "Organization" DROP COLUMN "plan";

DROP TYPE "OrgPlan";
