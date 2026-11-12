"use client";

const FONTS_JSON_URL =
  "https://cdn.jsdelivr.net/gh/hasinhayder/google-fonts@latest/fonts.json";

const SYSTEM_FONTS = [
  "Inter",
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "system-ui",
] as const;

/** Curated faces with Cyrillic, offered as one-click carousel fonts. */
export const SUGGESTED_FONTS = [
  "Inter",
  "Manrope",
  "Montserrat",
  "Unbounded",
  "Oswald",
  "Playfair Display",
  "PT Serif",
  "Comfortaa",
] as const;

const POPULAR_GOOGLE_FONTS = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Oswald",
  "Raleway",
  "Nunito",
  "Merriweather",
  "Playfair Display",
  "Source Sans 3",
  "PT Sans",
  "Ubuntu",
  "Rubik",
  "Work Sans",
  "Noto Sans",
  "Noto Serif",
  "DM Sans",
  "Space Grotesk",
  "Outfit",
] as const;

let fontsCache: string[] | null = null;
let fontsPromise: Promise<string[]> | null = null;
const loadedFamilies = new Set<string>();

export function getSystemFonts(): readonly string[] {
  return SYSTEM_FONTS;
}

export function getPopularGoogleFonts(): readonly string[] {
  return POPULAR_GOOGLE_FONTS;
}

export async function fetchGoogleFontFamilies(): Promise<string[]> {
  if (fontsCache) return fontsCache;
  if (fontsPromise) return fontsPromise;

  fontsPromise = (async () => {
    const res = await fetch(FONTS_JSON_URL);
    if (!res.ok) throw new Error(`Google Fonts list HTTP ${res.status}`);

    const data: unknown = await res.json();
    let families: string[] = [];

    if (Array.isArray(data)) {
      families = data.filter((x): x is string => typeof x === "string");
    } else if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      if (Array.isArray(record.fonts)) {
        families = record.fonts.filter((x): x is string => typeof x === "string");
      } else if (Array.isArray(record.items)) {
        families = record.items
          .map((item) =>
            item && typeof item === "object"
              ? (item as { family?: unknown }).family
              : null,
          )
          .filter((x): x is string => typeof x === "string");
      }
    }

    families = Array.from(new Set(families)).sort((a, b) =>
      a.localeCompare(b, "en"),
    );
    fontsCache = families;
    return families;
  })().catch((err) => {
    fontsPromise = null;
    throw err;
  });

  return fontsPromise;
}

/** Inject Google Fonts stylesheet and wait until the family is usable. */
export async function loadGoogleFont(family: string): Promise<void> {
  if (typeof document === "undefined") return;
  if (SYSTEM_FONTS.includes(family as (typeof SYSTEM_FONTS)[number])) return;

  const quoted = `"${family.replace(/"/g, "")}"`;
  if (loadedFamilies.has(family) && document.fonts.check(`16px ${quoted}`)) return;
  const id = `gf-${family.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    const familyParam = encodeURIComponent(family).replace(/%20/g, "+");
    link.href = `https://fonts.googleapis.com/css2?family=${familyParam}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
    const ready = new Promise<void>((resolve) => {
      link?.addEventListener("load", () => resolve(), { once: true });
      link?.addEventListener("error", () => resolve(), { once: true });
    });
    document.head.appendChild(link);
    await ready;
  }

  await Promise.all([
    document.fonts.load(`400 16px ${quoted}`),
    document.fonts.load(`700 16px ${quoted}`),
    document.fonts.load(`italic 400 16px ${quoted}`),
    document.fonts.load(`italic 700 16px ${quoted}`),
  ]).catch(() => undefined);
  await document.fonts.ready;
  if (document.fonts.check(`16px ${quoted}`)) loadedFamilies.add(family);
}

export function normalizeFontFamily(raw: string | undefined | null): string {
  if (!raw) return "Inter";
  return raw
    .split(",")[0]
    ?.trim()
    .replace(/^['"]|['"]$/g, "") || "Inter";
}
