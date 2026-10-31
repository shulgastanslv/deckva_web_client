import {
  defaultDocument,
  paintSlide,
  TEXT_STYLES,
  type DocumentMeta,
  type ProjectPalette,
  type TextStyleDef,
  type TextStyleId,
} from "@/lib/canvas/document";
import { loadGoogleFont } from "@/lib/fonts/google-fonts";
import type { FabricCanvasJSON } from "@/lib/types";
import { useCanvasStore } from "@/store/useCanvasStore";

export const BRAND_KIT_STORAGE_KEY = "deckva.brand-kit";
export const BRAND_KIT_CHANGED = "studio:brand-kit-changed";

export type BrandKitLogo = {
  id: string;
  name: string;
  dataUrl: string;
};

/** Brand kit mirrors the carousel document model used in the editor. */
export type BrandKit = {
  palette: ProjectPalette;
  textStyles: DocumentMeta["textStyles"];
  logos: BrandKitLogo[];
};

export function defaultBrandKit(): BrandKit {
  const doc = defaultDocument();
  return {
    palette: { ...doc.palette },
    textStyles: {
      heading: { ...doc.textStyles.heading },
      subtitle: { ...doc.textStyles.subtitle },
      body: { ...doc.textStyles.body },
    },
    logos: [],
  };
}

function readPalette(raw: unknown): ProjectPalette | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const background = typeof row.background === "string" ? row.background : null;
  const text = typeof row.text === "string" ? row.text : null;
  const accent = typeof row.accent === "string" ? row.accent : null;
  const card = typeof row.card === "string" ? row.card : null;
  if (!background || !text || !accent || !card) return null;
  return { background, text, accent, card };
}

function readTextStyle(raw: unknown, fallback: TextStyleDef): TextStyleDef {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const row = raw as Record<string, unknown>;
  return {
    fontFamily:
      typeof row.fontFamily === "string" ? row.fontFamily : fallback.fontFamily,
    fontSize: typeof row.fontSize === "number" ? row.fontSize : fallback.fontSize,
    fontWeight:
      typeof row.fontWeight === "string" ? row.fontWeight : fallback.fontWeight,
    lineHeight:
      typeof row.lineHeight === "number" ? row.lineHeight : fallback.lineHeight,
  };
}

/** Migrate older free-form color/font lists into document slots. */
function migrateLegacy(data: Record<string, unknown>, base: BrandKit): BrandKit {
  const colors = Array.isArray(data.colors) ? data.colors : [];
  const fonts = Array.isArray(data.fonts) ? data.fonts : [];
  const palette = { ...base.palette };
  const slots = ["background", "text", "accent", "card"] as const;
  for (let i = 0; i < slots.length; i++) {
    const row = colors[i];
    if (row && typeof row === "object" && typeof (row as { hex?: unknown }).hex === "string") {
      palette[slots[i]!] = (row as { hex: string }).hex;
    }
  }

  const textStyles = { ...base.textStyles };
  const headingFont =
    typeof fonts[0] === "string" ? fonts[0] : textStyles.heading.fontFamily;
  const bodyFont =
    typeof fonts[1] === "string" ? fonts[1] : textStyles.body.fontFamily;
  textStyles.heading = { ...textStyles.heading, fontFamily: headingFont };
  textStyles.subtitle = { ...textStyles.subtitle, fontFamily: headingFont };
  textStyles.body = { ...textStyles.body, fontFamily: bodyFont };

  return { palette, textStyles, logos: base.logos };
}

export function readBrandKit(raw: string | null): BrandKit {
  const base = defaultBrandKit();
  if (!raw) return base;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return base;
    const data = parsed as Record<string, unknown>;

    const logos: BrandKitLogo[] = [];
    if (Array.isArray(data.logos)) {
      for (const row of data.logos) {
        if (!row || typeof row !== "object") continue;
        const item = row as Record<string, unknown>;
        if (
          typeof item.id !== "string" ||
          typeof item.name !== "string" ||
          typeof item.dataUrl !== "string"
        ) {
          continue;
        }
        logos.push({
          id: item.id,
          name: item.name,
          dataUrl: item.dataUrl,
        });
      }
    }

    const withLogos = { ...base, logos };

    const palette = readPalette(data.palette);
    const stylesRaw =
      data.textStyles && typeof data.textStyles === "object"
        ? (data.textStyles as Record<string, unknown>)
        : null;

    if (!palette || !stylesRaw) {
      return { ...migrateLegacy(data, withLogos), logos };
    }

    const textStyles = { ...base.textStyles };
    for (const style of TEXT_STYLES) {
      textStyles[style.id] = readTextStyle(stylesRaw[style.id], textStyles[style.id]);
    }

    return { palette, textStyles, logos };
  } catch {
    return base;
  }
}

export function loadBrandKit(): BrandKit {
  if (typeof window === "undefined") return defaultBrandKit();
  return readBrandKit(window.localStorage.getItem(BRAND_KIT_STORAGE_KEY));
}

export function writeBrandKit(kit: BrandKit): void {
  window.localStorage.setItem(BRAND_KIT_STORAGE_KEY, JSON.stringify(kit));
  window.dispatchEvent(new CustomEvent(BRAND_KIT_CHANGED));
}

export function brandKitDocument(kit: BrandKit = loadBrandKit()): DocumentMeta {
  return {
    palette: { ...kit.palette },
    textStyles: {
      heading: { ...kit.textStyles.heading },
      subtitle: { ...kit.textStyles.subtitle },
      body: { ...kit.textStyles.body },
    },
    chrome: [],
  };
}

export function brandKitFonts(kit: BrandKit = loadBrandKit()): string[] {
  const seen = new Set<string>();
  const fonts: string[] = [];
  for (const style of TEXT_STYLES) {
    const family = kit.textStyles[style.id].fontFamily.trim();
    if (!family || seen.has(family)) continue;
    seen.add(family);
    fonts.push(family);
  }
  return fonts;
}

export async function preloadBrandKitFonts(kit: BrandKit = loadBrandKit()): Promise<void> {
  await Promise.all(
    brandKitFonts(kit).map((family) => loadGoogleFont(family).catch(() => undefined)),
  );
}

type LiveCanvas = {
  backgroundColor?: unknown;
  requestRenderAll?: () => void;
};

/** Apply brand palette + type styles onto the open carousel store (and optional live canvas). */
export function applyBrandKitToStore(options?: {
  kit?: BrandKit;
  paintBackground?: boolean;
  canvas?: LiveCanvas | null;
}): BrandKit {
  const kit = options?.kit ?? loadBrandKit();
  const doc = brandKitDocument(kit);
  const store = useCanvasStore.getState();
  store.replaceDocument?.(doc);

  if (options?.paintBackground !== false) {
    const bg = kit.palette.background;
    store.setSlides(
      store.slides.map((slide) => ({
        ...slide,
        canvasJSON: paintSlide(slide.canvasJSON as FabricCanvasJSON, "background", bg),
      })),
    );
    const canvas = options?.canvas;
    if (canvas) {
      canvas.backgroundColor = bg;
      canvas.requestRenderAll?.();
    }
  }

  void preloadBrandKitFonts(kit);
  store.setDirty(true);
  return kit;
}

export function updateBrandTextStyle(
  kit: BrandKit,
  id: TextStyleId,
  patch: Partial<TextStyleDef>,
): BrandKit {
  return {
    ...kit,
    textStyles: {
      ...kit.textStyles,
      [id]: { ...kit.textStyles[id], ...patch },
    },
  };
}
