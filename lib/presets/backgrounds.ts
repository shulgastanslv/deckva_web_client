export interface SolidPreset {
  type: "solid";
  color: string;
}

export interface GradientPreset {
  type: "gradient";
  colors: [string, string];
}

export interface SuggestedSet {
  id: string;
  label: string;
  background: string;
  text: string;
  accent: string;
  card: string;
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = Math.max(0, Math.min(100, s)) / 100;
  const light = Math.max(0, Math.min(100, l)) / 100;
  const hue = ((h % 360) + 360) % 360;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    const color = light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function uniqColors(colors: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of colors) {
    const color = raw.toLowerCase();
    if (seen.has(color)) continue;
    seen.add(color);
    out.push(raw.startsWith("#") ? raw.toUpperCase() : raw);
  }
  return out;
}

/** Neutrals first, then a dense HSL grid of carousel-friendly fills. */
const NEUTRAL_SOLIDS = [
  "#000000",
  "#0A0A0A",
  "#111111",
  "#121212",
  "#1A1A1A",
  "#252525",
  "#303030",
  "#3D3D3D",
  "#4A4A4A",
  "#5A5A5A",
  "#6B6B6B",
  "#808080",
  "#999999",
  "#B0B0B0",
  "#C4C4C4",
  "#D4D4D4",
  "#E0E0E0",
  "#E8E8E8",
  "#F0F0F0",
  "#F1F1F1",
  "#F5F5F5",
  "#F9F9F9",
  "#FAFAFA",
  "#FFFFFF",
  "#F8F6F1",
  "#F7F1E5",
  "#F4F1EA",
  "#EEF0F2",
  "#E7E5E4",
  "#1C1917",
  "#111827",
  "#0F172A",
  "#1E293B",
];

const CURATED_SOLIDS = [
  "#F6E27A",
  "#F4A261",
  "#E7D3C0",
  "#C46B4A",
  "#A47864",
  "#D7263D",
  "#F3D1C8",
  "#7D9B76",
  "#5C6B3A",
  "#1F7A6B",
  "#7FDBDA",
  "#2F5DFF",
  "#1C2B4A",
  "#CDB4DB",
  "#6C4AB6",
  "#FFE4D6",
  "#FADDE1",
  "#EDE4FF",
  "#DFF5EC",
  "#DCEFFF",
  "#FFF6C8",
  "#F0E2CC",
  "#FF6B4A",
  "#3DBE8B",
  "#4C9BE8",
  "#8B6CFF",
  "#E2B84A",
  "#D65A8A",
  "#2FB5BD",
  "#B44DB8",
];

const HUES = Array.from({ length: 18 }, (_, i) => i * 20);
const SATS = [32, 48, 64, 82];
const LIGHTS = [18, 30, 42, 54, 66, 78, 90];

const GENERATED_SOLIDS = HUES.flatMap((h) =>
  SATS.flatMap((s) => LIGHTS.map((l) => hslToHex(h, s, l))),
);

export const SOLID_PRESETS: SolidPreset[] = uniqColors([
  ...NEUTRAL_SOLIDS,
  ...CURATED_SOLIDS,
  ...GENERATED_SOLIDS,
]).map((color) => ({ type: "solid", color }));

