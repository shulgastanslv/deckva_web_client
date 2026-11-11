/** Shared left-sidebar control styles — one size/padding ladder for all panels. */

/** Stronger on light theme so controls read clearly on white surfaces. */
export const sidebarSurface =
  "bg-muted/60 hover:bg-muted/80 dark:bg-muted/25 dark:hover:bg-muted/40";

export const sidebarSurfaceIdle = "bg-muted/60 dark:bg-muted/25";

/** Standard control height across sidebar panels. */
export const sidebarControlH = "h-10";

/** Shared root padding for every left-sidebar panel (tools, assets, settings, …). */
export const sidebarPanel =
  "flex min-w-0 flex-col gap-3 px-3.5 py-3 text-[13px] text-foreground";

export const sidebarActionBtn =
  `h-10 rounded-md ${sidebarSurface} px-3.5 text-[13px] font-medium text-foreground transition-colors disabled:pointer-events-none disabled:opacity-40 flex items-center justify-center gap-1.5`;

export const sidebarFieldInput =
  `h-10 w-full rounded-md ${sidebarSurfaceIdle} px-3.5 text-[13px] outline-none placeholder:text-muted-foreground focus:bg-muted/80 dark:focus:bg-muted/40`;

export const sidebarTextarea =
  `w-full resize-none rounded-md ${sidebarSurfaceIdle} px-3.5 py-3 text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground focus:bg-muted/80 dark:focus:bg-muted/40`;

export const sidebarSegmented =
  `flex h-10 w-full items-center rounded-md ${sidebarSurfaceIdle} p-1`;

export const sidebarSegmentedItem =
  "flex h-full flex-1 items-center justify-center rounded-md text-[13px] font-medium transition-colors";

export const sidebarSegmentedItemActive = "bg-background text-foreground";

export const sidebarSegmentedItemIdle =
  "text-muted-foreground hover:text-foreground";

export const sidebarTabsList =
  `grid h-10 w-full grid-cols-[repeat(auto-fit,minmax(0,1fr))] rounded-md ${sidebarSurfaceIdle} p-1 group-data-horizontal/tabs:h-10`;

export const sidebarTabsTrigger =
  "rounded-md px-2 text-[12px] font-medium shadow-none data-active:border-transparent data-active:bg-background data-active:text-foreground dark:data-active:border-transparent dark:data-active:bg-background";

export const sidebarSelectTrigger =
  `h-10 w-full min-w-0 rounded-md border-0 ${sidebarSurface} px-3.5 text-[13px] shadow-none focus-visible:ring-2 focus-visible:ring-ring/40 data-[size=default]:h-10`;

/** Section stack used by tools / freeform blocks outside CollapsibleGroup. */
export const sidebarSection = "space-y-3 px-3.5 py-3";

export const sidebarSectionTitle =
  "text-[13px] font-semibold tracking-tight text-foreground";

export const sidebarHint = "text-[12px] leading-snug text-muted-foreground";

export const sidebarSwatchGrid = "grid grid-cols-6 gap-1.5";

/** Nav / rail icons — same in studio and editor. */
export const navIconClass = "size-4 shrink-0 stroke-[1.75]";
