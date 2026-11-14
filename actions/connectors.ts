"use server";

import { createMediaAsset, type MediaAssetDTO } from "@/actions/assets";
import { resolveGoogleDriveAccess } from "@/lib/connectors/google-drive-account";
import {
  downloadGoogleDriveFile,
  listGoogleDriveImages,
  type GoogleDriveImageFile,
} from "@/lib/connectors/google-drive";
import {
  disconnectConnector,
  getConnectorAnalytics,
  listConnectorPublic,
  recordConnectorEvent,
} from "@/lib/connectors/store";
import type {
  ConnectorAnalytics,
  ConnectorProviderId,
  ConnectorPublic,
} from "@/lib/connectors/types";
import { isConnectorProviderId } from "@/lib/connectors/map";
import { requireUserId } from "@/lib/auth/session";
import { messages } from "@/lib/messages";
import { prisma } from "@/lib/prisma";

type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

export async function listConnectors(): Promise<
  ActionResult<{ connectors: ConnectorPublic[] }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    const connectors = await listConnectorPublic(userId);
    return { success: true, connectors };
  } catch (err) {
    console.error("listConnectors error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function getConnectorsAnalytics(): Promise<
  ActionResult<{ analytics: ConnectorAnalytics }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    const analytics = await getConnectorAnalytics(userId);
    return { success: true, analytics };
  } catch (err) {
    console.error("getConnectorsAnalytics error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function disconnectConnectorAction(
  provider: string,
): Promise<ActionResult<{ connectors: ConnectorPublic[] }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    if (!isConnectorProviderId(provider)) {
      return { success: false, error: messages.errors.generic };
    }
    await disconnectConnector(userId, provider);
    const connectors = await listConnectorPublic(userId);
    return { success: true, connectors };
  } catch (err) {
    console.error("disconnectConnectorAction error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function listGoogleDriveFilesAction(input?: {
  query?: string;
  pageToken?: string;
}): Promise<
  ActionResult<{
    connected: boolean;
    files: GoogleDriveImageFile[];
    nextPageToken: string | null;
  }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const auth = await resolveGoogleDriveAccess(userId);
    if (!auth) {
      return {
        success: true,
        connected: false,
        files: [],
        nextPageToken: null,
      };
    }

    const listed = await listGoogleDriveImages(auth.accessToken, {
      query: input?.query,
      pageToken: input?.pageToken,
    });

    await prisma.connectorAccount.update({
      where: { id: auth.accountId },
      data: { lastSyncedAt: new Date() },
    });

    return {
      success: true,
      connected: true,
      files: listed.files,
      nextPageToken: listed.nextPageToken,
    };
  } catch (err) {
    console.error("listGoogleDriveFilesAction error:", err);
    return { success: false, error: messages.errors.loadAssets };
  }
}

/**
 * Download a Drive image into the MediaAsset library (data URL).
 * Client should resize oversized files via the media proxy before calling this
 * when the raw Drive file exceeds the library size cap.
 */
export async function importGoogleDriveFileAction(input: {
  fileId: string;
  /** Optional pre-resized data URL from the client. */
  dataUrl?: string;
  name?: string;
  tags?: string[];
}): Promise<ActionResult<{ asset: MediaAssetDTO }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const fileId = input.fileId?.trim();
    if (!fileId) return { success: false, error: messages.errors.generic };

    const auth = await resolveGoogleDriveAccess(userId);
    if (!auth) {
      return { success: false, error: "Google Drive is not connected" };
    }

    let dataUrl = input.dataUrl?.trim() ?? "";
    let name = input.name?.trim() || "";
    let width: number | null = null;
    let height: number | null = null;

    if (!dataUrl.startsWith("data:image/")) {
      const downloaded = await downloadGoogleDriveFile(auth.accessToken, fileId);
      dataUrl = `data:${downloaded.mimeType};base64,${downloaded.bytes.toString("base64")}`;
      if (!name) name = downloaded.name.replace(/\.[^.]+$/, "") || downloaded.name;
    }

    const created = await createMediaAsset({
      name: name || "Drive image",
      dataUrl,
      tags: ["google-drive", ...(input.tags ?? [])],
      width,
      height,
    });
    if (created.success === false) return created;

    await recordConnectorEvent({
      userId,
      provider: "google-drive",
      kind: "IMPORT",
      label: created.asset.name,
      connectorId: auth.accountId,
      meta: { fileId, assetId: created.asset.id },
    });

    await prisma.connectorAccount.update({
      where: { id: auth.accountId },
      data: { lastSyncedAt: new Date() },
    });

    return { success: true, asset: created.asset };
  } catch (err) {
    console.error("importGoogleDriveFileAction error:", err);
    return { success: false, error: messages.errors.saveAsset };
  }
}

export type { ConnectorProviderId, GoogleDriveImageFile };
