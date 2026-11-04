export const FRAME_KINDS = ["iphone18pro", "iphone18promax", "iphoneDuoClose", "iphoneDuoOpen", "iphone17pro", 
  "iphone17promax", "iphoneAir", "iphone17", "iphone16pro", "iphone16promax", 
  "iphone16", "iphone15pro", "iphone15promax", "iphone15", "iphone13", "iphone13pro", "android", "ipadA16", 
  "ipadPro13M4", "ipadPro12", "ipadAir", "ipadMini", "macbookAir13M5", "macbookAir15M5", "macbookneo", 
  "macbookair13gen4", "imac24", "proDisplayXDR", "studioDisplayXDR", "appleWatchSeries10"] as const;
export type FrameKind = (typeof FRAME_KINDS)[number];

export function isFrameKind(value: string): value is FrameKind {
  return (FRAME_KINDS as readonly string[]).includes(value);
}
