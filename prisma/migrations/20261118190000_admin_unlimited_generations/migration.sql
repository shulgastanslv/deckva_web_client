-- Explicit DB flag for unlimited generations; backfill current platform admins.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "unlimitedGenerations" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User"
SET "unlimitedGenerations" = true
WHERE "role" = 'ADMIN' AND "unlimitedGenerations" = false;
