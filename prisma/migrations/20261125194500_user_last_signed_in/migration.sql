-- Track first/last OAuth sign-in for admin provisioning status.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastSignedInAt" TIMESTAMP(3);
