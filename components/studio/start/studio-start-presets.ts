import type { StudioIconName } from "@/components/studio/ui/studio-icons";

export type StudioStartPreset = {
  id: string;
  title: string;
  icon: StudioIconName;
  category: "hooks" | "education" | "brand" | "launch";
  theme: string;
};

export const START_CATEGORIES = [
  { id: "all", label: "All carousels" },
  { id: "hooks", label: "Hooks" },
  { id: "education", label: "Education" },
  { id: "brand", label: "Brand" },
  { id: "launch", label: "Launch" },
] as const;

export type StartCategoryId = (typeof START_CATEGORIES)[number]["id"];

/** Carousel starters — Miro-like micro-illustration SVGs. */
export const STUDIO_START_PRESETS: StudioStartPreset[] = [
  {
    id: "ai-generate",
    title: "Generate with AI",
    icon: "spark",
    category: "hooks",
    theme:
      "A sharp 6-slide carousel that hooks in frame 1 and ends with one clear CTA",
  },
  {
    id: "hook-mistakes",
    title: "Hook mistakes",
    icon: "fire",
    category: "hooks",
    theme: "Common mistakes that kill carousel results — and the fix for each",
  },
  {
    id: "framework",
    title: "Simple framework",
    icon: "layers",
    category: "education",
    theme: "A simple framework people can reuse today, one idea per slide",
  },
  {
    id: "tips-list",
    title: "Tips listicle",
    icon: "list",
    category: "education",
    theme: "7 practical tips for better carousels, short and scannable",
  },
  {
    id: "stats-story",
    title: "Stats story",
    icon: "chart",
    category: "brand",
    theme: "A stats-led carousel that turns one insight into a shareable story",
  },
  {
    id: "founder-story",
    title: "Founder story",
    icon: "trophy",
    category: "brand",
    theme: "A short founder story with one sharp lesson and a calm tone",
  },
  {
    id: "product-launch",
    title: "Product launch",
    icon: "rocket",
    category: "launch",
    theme:
      "Explain a product launch in 6 frames. Calm, for founders, no jargon",
  },
  {
    id: "visual-showcase",
    title: "Visual showcase",
    icon: "image",
    category: "brand",
    theme: "A visual showcase carousel with bold covers and minimal copy",
  },
  {
    id: "thread-to-carousel",
    title: "Thread to carousel",
    icon: "message",
    category: "hooks",
    theme:
      "Turn a strong Threads post into a 5-slide carousel with a clear CTA",
  },
  {
    id: "checklist",
    title: "Publish checklist",
    icon: "check",
    category: "education",
    theme: "A pre-publish checklist carousel for social posts and carousels",
  },
];
