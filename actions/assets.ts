"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { messages } from "@/lib/messages";
import { prisma } from "@/lib/prisma";

export type MediaAssetDTO = {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
  tags: string[];
  width: number | null;
  height: number | null;
  bytes: number | null;
  createdAt: string;
  updatedAt: string;
};

type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

const MAX_ASSETS = 120;
const MAX_BYTES = 2_500_000;
const MAX_NAME = 80;
const MAX_TAG = 32;
const MAX_TAGS = 12;

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const cleaned = tags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase().slice(0, MAX_TAG))
    .filter(Boolean);
  return Array.from(new Set(cleaned)).slice(0, MAX_TAGS);
}

function toDto(row: {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
  tags: string[];
  width: number | null;
  height: number | null;
  bytes: number | null;
  createdAt: Date;
  updatedAt: Date;
}): MediaAssetDTO {
  return {
    id: row.id,
    name: row.name,
    dataUrl: row.dataUrl,
    mimeType: row.mimeType,
    tags: row.tags,
    width: row.width,
    height: row.height,
    bytes: row.bytes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function estimateBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.ceil((b64.length * 3) / 4);
}

function mimeFromDataUrl(dataUrl: string): string {
  const match = /^data:([^;]+);/i.exec(dataUrl);
  return match?.[1] || "image/png";
}

export async function listMediaAssets(input?: {
  query?: string;
  tag?: string;
}): Promise<ActionResult<{ assets: MediaAssetDTO[]; tags: string[] }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const query = input?.query?.trim().toLowerCase() ?? "";
    const tag = input?.tag?.trim().toLowerCase() ?? "";

    const rows = await prisma.mediaAsset.findMany({
      where: {
        userId,
        ...(tag ? { tags: { has: tag } } : {}),
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { tags: { has: query } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: MAX_ASSETS,
    });

    const allTags = await prisma.mediaAsset.findMany({
      where: { userId },
      select: { tags: true },
      take: MAX_ASSETS,
    });
    const tagSet = new Set<string>();
    for (const row of allTags) for (const t of row.tags) tagSet.add(t);

    return {
      success: true,
      assets: rows.map(toDto),
      tags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)),
    };
  } catch (err) {
    console.error("listMediaAssets:", err);
    return { success: false, error: messages.errors.loadAssets };
  }
}

export async function createMediaAsset(input: {
  name: string;
  dataUrl: string;
  tags?: string[];
  width?: number | null;
  height?: number | null;
}): Promise<ActionResult<{ asset: MediaAssetDTO }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const dataUrl = input.dataUrl?.trim() ?? "";
    if (!dataUrl.startsWith("data:image/")) {
      return { success: false, error: messages.errors.chooseImage };
    }

    const bytes = estimateBytes(dataUrl);
    if (bytes > MAX_BYTES) {
      return { success: false, error: messages.errors.assetTooLarge };
    }

    const count = await prisma.mediaAsset.count({ where: { userId } });
    if (count >= MAX_ASSETS) {
      return { success: false, error: messages.errors.assetLimit };
    }

    const name = (input.name?.trim() || "Asset").slice(0, MAX_NAME);
    const asset = await prisma.mediaAsset.create({
      data: {
        userId,
        name,
        dataUrl,
        mimeType: mimeFromDataUrl(dataUrl),
        tags: normalizeTags(input.tags),
        width: input.width ?? null,
        height: input.height ?? null,
        bytes,
      },
    });

    revalidatePath("/studio/editor");
    return { success: true, asset: toDto(asset) };
  } catch (err) {
    console.error("createMediaAsset:", err);
    return { success: false, error: messages.errors.saveAsset };
  }
}

export async function updateMediaAsset(input: {
  id: string;
  name?: string;
  tags?: string[];
}): Promise<ActionResult<{ asset: MediaAssetDTO }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const existing = await prisma.mediaAsset.findFirst({
      where: { id: input.id, userId },
    });
    if (!existing) return { success: false, error: messages.errors.assetNotFound };

    const asset = await prisma.mediaAsset.update({
      where: { id: existing.id },
      data: {
        ...(input.name != null
          ? { name: input.name.trim().slice(0, MAX_NAME) || existing.name }
          : {}),
        ...(input.tags != null ? { tags: normalizeTags(input.tags) } : {}),
      },
    });

    revalidatePath("/studio/editor");
    return { success: true, asset: toDto(asset) };
  } catch (err) {
    console.error("updateMediaAsset:", err);
    return { success: false, error: messages.errors.saveAsset };
  }
}

export async function deleteMediaAsset(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const existing = await prisma.mediaAsset.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) return { success: false, error: messages.errors.assetNotFound };

    await prisma.mediaAsset.delete({ where: { id: existing.id } });
    revalidatePath("/studio/editor");
    return { success: true, id: existing.id };
  } catch (err) {
    console.error("deleteMediaAsset:", err);
    return { success: false, error: messages.errors.deleteAsset };
  }
}

/** One-shot import from legacy localStorage library. */
export async function importLegacyAssets(
  items: { name: string; dataUrl: string; createdAt?: number }[],
): Promise<ActionResult<{ imported: number }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    if (!Array.isArray(items) || items.length === 0) {
      return { success: true, imported: 0 };
    }

    let imported = 0;
    const count = await prisma.mediaAsset.count({ where: { userId } });
    let remaining = Math.max(0, MAX_ASSETS - count);

    for (const item of items) {
      if (remaining <= 0) break;
      if (!item?.dataUrl?.startsWith("data:image/")) continue;
      const bytes = estimateBytes(item.dataUrl);
      if (bytes > MAX_BYTES) continue;

      await prisma.mediaAsset.create({
        data: {
          userId,
          name: (item.name?.trim() || "Imported").slice(0, MAX_NAME),
          dataUrl: item.dataUrl,
          mimeType: mimeFromDataUrl(item.dataUrl),
          tags: ["imported"],
          bytes,
          createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        },
      });
      imported += 1;
      remaining -= 1;
    }

    if (imported > 0) revalidatePath("/studio/editor");
    return { success: true, imported };
  } catch (err) {
    console.error("importLegacyAssets:", err);
    return { success: false, error: messages.errors.saveAsset };
  }
}