const CURATED_GRADIENTS: [string, string][] = [
  ["#000000", "#121212"],
  ["#0A0A0A", "#1A1A1A"],
  ["#111111", "#252525"],
  ["#121212", "#2A2A2A"],
  ["#1A1A1A", "#333333"],
  ["#252525", "#3A3A3A"],
  ["#2A2A2A", "#404040"],
  ["#333333", "#4A4A4A"],
  ["#FFFFFF", "#F1F1F1"],
  ["#FAFAFA", "#E8E8E8"],
  ["#F9F9F9", "#E0E0E0"],
  ["#F5F5F5", "#D4D4D4"],
  ["#FFFFFF", "#D9D9D9"],
  ["#F1F1F1", "#C8C8C8"],
  ["#E5E5E5", "#FFFFFF"],
  ["#181818", "#303030"],
  ["#F6E27A", "#F7F1E5"],
  ["#F4A261", "#F3D1C8"],
  ["#1F7A6B", "#1C2B4A"],
  ["#2F5DFF", "#CDB4DB"],
  ["#7D9B76", "#F7F1E5"],
  ["#D7263D", "#A47864"],
  ["#7FDBDA", "#F6E27A"],
  ["#6C4AB6", "#1C2B4A"],
  ["#FFE4D6", "#FADDE1"],
  ["#EDE4FF", "#DCEFFF"],
  ["#DFF5EC", "#FFF6C8"],
  ["#0F172A", "#1E3A5F"],
  ["#111827", "#4C1D95"],
  ["#1C1917", "#C46B4A"],
  ["#F8F6F1", "#E7D3C0"],
  ["#FF6B4A", "#F6E27A"],
  ["#3DBE8B", "#2F5DFF"],
  ["#8B6CFF", "#D65A8A"],
  ["#4C9BE8", "#7FDBDA"],
  ["#B44DB8", "#2F5DFF"],
  ["#E2B84A", "#C46B4A"],
  ["#0A0A0A", "#2F5DFF"],
  ["#FFFFFF", "#CDB4DB"],
  ["#1C2B4A", "#7FDBDA"],
];

const GRADIENT_LIGHTS: [number, number][] = [
  [22, 48],
  [28, 62],
  [36, 72],
  [48, 86],
  [58, 92],
  [72, 94],
  [18, 78],
  [32, 88],
];

const GENERATED_GRADIENTS: [string, string][] = HUES.flatMap((h) =>
  [40, 62, 80].flatMap((s) =>
    GRADIENT_LIGHTS.map(([l1, l2]) => [hslToHex(h, s, l1), hslToHex(h + 28, s, l2)] as [string, string]),
  ),
);

const CROSS_HUE_GRADIENTS: [string, string][] = HUES.flatMap((h) =>
  [44, 70].flatMap((s) =>
    [34, 52].map(
      (l) => [hslToHex(h, s, l), hslToHex(h + 140, s - 8, Math.min(94, l + 28))] as [string, string],
    ),
  ),
);

