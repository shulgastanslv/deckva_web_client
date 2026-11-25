-- Google-only auth: drop password hashes and email verify/reset tokens.
DROP TABLE IF EXISTS "AuthToken";
ALTER TABLE "User" DROP COLUMN IF EXISTS "password";
