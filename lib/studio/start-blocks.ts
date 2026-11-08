import type { StudioIconName } from "@/components/studio/ui/studio-icons";
import type { RatioKey } from "@/lib/types";

export type StartBlockId =
  | "carousel"
  | "text"
  | "palette"
  | "codeblock"
  | "list"
  | "brand";

export type CarouselStartForm = {
  topic: string;
  aspectRatio: Extract<RatioKey, "1:1" | "4:5" | "9:16" | "16:9">;
  slidesCount: number;
  language: string;
  handle: string;
  cover: string;
};

export type StartBlockDef = {
  id: StartBlockId;
  title: string;
  iconName: StudioIconName;
  hasDialog: boolean;
  /** Primary product action vs helper / editor insert. */
  role: "primary" | "helper" | "insert";
};

export const START_BLOCKS: Record<StartBlockId, StartBlockDef> = {
  carousel: {
    id: "carousel",
    title: "Carousel",
    iconName: "carousel",
    hasDialog: true,
    role: "primary",
  },
  text: {
    id: "text",
    title: "Caption",
    iconName: "idea",
    hasDialog: true,
    role: "helper",
  },
  palette: {
    id: "palette",
    title: "Palette",
    iconName: "palette",
    hasDialog: true,
    role: "helper",
  },
  codeblock: {
    id: "codeblock",
    title: "Code Block",
    iconName: "codeblock",
    hasDialog: true,
    role: "insert",
  },
  list: {
    id: "list",
    title: "List of Contents",
    iconName: "list",
    hasDialog: true,
    role: "insert",
  },
  brand: {
    id: "brand",
    title: "Brand Kit",
    iconName: "brand",
    hasDialog: true,
    role: "insert",
  },
};

/** Carousel first — helpers and inserts follow. */
export const START_BLOCK_ORDER: StartBlockId[] = [
  "carousel",
  "text",
  "palette",
  "codeblock",
  "list",
  "brand",
];

export const CAROUSEL_ASPECT_OPTIONS: CarouselStartForm["aspectRatio"][] = [
  "1:1",
  "4:5",
  "9:16",
  "16:9",
];
