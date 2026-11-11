export type ToolCategory = "chrome" | "content" | "devices" | "edit";

export type StudioToolId =
  | "mockups"
  | "slide-number"
  | "author"
  | "swipe-cue"
  | "progress-dots"
  | "slides-from-text"
  | "find-replace";

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
  /** Tailwind classes for the tool icon tile */
  iconClass: string;
  /** Soft gradient behind the preview art */
  previewClass: string;
  suggested?: boolean;
  runLabel: string;
}

export const TOOL_CATEGORIES: { id: ToolCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "chrome", label: "Chrome" },
  { id: "content", label: "Content" },
  { id: "devices", label: "Devices" },
  { id: "edit", label: "Edit" },
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
    iconClass: "bg-sky-500 text-white",
    previewClass: "from-sky-200 via-sky-100 to-indigo-100 dark:from-sky-900/50 dark:via-slate-900 dark:to-indigo-950/60",
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
    iconClass: "bg-amber-500 text-white",
    previewClass: "from-amber-100 via-orange-50 to-yellow-100 dark:from-amber-950/50 dark:via-slate-900 dark:to-yellow-950/40",
    suggested: true,
    runLabel: "Make slides",
  },
  {
    id: "slide-number",
    title: "Slide number",
    description: "Puts 1, 01, or 1 / 8 in a corner of the current slide.",
    longDescription:
      "Pick a numbering style and corner, then drop a slide number onto the active frame.",
    category: "chrome",
    author: "Deckva",
    authorInitial: "D",
    usedBy: "5.6k",
    likedBy: "210",
    iconClass: "bg-emerald-500 text-white",
    previewClass: "from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-950/50 dark:via-slate-900 dark:to-cyan-950/40",
    runLabel: "Add number",
  },
  {
    id: "author",
    title: "Author handle",
    description: "Handle + optional avatar in the top corner.",
    longDescription:
      "Set @handle and an avatar, then pin an author chip to the top-left or top-right of the slide.",
    category: "chrome",
    author: "Deckva",
    authorInitial: "D",
    usedBy: "4.2k",
    likedBy: "188",
    iconClass: "bg-rose-500 text-white",
    previewClass: "from-rose-100 via-pink-50 to-orange-100 dark:from-rose-950/50 dark:via-slate-900 dark:to-orange-950/40",
    runLabel: "Add author",
  },
  {
    id: "swipe-cue",
    title: "Swipe cue",
    description: "Small “next” hint so people keep scrolling.",
    longDescription:
      "Choose a swipe label and corner to nudge viewers to the next slide in the carousel.",
    category: "chrome",
    author: "Deckva",
    authorInitial: "D",
    usedBy: "3.9k",
    likedBy: "142",
    iconClass: "bg-indigo-500 text-white",
    previewClass: "from-indigo-100 via-blue-50 to-sky-100 dark:from-indigo-950/50 dark:via-slate-900 dark:to-sky-950/40",
    runLabel: "Add swipe",
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
    iconClass: "bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900",
    previewClass: "from-zinc-200 via-slate-100 to-zinc-50 dark:from-zinc-800 dark:via-slate-900 dark:to-zinc-950",
    runLabel: "Add dots",
  },
  {
    id: "find-replace",
    title: "Find & replace",
    description: "Updates text across every slide in this project.",
    longDescription:
      "Search the whole carousel and replace matching text on every slide in one action.",
    category: "edit",
    author: "Deckva",
    authorInitial: "D",
    usedBy: "6.5k",
    likedBy: "301",
    iconClass: "bg-orange-500 text-white",
    previewClass: "from-orange-100 via-amber-50 to-yellow-50 dark:from-orange-950/50 dark:via-slate-900 dark:to-amber-950/30",
    runLabel: "Replace all",
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
