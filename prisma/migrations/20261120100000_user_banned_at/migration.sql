-- Soft ban: blocks sign-in and studio access while keeping the account row.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bannedAt" TIMESTAMP(3);
