-- OAuth-only auth: no email confirmation column.
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerified";
