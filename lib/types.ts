export type BackgroundType = "solid" | "gradient" | "image";

export interface BackgroundConfig {
  type: BackgroundType;
  color?: string;
  colors?: [string, string];
  url?: string;
}

export type RatioKey = 
  | "1:1" 
  | "4:3" 
  | "3:2" 
  | "4:5" 
  | "5:4" 
  | "1.618:1" 
  | "9:16" 
  | "16:9" 
  | "1:2" 
  | "3:1";

  export const CANVAS_RATIOS: Record<RatioKey, { width: number; height: number }> = {
    "1:1": { width: 1080, height: 1080 },
    "4:3": { width: 1440, height: 1080 },
    "3:2": { width: 1620, height: 1080 },
    "4:5": { width: 1080, height: 1350 },
    "5:4": { width: 1350, height: 1080 },
    "1.618:1": { width: 1747, height: 1080 },
    "9:16": { width: 1080, height: 1920 },
    "16:9": { width: 1920, height: 1080 },
    "1:2": { width: 1080, height: 2160 },
    "3:1": { width: 1920, height: 640 },
  };

// Fabric types `Canvas.toJSON()` as `any`, so the shape is declared explicitly.
export interface FabricCanvasJSON {
  version: string;
  objects: Record<string, unknown>[];
  background?: string;
  [key: string]: unknown;
}

export interface SlideItem {
  id: number;
  canvasJSON: FabricCanvasJSON;
  thumbnail?: string | null;
}

export interface ProjectState {
  id: string;
  title: string;
  aspectRatio: RatioKey;
  width: number;
  height: number;
  slides: SlideItem[];
  currentSlideId: number;
}

export interface EditorUIState {
  selectedObjectId: string | null;
  zoom: number;
  isGridVisible: boolean;
  gridColumns: number;
  gridRows: number;
  gridMargin: number;
  gridColor: string;
  gridOpacity: number;
  snapToGrid: boolean;
}
