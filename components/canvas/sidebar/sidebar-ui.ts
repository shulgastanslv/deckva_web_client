/** Shared left-sidebar control styles — height comes from `@/components/ui/control`. */

import { controlH, controlHTabsHorizontal } from "@/components/ui/control";

/** Control fill — readable on light + dark via muted ladder. */
export const sidebarSurface =
  "bg-muted/40 hover:bg-muted/60 dark:bg-muted/30 dark:hover:bg-muted/45";

export const sidebarSurfaceIdle = "bg-muted/40 dark:bg-muted/30";

/** @deprecated use `controlH` from `@/components/ui/control` */
export const sidebarControlH = controlH;

/** Shared root padding for every left-sidebar panel (tools, assets, settings, …). */
export const sidebarPanel =
  "flex min-w-0 flex-col gap-3 px-3.5 py-3 text-[13px] text-foreground";

export const sidebarActionBtn =
  `${controlH} rounded-md border-none ${sidebarSurface} px-3.5 text-[13px] font-medium text-foreground shadow-none transition-colors disabled:pointer-events-none disabled:opacity-40 flex items-center justify-center gap-1.5`;

export const sidebarFieldInput =
  `${controlH} w-full rounded-md border-none ${sidebarSurfaceIdle} px-3.5 text-[13px] font-normal text-foreground shadow-none outline-none placeholder:text-muted-foreground hover:bg-muted/60 focus:bg-muted/60 dark:focus:bg-muted/45`;

export const sidebarTextarea =
  `w-full resize-none rounded-md border-none ${sidebarSurfaceIdle} px-3.5 py-3 text-[13px] leading-relaxed text-foreground shadow-none outline-none placeholder:text-muted-foreground focus:bg-muted/60 dark:focus:bg-muted/45`;

export const sidebarSegmented =
  `flex ${controlH} w-full items-center rounded-md ${sidebarSurfaceIdle} p-1`;

export const sidebarSegmentedItem =
  "flex h-full flex-1 items-center justify-center rounded-md px-3 text-[13px] font-normal transition-colors";

export const sidebarSegmentedItemActive =
  "bg-background text-foreground shadow-none";

export const sidebarSegmentedItemIdle =
  "text-muted-foreground hover:text-foreground";

export const sidebarTabsList =
  `grid ${controlH} w-full grid-cols-[repeat(auto-fit,minmax(0,1fr))] rounded-md ${sidebarSurfaceIdle} p-1 ${controlHTabsHorizontal}`;

export const sidebarTabsTrigger =
  "rounded-md px-3 text-[13px] font-normal text-muted-foreground shadow-none data-active:border-transparent data-active:bg-background data-active:text-foreground dark:data-active:border-transparent dark:data-active:bg-background";

/** Height comes from SelectTrigger (`controlH`) — do not restate h-* here. */
export const sidebarSelectTrigger =
  `w-full min-w-0 rounded-md border-none ${sidebarSurface} px-3.5 text-[13px] font-normal text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-ring/20`;

/** Section stack used by tools / freeform blocks outside CollapsibleGroup. */
export const sidebarSection = "space-y-3 px-3.5 py-3";

export const sidebarSectionTitle =
  "text-[13px] font-semibold tracking-tight text-foreground";

export const sidebarHint = "text-[12px] leading-snug text-muted-foreground";

export const sidebarSwatchGrid = "grid grid-cols-6 gap-1.5";

/** Miro-like icons — same size in studio and editor (20px, light stroke). */
export const navIconClass = "size-5 shrink-0 stroke-[1.5]";

/** Dense menu-row icons (also Miro). */
export const menuIconClass = "size-5 shrink-0 stroke-[1.5]";
