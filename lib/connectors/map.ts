import type {
  ConnectorEventKind,
  ConnectorProvider,
  ConnectorStatus,
} from "@/lib/generated/prisma/enums";
import type {
  ConnectorEventKindId,
  ConnectorProviderId,
  ConnectorStatusId,
} from "@/lib/connectors/types";

export function toPrismaProvider(
  id: ConnectorProviderId,
): ConnectorProvider {
  return id === "threads" ? "THREADS" : "GOOGLE_DRIVE";
}

export function fromPrismaProvider(
  provider: ConnectorProvider,
): ConnectorProviderId {
  return provider === "THREADS" ? "threads" : "google-drive";
}

export function fromPrismaStatus(status: ConnectorStatus): ConnectorStatusId {
  switch (status) {
    case "CONNECTED":
      return "connected";
    case "ERROR":
      return "error";
    case "EXPIRED":
      return "expired";
    default:
      return "disconnected";
  }
}

export function fromPrismaEventKind(
  kind: ConnectorEventKind,
): ConnectorEventKindId {
  switch (kind) {
    case "CONNECT":
      return "connect";
    case "DISCONNECT":
      return "disconnect";
    case "REFRESH":
      return "refresh";
    case "SYNC":
      return "sync";
    case "IMPORT":
      return "import";
    case "PUBLISH":
      return "publish";
    case "INSIGHTS":
      return "insights";
    default:
      return "error";
  }
}

export function isConnectorProviderId(value: string): value is ConnectorProviderId {
  return value === "google-drive" || value === "threads";
}
