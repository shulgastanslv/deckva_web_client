import type { FabricCanvasJSON } from "@/lib/types";
import { chromeRole, type ChromeRole } from "./roles";

export type { ChromeRole };
export { chromeRole };
export type SlideNumberStyle = "1" | "01" | "1 / 8";

export interface ChromeTemplate {
  role: ChromeRole;
  numberStyle?: SlideNumberStyle;
  object: Record<string, unknown>;
}

export function formatSlideNumber(
  style: SlideNumberStyle,
  index: number,
  total: number,
): string {
  const n = index + 1;
  switch (style) {
    case "01":
      return String(n).padStart(2, "0");
    case "1 / 8":
      return `${n} / ${total}`;
    default:
      return String(n);
  }
}

export function numberStyleOf(value: unknown): SlideNumberStyle {
  if (value === "01" || value === "1 / 8" || value === "1") return value;
  return "1";
}

export function chromeTemplatesFrom(json: FabricCanvasJSON): ChromeTemplate[] {
  const map = new Map<ChromeRole, ChromeTemplate>();
  for (const object of json.objects ?? []) {
    const role = chromeRole(object.swibpRole);
    if (!role) continue;
    map.set(role, {
      role,
      numberStyle: role === "number" ? numberStyleOf(object.swibpNumberStyle) : undefined,
      object,
    });
  }
  return [...map.values()];
}

export function materializeChrome(
  template: ChromeTemplate,
  index: number,
  total: number,
): Record<string, unknown> {
  const object = structuredClone(template.object);
  if (template.role === "number") {
    const style = template.numberStyle ?? numberStyleOf(object.swibpNumberStyle);
    object.text = formatSlideNumber(style, index, total);
    object.swibpNumberStyle = style;
  }
  return object;
}

/** Replaces chrome on a slide with the shared templates. One object per role. */
export function applyChrome(
  json: FabricCanvasJSON,
  templates: ChromeTemplate[],
  index: number,
  total: number,
): FabricCanvasJSON {
  const wanted = new Set(templates.map((template) => template.role));
  const placed = new Set<ChromeRole>();
  const objects: Record<string, unknown>[] = [];

  for (const object of json.objects ?? []) {
    const role = chromeRole(object.swibpRole);
    if (!role) {
      objects.push(object);
      continue;
    }
    if (!wanted.has(role) || placed.has(role)) continue;
    const template = templates.find((item) => item.role === role);
    if (!template) continue;
    objects.push(materializeChrome(template, index, total));
    placed.add(role);
  }

  for (const template of templates) {
    if (!placed.has(template.role)) {
      objects.push(materializeChrome(template, index, total));
    }
  }

  return { ...json, objects };
}

/** Ignore the per-slide counter so a move between slides does not look like an edit. */
export function sameChrome(a: ChromeTemplate[], b: ChromeTemplate[]): boolean {
  return JSON.stringify(comparable(a)) === JSON.stringify(comparable(b));
}

function comparable(list: ChromeTemplate[]) {
  return [...list]
    .sort((left, right) => left.role.localeCompare(right.role))
    .map((template) => {
      const object = { ...template.object };
      if (template.role === "number") delete object.text;
      return { role: template.role, numberStyle: template.numberStyle, object };
    });
}

type LiveNumber = {
  swibpRole?: string;
  swibpNumberStyle?: string;
  text?: string;
  set: (props: Record<string, unknown>) => void;
};

/** Rewrites the counter already on the open slide after a reorder. */
export function patchLiveSlideNumber(
  canvas: { getObjects: () => LiveNumber[]; requestRenderAll: () => void },
  index: number,
  total: number,
): void {
  let dirty = false;
  for (const obj of canvas.getObjects()) {
    if (obj.swibpRole !== "number") continue;
    const text = formatSlideNumber(numberStyleOf(obj.swibpNumberStyle), index, total);
    if (obj.text === text) continue;
    obj.set({ text });
    dirty = true;
  }
  if (dirty) canvas.requestRenderAll();
}
