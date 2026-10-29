-- Remove organization invite system
DROP INDEX IF EXISTS "Organization_inviteCode_key";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "inviteCode";
