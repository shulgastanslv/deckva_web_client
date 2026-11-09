import type { RatioKey } from "@/lib/types";

const STORAGE_KEY = "swibp:studio-intent";

export type StudioGenerateIntent = {
  type: "generate";
  projectId: string;
  topic: string;
  handle: string;
  language: string;
  aspectRatio: RatioKey;
  slidesCount: number;
  cover: string;
  modelId?: string;
};

export type StudioIntent =
  | { type: "new" }
  | StudioGenerateIntent;

function parseIntent(raw: string): StudioIntent | null {
  try {
    const parsed = JSON.parse(raw) as StudioIntent;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.type === "new") return { type: "new" };
    if (parsed.type !== "generate") return null;
    if (
      typeof parsed.projectId !== "string" ||
      typeof parsed.topic !== "string" ||
      typeof parsed.handle !== "string" ||
      typeof parsed.language !== "string" ||
      typeof parsed.aspectRatio !== "string" ||
      typeof parsed.slidesCount !== "number"
    ) {
      return null;
    }
    return {
      type: "generate",
      projectId: parsed.projectId,
      topic: parsed.topic,
      handle: parsed.handle,
      language: parsed.language,
      aspectRatio: parsed.aspectRatio as RatioKey,
      slidesCount: parsed.slidesCount,
      cover: typeof parsed.cover === "string" ? parsed.cover : "",
      modelId:
        typeof parsed.modelId === "string" && parsed.modelId.trim()
          ? parsed.modelId.trim()
          : undefined,
    };
  } catch {
    return null;
  }
}

export function stashStudioIntent(intent: StudioIntent): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
  } catch {
    // ignore
  }
}

export function peekStudioIntent(): StudioIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? parseIntent(raw) : null;
  } catch {
    return null;
  }
}

export function takeStudioIntent(): StudioIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return parseIntent(raw);
  } catch {
    return null;
  }
}
