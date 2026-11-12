import { encryptSecret } from "@/lib/connectors/crypto";
import {
  fromPrismaEventKind,
  fromPrismaProvider,
  fromPrismaStatus,
  toPrismaProvider,
} from "@/lib/connectors/map";
import type {
  ConnectorAnalytics,
  ConnectorProviderId,
  ConnectorPublic,
} from "@/lib/connectors/types";
import { CONNECTOR_PROVIDERS } from "@/lib/connectors/types";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { ConnectorEventKind } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

function emptyProviderStats() {
  return {
    connects: 0,
    disconnects: 0,
    imports: 0,
    publishes: 0,
    insights: 0,
    errors: 0,
    lastEventAt: null as string | null,
  };
}

export async function listConnectorPublic(
  userId: string,
): Promise<ConnectorPublic[]> {
  const rows = await prisma.connectorAccount.findMany({
    where: { userId },
  });
  const byProvider = new Map(
    rows.map((row) => [fromPrismaProvider(row.provider), row] as const),
  );

  return CONNECTOR_PROVIDERS.map((id) => {
    const row = byProvider.get(id);
    if (!row) {
      return {
        id,
        status: "disconnected" as const,
        displayName: null,
        avatarUrl: null,
        externalAccountId: null,
        scopes: [],
        connectedAt: null,
        lastSyncedAt: null,
        errorMessage: null,
        accountId: null,
      };
    }
    return {
      id,
      status: fromPrismaStatus(row.status),
      displayName: row.displayName,
      avatarUrl: row.avatarUrl,
      externalAccountId: row.externalAccountId,
      scopes: row.scopes,
      connectedAt: row.connectedAt?.toISOString() ?? null,
      lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
      errorMessage: row.errorMessage,
      accountId: row.id,
    };
  });
}

export async function recordConnectorEvent(input: {
  userId: string;
  provider: ConnectorProviderId;
  kind: ConnectorEventKind;
  label?: string;
  meta?: Record<string, unknown>;
  connectorId?: string | null;
}) {
  return prisma.connectorEvent.create({
    data: {
      userId: input.userId,
      provider: toPrismaProvider(input.provider),
      kind: input.kind,
      label: input.label,
      meta: (input.meta ?? undefined) as Prisma.InputJsonValue | undefined,
      connectorId: input.connectorId ?? undefined,
    },
  });
}

export async function upsertConnectedAccount(input: {
  userId: string;
  provider: ConnectorProviderId;
  externalAccountId: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  scopes: string[];
  accessToken: string;
  refreshToken?: string | null;
  expiresInSeconds?: number | null;
  metadata?: Record<string, unknown>;
}) {
  const tokenExpiresAt =
    typeof input.expiresInSeconds === "number"
      ? new Date(Date.now() + input.expiresInSeconds * 1000)
      : null;

  const account = await prisma.connectorAccount.upsert({
    where: {
      userId_provider: {
        userId: input.userId,
        provider: toPrismaProvider(input.provider),
      },
    },
    create: {
      userId: input.userId,
      provider: toPrismaProvider(input.provider),
      status: "CONNECTED",
      externalAccountId: input.externalAccountId,
      displayName: input.displayName ?? null,
      avatarUrl: input.avatarUrl ?? null,
      scopes: input.scopes,
      accessTokenEnc: encryptSecret(input.accessToken),
      refreshTokenEnc: input.refreshToken
        ? encryptSecret(input.refreshToken)
        : null,
      tokenExpiresAt,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      connectedAt: new Date(),
      lastSyncedAt: new Date(),
      errorMessage: null,
    },
    update: {
      status: "CONNECTED",
      externalAccountId: input.externalAccountId,
      displayName: input.displayName ?? null,
      avatarUrl: input.avatarUrl ?? null,
      scopes: input.scopes,
      accessTokenEnc: encryptSecret(input.accessToken),
      refreshTokenEnc: input.refreshToken
        ? encryptSecret(input.refreshToken)
        : undefined,
      tokenExpiresAt,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      connectedAt: new Date(),
      lastSyncedAt: new Date(),
      errorMessage: null,
    },
  });

  await recordConnectorEvent({
    userId: input.userId,
    provider: input.provider,
    kind: "CONNECT",
    label: input.displayName ?? input.externalAccountId,
    connectorId: account.id,
    meta: { scopes: input.scopes },
  });

  return account;
}

export async function disconnectConnector(
  userId: string,
  provider: ConnectorProviderId,
) {
  const existing = await prisma.connectorAccount.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: toPrismaProvider(provider),
      },
    },
  });
  if (!existing) return null;

  const updated = await prisma.connectorAccount.update({
    where: { id: existing.id },
    data: {
      status: "DISCONNECTED",
      accessTokenEnc: null,
      refreshTokenEnc: null,
      tokenExpiresAt: null,
      errorMessage: null,
    },
  });

  await recordConnectorEvent({
    userId,
    provider,
    kind: "DISCONNECT",
    label: existing.displayName ?? existing.externalAccountId ?? undefined,
    connectorId: existing.id,
  });

  return updated;
}

export async function getConnectorAnalytics(
  userId: string,
): Promise<ConnectorAnalytics> {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60_000);
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60_000);

  const [accounts, events30, recent] = await Promise.all([
    prisma.connectorAccount.findMany({ where: { userId } }),
    prisma.connectorEvent.findMany({
      where: { userId, createdAt: { gte: since30 } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.connectorEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const byProvider = Object.fromEntries(
    CONNECTOR_PROVIDERS.map((id) => [id, emptyProviderStats()]),
  ) as ConnectorAnalytics["byProvider"];

  for (const event of events30) {
    const provider = fromPrismaProvider(event.provider);
    const bucket = byProvider[provider];
    const kind = fromPrismaEventKind(event.kind);
    if (kind === "connect") bucket.connects += 1;
    if (kind === "disconnect") bucket.disconnects += 1;
    if (kind === "import" || kind === "sync") bucket.imports += 1;
    if (kind === "publish") bucket.publishes += 1;
    if (kind === "insights") bucket.insights += 1;
    if (kind === "error") bucket.errors += 1;
    bucket.lastEventAt = event.createdAt.toISOString();
  }

  const dayMap = new Map<string, number>();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    dayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const event of events30) {
    if (event.createdAt < since7) continue;
    const key = event.createdAt.toISOString().slice(0, 10);
    if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
  }

  return {
    connectedCount: accounts.filter((a) => a.status === "CONNECTED").length,
    eventsLast7Days: events30.filter((e) => e.createdAt >= since7).length,
    eventsLast30Days: events30.length,
    byProvider,
    daily: [...dayMap.entries()].map(([date, count]) => ({ date, count })),
    recent: recent.map((event) => ({
      id: event.id,
      provider: fromPrismaProvider(event.provider),
      kind: fromPrismaEventKind(event.kind),
      label: event.label,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}
