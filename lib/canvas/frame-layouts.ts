/**
 * Ready-made device frame placements relative to the slide (0–1 coords).
 * Inspired by mockup composition cards: tilt, crop, center, floating.
 */

export type FrameLayoutPreset = {
  id: string;
  label: string;
  /** Family filter chip */
  family: "phone" | "tablet" | "desktop" | "watch";
  /** Center X as fraction of canvas width */
  x: number;
  /** Center Y as fraction of canvas height */
  y: number;
  /** Uniform scale vs fitted mockup size */
  scale: number;
  /** Degrees */
  angle: number;
};

export const FRAME_LAYOUT_PRESETS: FrameLayoutPreset[] = [
  // Phone — matches the reference card compositions
  { id: "crop-top", label: "Crop top", family: "phone", x: 0.5, y: 0.82, scale: 1.15, angle: 0 },
  { id: "tilt-right", label: "Tilt right", family: "phone", x: 0.52, y: 0.48, scale: 0.9, angle: 16 },
  { id: "center", label: "Center", family: "phone", x: 0.5, y: 0.52, scale: 1, angle: 0 },
  { id: "hero", label: "Hero", family: "phone", x: 0.5, y: 0.46, scale: 1.08, angle: 0 },
  { id: "tilt-left", label: "Tilt left", family: "phone", x: 0.48, y: 0.48, scale: 0.9, angle: -16 },
  { id: "float-top", label: "Float top", family: "phone", x: 0.5, y: 0.36, scale: 0.78, angle: 8 },
  { id: "sink-bottom", label: "Sink bottom", family: "phone", x: 0.5, y: 0.7, scale: 0.95, angle: 0 },
  { id: "crop-bottom", label: "Crop bottom", family: "phone", x: 0.5, y: 0.18, scale: 1.12, angle: 0 },
  { id: "close-up", label: "Close-up", family: "phone", x: 0.5, y: 0.5, scale: 1.45, angle: 0 },
  { id: "corner-tr", label: "Top right", family: "phone", x: 0.7, y: 0.32, scale: 0.72, angle: 18 },
  { id: "corner-bl", label: "Bottom left", family: "phone", x: 0.32, y: 0.68, scale: 0.74, angle: -12 },
  { id: "lean", label: "Lean", family: "phone", x: 0.54, y: 0.5, scale: 0.96, angle: 6 },

  { id: "tablet-center", label: "Tablet center", family: "tablet", x: 0.5, y: 0.5, scale: 1, angle: 0 },
  { id: "tablet-tilt", label: "Tablet tilt", family: "tablet", x: 0.5, y: 0.48, scale: 0.92, angle: -8 },
  { id: "tablet-crop", label: "Tablet crop", family: "tablet", x: 0.5, y: 0.62, scale: 1.12, angle: 0 },

  { id: "laptop-desk", label: "Laptop desk", family: "desktop", x: 0.5, y: 0.56, scale: 1, angle: 0 },
  { id: "laptop-angle", label: "Laptop angle", family: "desktop", x: 0.52, y: 0.52, scale: 0.92, angle: -4 },
  { id: "imac-stage", label: "Display stage", family: "desktop", x: 0.5, y: 0.48, scale: 1, angle: 0 },

  { id: "watch-float", label: "Watch float", family: "watch", x: 0.5, y: 0.46, scale: 1.05, angle: 12 },
  { id: "watch-center", label: "Watch center", family: "watch", x: 0.5, y: 0.5, scale: 1, angle: 0 },
];

export const FRAME_FAMILY_FILTERS = [
  "all",
  "phone",
  "tablet",
  "desktop",
  "watch",
] as const;

export type FrameFamilyFilter = (typeof FRAME_FAMILY_FILTERS)[number];

export function frameFamilyForKind(kind: string): FrameLayoutPreset["family"] {
  const k = kind.toLowerCase();
  if (k.includes("watch")) return "watch";
  if (k.includes("macbook") || k.includes("imac") || k.includes("display"))
    return "desktop";
  if (k.includes("ipad")) return "tablet";
  return "phone";
}
