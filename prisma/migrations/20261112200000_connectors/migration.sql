-- Connectors: Google Drive + Threads OAuth accounts and analytics events

CREATE TYPE "ConnectorProvider" AS ENUM ('GOOGLE_DRIVE', 'THREADS');
CREATE TYPE "ConnectorStatus" AS ENUM ('DISCONNECTED', 'CONNECTED', 'ERROR', 'EXPIRED');
CREATE TYPE "ConnectorEventKind" AS ENUM ('CONNECT', 'DISCONNECT', 'REFRESH', 'SYNC', 'IMPORT', 'PUBLISH', 'ERROR', 'INSIGHTS');

CREATE TABLE "ConnectorAccount" (
    "id" TEXT NOT NULL,
    "provider" "ConnectorProvider" NOT NULL,
    "status" "ConnectorStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "externalAccountId" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accessTokenEnc" TEXT,
    "refreshTokenEnc" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "lastSyncedAt" TIMESTAMP(3),
    "connectedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ConnectorAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConnectorEvent" (
    "id" TEXT NOT NULL,
    "provider" "ConnectorProvider" NOT NULL,
    "kind" "ConnectorEventKind" NOT NULL,
    "label" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "connectorId" TEXT,

    CONSTRAINT "ConnectorEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ConnectorAccount_userId_provider_key" ON "ConnectorAccount"("userId", "provider");
CREATE INDEX "ConnectorAccount_userId_idx" ON "ConnectorAccount"("userId");
CREATE INDEX "ConnectorAccount_provider_status_idx" ON "ConnectorAccount"("provider", "status");

CREATE INDEX "ConnectorEvent_userId_createdAt_idx" ON "ConnectorEvent"("userId", "createdAt");
CREATE INDEX "ConnectorEvent_userId_provider_createdAt_idx" ON "ConnectorEvent"("userId", "provider", "createdAt");
CREATE INDEX "ConnectorEvent_connectorId_createdAt_idx" ON "ConnectorEvent"("connectorId", "createdAt");

ALTER TABLE "ConnectorAccount" ADD CONSTRAINT "ConnectorAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConnectorEvent" ADD CONSTRAINT "ConnectorEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConnectorEvent" ADD CONSTRAINT "ConnectorEvent_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "ConnectorAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
