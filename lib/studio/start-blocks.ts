import type { StudioIconName } from "@/components/studio/ui/studio-icons";
import type { RatioKey } from "@/lib/types";

export type StartBlockId =
  | "text"
  | "palette"
  | "carousel"
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
  /** Palette opens no dialog — handled on click. */
  hasDialog: boolean;
};

export const START_BLOCKS: Record<StartBlockId, StartBlockDef> = {
  text: { id: "text", title: "Generate Text", iconName: "idea", hasDialog: true },
  palette: { id: "palette", title: "Palette", iconName: "palette", hasDialog: false },
  carousel: {
    id: "carousel",
    title: "Carousel",
    iconName: "carousel",
    hasDialog: true,
  },
  codeblock: {
    id: "codeblock",
    title: "Code Block",
    iconName: "codeblock",
    hasDialog: true,
  },
  list: { id: "list", title: "List of Contents", iconName: "list", hasDialog: true },
  brand: { id: "brand", title: "Brand Kit", iconName: "brand", hasDialog: true },
};

export const START_BLOCK_ORDER: StartBlockId[] = [
  "text",
  "palette",
  "carousel",
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