function uniqGradients(pairs: [string, string][]): GradientPreset[] {
  const seen = new Set<string>();
  const out: GradientPreset[] = [];
  for (const colors of pairs) {
    const key = `${colors[0].toLowerCase()}|${colors[1].toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      type: "gradient",
      colors: [colors[0].toUpperCase(), colors[1].toUpperCase()],
    });
  }
  return out;
}

export const GRADIENT_PRESETS: GradientPreset[] = uniqGradients([
  ...CURATED_GRADIENTS,
  ...GENERATED_GRADIENTS,
  ...CROSS_HUE_GRADIENTS,
]);

/** Soft pastels, popular colors, plus distinct white/black shades. */
export const SUGGESTED_SETS: SuggestedSet[] = [
  {
    id: "butter",
    label: "Butter",
    background: "#FBF3DD",
    text: "#2A2416",
    accent: "#E2B84A",
    card: "#FFFBF0",
  },
  {
    id: "peach",
    label: "Peach",
    background: "#FFE4D6",
    text: "#3A2218",
    accent: "#F08A5D",
    card: "#FFF6F0",
  },
  {
    id: "blush",
    label: "Blush",
    background: "#FADDE1",
    text: "#3A1C24",
    accent: "#E86A7A",
    card: "#FFF5F7",
  },
  {
    id: "coral",
    label: "Coral",
    background: "#FFD8CC",
    text: "#2E1712",
    accent: "#FF6B4A",
    card: "#FFF4EF",
  },
  {
    id: "lavender",
    label: "Lavender",
    background: "#EDE4FF",
    text: "#2A2040",
    accent: "#8B6CFF",
    card: "#F7F3FF",
  },
  {
    id: "lilac",
    label: "Lilac",
    background: "#F3E8F7",
    text: "#2E1A38",
    accent: "#A56BC7",
    card: "#FBF5FD",
  },
  {
    id: "mint",
    label: "Mint",
    background: "#DFF5EC",
    text: "#163028",
    accent: "#3DBE8B",
    card: "#F3FBF7",
  },
  {
    id: "sage",
    label: "Sage",
    background: "#E7F0E2",
    text: "#1E2A1C",
    accent: "#6F8F5C",
    card: "#F5FAF2",
  },
  {
    id: "matcha",
    label: "Matcha",
    background: "#E4F0C8",
    text: "#243018",
    accent: "#7A9B3C",
    card: "#F4F9E8",
  },
  {
    id: "sky",
    label: "Sky",
    background: "#DCEFFF",
    text: "#152538",
    accent: "#4C9BE8",
    card: "#F0F7FF",
  },
  {
    id: "aqua",
    label: "Aqua",
    background: "#D7F3F5",
    text: "#143033",
    accent: "#2FB5BD",
    card: "#EFFAFA",
  },
  {
    id: "teal",
    label: "Teal",
    background: "#D9F0EA",
    text: "#12302B",
    accent: "#1F9B84",
    card: "#EEF9F6",
  },
  {
    id: "lemon",
    label: "Lemon",
    background: "#FFF6C8",
    text: "#2C2710",
    accent: "#E6C200",
    card: "#FFFBE8",
  },
  {
    id: "sand",
    label: "Sand",
    background: "#F0E2CC",
    text: "#2C2416",
    accent: "#C4956A",
    card: "#FAF4EA",
  },
  {
    id: "clay",
    label: "Clay",
    background: "#F3DDD0",
    text: "#3D2418",
    accent: "#C46B4A",
    card: "#FBF1EA",
  },
  {
    id: "rose",
    label: "Rose",
    background: "#F8D5E0",
    text: "#3A1826",
    accent: "#D65A8A",
    card: "#FDF0F5",
  },
  {
    id: "cobalt",
    label: "Cobalt",
    background: "#DCE6FF",
    text: "#141C38",
    accent: "#3D6BFF",
    card: "#EEF2FF",
  },
  {
    id: "berry",
    label: "Berry",
    background: "#F0D8F0",
    text: "#321838",
    accent: "#B44DB8",
    card: "#F9EEF9",
  },
  {
    id: "night",
    label: "Night",
    background: "#1C2B4A",
    text: "#F7F1E5",
    accent: "#7FDBDA",
    card: "#243656",
  },
  {
    id: "olive",
    label: "Olive",
    background: "#E8E6C8",
    text: "#2A2A16",
    accent: "#8A8B3D",
    card: "#F5F4E4",
  },
  {
    id: "white",
    label: "White",
    background: "#FFFFFF",
    text: "#121212",
    accent: "#3A3A3A",
    card: "#F5F5F5",
  },
  {
    id: "snow",
    label: "Snow",
    background: "#FAFAFA",
    text: "#171717",
    accent: "#525252",
    card: "#FFFFFF",
  },
  {
    id: "paper",
    label: "Paper",
    background: "#F4F4F5",
    text: "#18181B",
    accent: "#3F3F46",
    card: "#FAFAFA",
  },
  {
    id: "ivory",
    label: "Ivory",
    background: "#F8F6F1",
    text: "#1C1917",
    accent: "#57534E",
    card: "#FFFFFF",
  },
  {
    id: "chalk",
    label: "Chalk",
    background: "#EEF0F2",
    text: "#111827",
    accent: "#4B5563",
    card: "#F9FAFB",
  },
  {
    id: "black",
    label: "Black",
    background: "#000000",
    text: "#FAFAFA",
    accent: "#E5E5E5",
    card: "#141414",
  },
  {
    id: "ink",
    label: "Ink",
    background: "#0A0A0A",
    text: "#F5F5F5",
    accent: "#D4D4D4",
    card: "#171717",
  },
  {
    id: "charcoal",
    label: "Charcoal",
    background: "#1A1A1A",
    text: "#F4F4F5",
    accent: "#A1A1AA",
    card: "#27272A",
  },
  {
    id: "graphite",
    label: "Graphite",
    background: "#262626",
    text: "#FAFAFA",
    accent: "#D4D4D4",
    card: "#3F3F46",
  },
  {
    id: "obsidian",
    label: "Obsidian",
    background: "#111827",
    text: "#F9FAFB",
    accent: "#9CA3AF",
    card: "#1F2937",
  },
];
