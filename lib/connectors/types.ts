export const CONNECTOR_PROVIDERS = ["google-drive", "threads"] as const;

export type ConnectorProviderId = (typeof CONNECTOR_PROVIDERS)[number];

export type ConnectorStatusId =
  | "disconnected"
  | "connected"
  | "error"
  | "expired";

export type ConnectorEventKindId =
  | "connect"
  | "disconnect"
  | "refresh"
  | "sync"
  | "import"
  | "publish"
  | "error"
  | "insights";

export type ConnectorPublic = {
  id: ConnectorProviderId;
  status: ConnectorStatusId;
  displayName: string | null;
  avatarUrl: string | null;
  externalAccountId: string | null;
  scopes: string[];
  connectedAt: string | null;
  lastSyncedAt: string | null;
  errorMessage: string | null;
  accountId: string | null;
};

export type ConnectorDayBucket = {
  date: string;
  count: number;
};

export type ConnectorAnalytics = {
  connectedCount: number;
  eventsLast7Days: number;
  eventsLast30Days: number;
  byProvider: Record<
    ConnectorProviderId,
    {
      connects: number;
      disconnects: number;
      imports: number;
      publishes: number;
      insights: number;
      errors: number;
      lastEventAt: string | null;
    }
  >;
  daily: ConnectorDayBucket[];
  recent: Array<{
    id: string;
    provider: ConnectorProviderId;
    kind: ConnectorEventKindId;
    label: string | null;
    createdAt: string;
  }>;
};
