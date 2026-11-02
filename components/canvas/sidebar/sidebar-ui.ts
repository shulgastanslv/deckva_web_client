/** Shared left-sidebar control styles aligned with right-sidebar / PillSlider. */

/** Stronger on light theme so pills read clearly on white surfaces. */
export const sidebarSurface =
  "bg-muted/60 hover:bg-muted/80 dark:bg-muted/25 dark:hover:bg-muted/40";

export const sidebarSurfaceIdle =
  "bg-muted/60 dark:bg-muted/25";

export const sidebarActionBtn =
  `h-10 rounded-full ${sidebarSurface} px-3 text-[13px] font-medium text-foreground transition-colors disabled:pointer-events-none disabled:opacity-40 flex items-center justify-center gap-1.5`;

export const sidebarFieldInput =
  `h-10 w-full rounded-full ${sidebarSurfaceIdle} px-3.5 text-[13px] outline-none placeholder:text-muted-foreground focus:bg-muted/80 dark:focus:bg-muted/40`;

export const sidebarTextarea =
  `w-full resize-none rounded-[1.25rem] ${sidebarSurfaceIdle} px-3.5 py-3 text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground focus:bg-muted/80 dark:focus:bg-muted/40`;

export const sidebarSegmented =
  `flex h-10 w-full items-center rounded-full ${sidebarSurfaceIdle} p-1`;

export const sidebarSegmentedItem =
  "flex h-full flex-1 items-center justify-center rounded-full text-[13px] font-medium transition-colors";

export const sidebarSegmentedItemActive = "bg-background text-foreground";

export const sidebarSegmentedItemIdle =
  "text-muted-foreground hover:text-foreground";

export const sidebarTabsList =
  `grid h-11 w-full grid-cols-[repeat(auto-fit,minmax(0,1fr))] rounded-full ${sidebarSurfaceIdle} p-1 group-data-horizontal/tabs:h-11`;

export const sidebarTabsTrigger =
  "rounded-full px-2 text-[12px] font-medium shadow-none data-active:border-transparent data-active:bg-background data-active:text-foreground dark:data-active:border-transparent dark:data-active:bg-background";

export const sidebarSelectTrigger =
  `h-10 w-full min-w-0 rounded-full border-0 ${sidebarSurface} px-3.5 text-[13px] shadow-none focus-visible:ring-2 focus-visible:ring-ring/40 data-[size=default]:h-10`;
