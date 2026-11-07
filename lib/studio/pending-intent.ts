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
  /** Cover image URL; empty string = gray placeholder on slide 1. */
  cover: string;
  parentArtifactId?: string | null;
};

export type StudioInsertKind = "codeblock" | "list";

export type StudioInsertIntent = {
  type: "insert";
  insert: StudioInsertKind;
  /** Optional seed content for the inserted element. */
  content?: string;
  title?: string;
};

export type StudioIntent =
  | { type: "new" }
  | StudioGenerateIntent
  | StudioInsertIntent;

function parseIntent(raw: string): StudioIntent | null {
  try {
    const parsed = JSON.parse(raw) as StudioIntent;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.type === "new") return { type: "new" };
    if (parsed.type === "insert") {
      if (parsed.insert !== "codeblock" && parsed.insert !== "list") return null;
      return {
        type: "insert",
        insert: parsed.insert,
        content: typeof parsed.content === "string" ? parsed.content : "",
        title: typeof parsed.title === "string" ? parsed.title : "",
      };
    }
    if (parsed.type === "generate") {
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
        ...parsed,
        cover: typeof parsed.cover === "string" ? parsed.cover : "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function stashStudioIntent(intent: StudioIntent): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
  } catch {
    // ignore quota / private mode
  }
}

export function peekStudioIntent(): StudioIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseIntent(raw);
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
