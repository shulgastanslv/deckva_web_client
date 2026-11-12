import { decryptSecret, encryptSecret } from "@/lib/connectors/crypto";
import {
  refreshGoogleDriveToken,
} from "@/lib/connectors/google-drive";
import { toPrismaProvider } from "@/lib/connectors/map";
import { prisma } from "@/lib/prisma";

const REFRESH_SKEW_MS = 60_000;

export type GoogleDriveAuthContext = {
  accountId: string;
  accessToken: string;
};

/**
 * Load a connected Drive account and refresh the access token when expired.
 */
export async function resolveGoogleDriveAccess(
  userId: string,
): Promise<GoogleDriveAuthContext | null> {
  const account = await prisma.connectorAccount.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: toPrismaProvider("google-drive"),
      },
    },
  });

  if (!account || account.status !== "CONNECTED" || !account.accessTokenEnc) {
    return null;
  }

  const expiresAt = account.tokenExpiresAt?.getTime() ?? null;
  const needsRefresh =
    expiresAt != null && expiresAt - Date.now() < REFRESH_SKEW_MS;

  if (!needsRefresh) {
    return {
      accountId: account.id,
      accessToken: decryptSecret(account.accessTokenEnc),
    };
  }

  if (!account.refreshTokenEnc) {
    await prisma.connectorAccount.update({
      where: { id: account.id },
      data: {
        status: "EXPIRED",
        errorMessage: "Google Drive session expired. Reconnect the account.",
      },
    });
    return null;
  }

  try {
    const refreshed = await refreshGoogleDriveToken(
      decryptSecret(account.refreshTokenEnc),
    );
    const tokenExpiresAt =
      typeof refreshed.expires_in === "number"
        ? new Date(Date.now() + refreshed.expires_in * 1000)
        : null;

    await prisma.connectorAccount.update({
      where: { id: account.id },
      data: {
        accessTokenEnc: encryptSecret(refreshed.access_token),
        tokenExpiresAt,
        status: "CONNECTED",
        errorMessage: null,
        lastSyncedAt: new Date(),
      },
    });

    return {
      accountId: account.id,
      accessToken: refreshed.access_token,
    };
  } catch {
    await prisma.connectorAccount.update({
      where: { id: account.id },
      data: {
        status: "EXPIRED",
        errorMessage: "Google Drive session expired. Reconnect the account.",
      },
    });
    return null;
  }
}
