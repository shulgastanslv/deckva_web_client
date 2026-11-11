/** Shared left-sidebar control styles — one size/padding ladder for all panels. */

/** Control fill — readable on light + dark via muted ladder. */
export const sidebarSurface =
  "bg-muted/50 hover:bg-muted/70 dark:bg-muted/30 dark:hover:bg-muted/45";

export const sidebarSurfaceIdle = "bg-muted/50 dark:bg-muted/30";

/** Standard control height across sidebar panels. */
export const sidebarControlH = "h-10";

/** Shared root padding for every left-sidebar panel (tools, assets, settings, …). */
export const sidebarPanel =
  "flex min-w-0 flex-col gap-3 px-3.5 py-3 text-[13px] text-foreground";

export const sidebarActionBtn =
  `h-10 rounded-md ${sidebarSurface} px-3.5 text-[13px] font-medium text-foreground transition-colors disabled:pointer-events-none disabled:opacity-40 flex items-center justify-center gap-1.5`;

export const sidebarFieldInput =
  `h-10 w-full rounded-md ${sidebarSurfaceIdle} px-3.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:bg-muted/70 dark:focus:bg-muted/45`;

export const sidebarTextarea =
  `w-full resize-none rounded-md ${sidebarSurfaceIdle} px-3.5 py-3 text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:bg-muted/70 dark:focus:bg-muted/45`;

export const sidebarSegmented =
  `flex h-10 w-full items-center rounded-md ${sidebarSurfaceIdle} p-1`;

export const sidebarSegmentedItem =
  "flex h-full flex-1 items-center justify-center rounded-md text-[13px] font-medium transition-colors";

export const sidebarSegmentedItemActive =
  "bg-background text-foreground shadow-none";

export const sidebarSegmentedItemIdle =
  "text-muted-foreground hover:text-foreground";

export const sidebarTabsList =
  `grid h-10 w-full grid-cols-[repeat(auto-fit,minmax(0,1fr))] rounded-md ${sidebarSurfaceIdle} p-1 group-data-horizontal/tabs:h-10`;

export const sidebarTabsTrigger =
  "rounded-md px-2 text-[12px] font-medium text-muted-foreground shadow-none data-active:border-transparent data-active:bg-background data-active:text-foreground dark:data-active:border-transparent dark:data-active:bg-background";

export const sidebarSelectTrigger =
  `h-10 w-full min-w-0 rounded-md border-0 ${sidebarSurface} px-3.5 text-[13px] text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-ring/40 data-[size=default]:h-10`;

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
