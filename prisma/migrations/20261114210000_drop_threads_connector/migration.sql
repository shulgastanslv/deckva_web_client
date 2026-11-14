-- Remove Threads connector accounts/events, then drop THREADS from ConnectorProvider.

DELETE FROM "ConnectorEvent" WHERE provider = 'THREADS';
DELETE FROM "ConnectorAccount" WHERE provider = 'THREADS';

ALTER TYPE "ConnectorProvider" RENAME TO "ConnectorProvider_old";
CREATE TYPE "ConnectorProvider" AS ENUM ('GOOGLE_DRIVE');

ALTER TABLE "ConnectorAccount"
  ALTER COLUMN provider TYPE "ConnectorProvider"
  USING (provider::text::"ConnectorProvider");

ALTER TABLE "ConnectorEvent"
  ALTER COLUMN provider TYPE "ConnectorProvider"
  USING (provider::text::"ConnectorProvider");

DROP TYPE "ConnectorProvider_old";
