import fs from "node:fs/promises";
import path from "node:path";

import type { FabricCanvasJSON, RatioKey } from "@/lib/types";
import { parseImportedTemplate } from "./parse";

const ID_PREFIX = "builtin:";

export interface BuiltinTemplateSummary {
  id: string;
  title: string;
  category: string;
  badge: string | null;
  previewUrl: string | null;
  aspectRatio: string;
  slideCount: number;
  createdAt: string;
}

export interface BuiltinTemplateDetail {
  id: string;
  title: string;
  category: string;
  badge: string | null;
  previewUrl: string | null;
  aspectRatio: RatioKey;
  slides: FabricCanvasJSON[];
  thumbnails: Array<string | null>;
  createdAt: string;
}

function templatesDir(root = process.cwd()): string {
  return path.join(root, "templates");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function readText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function isBuiltinTemplateId(id: string): boolean {
  return id.startsWith(ID_PREFIX);
}

function filenameForId(id: string): string | null {
  if (!isBuiltinTemplateId(id)) return null;
  const stem = id.slice(ID_PREFIX.length);
  if (!/^[0-9A-Za-z_-]+$/.test(stem)) return null;
  return `${stem}.json`;
}

function idForFilename(filename: string): string {
  return `${ID_PREFIX}${filename.replace(/\.json$/i, "")}`;
}

async function readTemplateFile(
  filename: string,
  root = process.cwd(),
): Promise<
  | { ok: true; summary: BuiltinTemplateSummary; detail: BuiltinTemplateDetail }
  | { ok: false }
> {
  const absolutePath = path.join(templatesDir(root), filename);
  let rawText: string;
  let createdAt = new Date(0).toISOString();
  try {
    const [text, stat] = await Promise.all([
      fs.readFile(absolutePath, "utf8"),
      fs.stat(absolutePath),
    ]);
    rawText = text;
    createdAt = stat.mtime.toISOString();
  } catch {
    return { ok: false };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawText);
  } catch {
    return { ok: false };
  }

  const imported = parseImportedTemplate(parsedJson);
  if (!imported.ok) return { ok: false };

  const record = isRecord(parsedJson) ? parsedJson : {};
  const title = imported.template.title || filename.replace(/\.json$/i, "");
  const category = readText(record.category) || "Шаблоны";
  const badge = readText(record.badge);
  const previewUrl = imported.template.previewUrl ?? imported.template.thumbnails[0] ?? null;
  const aspectRatio = imported.template.aspectRatio ?? "4:5";
  const id = idForFilename(filename);

  return {
    ok: true,
    summary: {
      id,
      title,
      category,
      badge,
      previewUrl,
      aspectRatio,
      slideCount: imported.template.slides.length,
      createdAt,
    },
    detail: {
      id,
      title,
      category,
      badge,
      previewUrl,
      aspectRatio,
      slides: imported.template.slides,
      thumbnails: imported.template.thumbnails,
      createdAt,
    },
  };
}

async function templateFilenames(root = process.cwd()): Promise<string[]> {
  let entries: string[] = [];
  try {
    entries = await fs.readdir(templatesDir(root));
  } catch {
    return [];
  }
  return entries
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export async function listBuiltinTemplateSummaries(filter?: {
  category?: string;
  search?: string;
  root?: string;
}): Promise<BuiltinTemplateSummary[]> {
  const filenames = await templateFilenames(filter?.root);
  const search = filter?.search?.trim().toLowerCase();
  const category = filter?.category?.trim();
  const summaries: BuiltinTemplateSummary[] = [];

  for (const filename of filenames) {
    const read = await readTemplateFile(filename, filter?.root);
    if (!read.ok) continue;
    if (category && category !== "all" && read.summary.category !== category) continue;
    if (search) {
      const haystack = [read.summary.title, read.summary.category, read.summary.badge ?? ""]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) continue;
    }
    summaries.push(read.summary);
  }

  return summaries;
}

export async function listBuiltinCategories(root = process.cwd()): Promise<string[]> {
  const summaries = await listBuiltinTemplateSummaries({ root });
  return [...new Set(summaries.map((item) => item.category))].sort((a, b) =>
    a.localeCompare(b, "ru"),
  );
}

export async function readBuiltinTemplate(
  id: string,
  root = process.cwd(),
): Promise<BuiltinTemplateDetail | null> {
  const filename = filenameForId(id);
  if (!filename) return null;
  const read = await readTemplateFile(filename, root);
  return read.ok ? read.detail : null;
}
