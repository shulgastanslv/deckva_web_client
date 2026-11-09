import type { FabricCanvasJSON } from "@/lib/types";

/**
 * CORA emits PascalCase Fabric types (`Textbox`, `Rect`, `Image`).
 * Fabric 6 registries are keyed by lowercase (`textbox`, …).
 */
export function normalizeFabricSlide(slide: FabricCanvasJSON): FabricCanvasJSON {
  return visit(slide) as FabricCanvasJSON;
}

function visit(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(visit);
  if (!value || typeof value !== "object") return value;

  const next: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    next[key] = visit(child);
  }
  if (typeof next.type === "string" && next.type.length > 0) {
    next.type = next.type.toLowerCase();
  }
  return next;
}
