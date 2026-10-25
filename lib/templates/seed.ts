import fs from "node:fs/promises";
import path from "node:path";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { RatioKey } from "@/lib/types";
import { parseImportedTemplate } from "./parse";

export const BUILTIN_CATEGORY = "Built-in";
export const TEMPLATE_SOURCE_PREFIX = "seed:";

export interface SeedTemplateFile {
  sourceKey: string;
  filename: string;
  title: string;
  aspectRatio: RatioKey;
  slides: unknown[];
  thumbnails: Array<string | null>;
  previewUrl: string | null;
}

export interface SeedTemplatesResult {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ file: string; error: string }>;
  templates: Array<{ id: string; title: string; sourceKey: string; action: "created" | "updated" }>;
}

function templatesDir(root = process.cwd()): string {
  return path.join(root, "templates");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** List `templates/*.json` seed files (skips nested folders like refs/). */
export async function listSeedTemplateFiles(
  root = process.cwd(),
): Promise<Array<{ filename: string; absolutePath: string; sourceKey: string }>> {
  const dir = templatesDir(root);
  let entries: string[] = [];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }

  return entries
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((filename) => ({
      filename,
      absolutePath: path.join(dir, filename),
      sourceKey: `${TEMPLATE_SOURCE_PREFIX}${filename}`,
    }));
}

export async function readSeedTemplateFile(
  absolutePath: string,
  sourceKey: string,
  filename: string,
): Promise<{ ok: true; file: SeedTemplateFile } | { ok: false; error: string }> {
  let rawText: string;
  try {
    rawText = await fs.readFile(absolutePath, "utf8");
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not read file",
    };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawText);
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }

  const imported = parseImportedTemplate(parsedJson);
  if (!imported.ok) return { ok: false, error: "Invalid template" };

  const title =
    imported.template.title ||
    (isRecord(parsedJson) && typeof parsedJson.title === "string"
      ? parsedJson.title
      : filename.replace(/\.json$/i, ""));

  return {
    ok: true,
    file: {
      sourceKey,
      filename,
      title: title.trim() || filename,
      aspectRatio: imported.template.aspectRatio ?? "4:5",
      slides: imported.template.slides,
      thumbnails: imported.template.thumbnails,
      previewUrl: imported.template.previewUrl ?? imported.template.thumbnails[0] ?? null,
    },
  };
}

async function findTemplateIdBySourceKey(sourceKey: string): Promise<string | null> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM "Template"
    WHERE "canvasJSON"->>'sourceKey' = ${sourceKey}
    LIMIT 1
  `;
  return rows[0]?.id ?? null;
}

function canvasPayload(file: SeedTemplateFile): Prisma.InputJsonValue {
  return {
    slides: file.slides,
    thumbnails: file.thumbnails,
    aspectRatio: file.aspectRatio,
    sourceKey: file.sourceKey,
  } as unknown as Prisma.InputJsonValue;
}

/** Upsert every `templates/*.json` file as Built-in templates. */
export async function seedBuiltinTemplates(input?: {
  root?: string;
  authorId?: string | null;
  replace?: boolean;
}): Promise<SeedTemplatesResult> {
  const files = await listSeedTemplateFiles(input?.root);
  const result: SeedTemplatesResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    templates: [],
  };

  for (const entry of files) {
    const read = await readSeedTemplateFile(
      entry.absolutePath,
      entry.sourceKey,
      entry.filename,
    );
    if (!read.ok) {
      result.errors.push({ file: entry.filename, error: read.ok === false ? read.error : "Unknown error" });
      result.skipped += 1;
      continue;
    }

    const existingId = await findTemplateIdBySourceKey(entry.sourceKey);
    const data = {
      title: read.file.title,
      category: BUILTIN_CATEGORY,
      badge: "Seed",
      aspectRatio: read.file.aspectRatio,
      previewUrl: read.file.previewUrl,
      canvasJSON: canvasPayload(read.file),
      authorId: input?.authorId ?? null,
    };

    if (existingId) {
      if (input?.replace === false) {
        result.skipped += 1;
        continue;
      }
      await prisma.template.update({
        where: { id: existingId },
        data,
      });
      result.updated += 1;
      result.templates.push({
        id: existingId,
        title: read.file.title,
        sourceKey: entry.sourceKey,
        action: "updated",
      });
      continue;
    }

    const created = await prisma.template.create({
      data,
      select: { id: true },
    });
    result.created += 1;
    result.templates.push({
      id: created.id,
      title: read.file.title,
      sourceKey: entry.sourceKey,
      action: "created",
    });
  }

  return result;
}

/** Import one already-parsed template payload (admin upload). */
export async function upsertImportedTemplate(input: {
  title: string;
  category?: string;
  badge?: string | null;
  aspectRatio: RatioKey;
  slides: unknown[];
  thumbnails: Array<string | null>;
  previewUrl?: string | null;
  sourceKey?: string | null;
  authorId?: string | null;
}): Promise<{ id: string; action: "created" | "updated" }> {
  const sourceKey = input.sourceKey?.trim() || null;
  const canvasJSON = {
    slides: input.slides,
    thumbnails: input.thumbnails,
    aspectRatio: input.aspectRatio,
    ...(sourceKey ? { sourceKey } : {}),
  } as unknown as Prisma.InputJsonValue;

  if (sourceKey) {
    const existingId = await findTemplateIdBySourceKey(sourceKey);
    if (existingId) {
      await prisma.template.update({
        where: { id: existingId },
        data: {
          title: input.title,
          category: input.category?.trim() || BUILTIN_CATEGORY,
          badge: input.badge ?? null,
          aspectRatio: input.aspectRatio,
          previewUrl: input.previewUrl ?? null,
          canvasJSON,
          authorId: input.authorId ?? null,
        },
      });
      return { id: existingId, action: "updated" };
    }
  }

  const created = await prisma.template.create({
    data: {
      title: input.title,
      category: input.category?.trim() || BUILTIN_CATEGORY,
      badge: input.badge ?? null,
      aspectRatio: input.aspectRatio,
      previewUrl: input.previewUrl ?? null,
      canvasJSON,
      authorId: input.authorId ?? null,
    },
    select: { id: true },
  });
  return { id: created.id, action: "created" };
}
