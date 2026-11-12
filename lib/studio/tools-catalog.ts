export type ToolCategory = "chrome" | "content" | "devices";

export type StudioToolId = "mockups" | "progress-dots" | "slides-from-text";

export interface StudioTool {
  id: StudioToolId;
  title: string;
  description: string;
  longDescription: string;
  category: ToolCategory;
  author: string;
  authorInitial: string;
  usedBy: string;
  likedBy: string;
  /** Path under /public, e.g. `/tools/mockups.jpg` */
  image: string;
  suggested?: boolean;
  runLabel: string;
}

export const TOOL_CATEGORIES: { id: ToolCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "chrome", label: "Chrome" },
  { id: "content", label: "Content" },
  { id: "devices", label: "Devices" },
];

export const STUDIO_TOOLS: StudioTool[] = [
  {
    id: "mockups",
    title: "Device mockups",
    description: "Ranked phone lists, rows of devices, and batch screenshot fills.",
    longDescription:
      "Build carousel slides from titles, drop a row of phones on the current slide, then fill every screen from a multi-select of screenshots.",
    category: "devices",
    author: "Deckva",
    authorInitial: "D",
    usedBy: "12.4k",
    likedBy: "840",
    image: "/tools/mockups.jpg",
    suggested: true,
    runLabel: "Open mockups",
  },
  {
    id: "slides-from-text",
    title: "Slides from text",
    description: "One line becomes one slide. Then edit each frame.",
    longDescription:
      "Paste a outline — each line becomes a slide with your chosen text style, palette, and chrome.",
    category: "content",
    author: "Deckva",
    authorInitial: "D",
    usedBy: "7.8k",
    likedBy: "512",
    image: "/tools/slides-from-text.jpg",
    suggested: true,
    runLabel: "Make slides",
  },
  {
    id: "progress-dots",
    title: "Progress dots",
    description: "Bottom dots for carousel position.",
    longDescription:
      "Drop a row of progress dots that reflect the current slide index in the carousel.",
    category: "chrome",
    author: "Deckva",
    authorInitial: "D",
    usedBy: "3.1k",
    likedBy: "96",
    image: "/tools/progress-dots.png",
    runLabel: "Add dots",
  },
];

const RECENTS_KEY = "deckva-tools-recents";
const MAX_RECENTS = 8;

export function loadToolRecents(): StudioToolId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const ids = new Set(STUDIO_TOOLS.map((tool) => tool.id));
    return parsed.filter((id): id is StudioToolId => typeof id === "string" && ids.has(id as StudioToolId));
  } catch {
    return [];
  }
}

export function pushToolRecent(id: StudioToolId): StudioToolId[] {
  const next = [id, ...loadToolRecents().filter((item) => item !== id)].slice(0, MAX_RECENTS);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}

export function getTool(id: StudioToolId): StudioTool | undefined {
  return STUDIO_TOOLS.find((tool) => tool.id === id);
}
