/**
 * Shared phone chrome — Apple-glass floating surfaces.
 * Soft rects on controls stay `rounded-md`; only chrome shells use large radii.
 */

/** Light frosted glass (docks / pills that float over content). */
export const mobileGlassSurface =
  "border border-border/40 bg-background/80 shadow-sm backdrop-blur-xl dark:border-border/50 dark:bg-background/75";

/** Floating bottom dock inset from screen edges. */
export const mobileGlassDock =
  `${mobileGlassSurface} mx-3 mb-[max(0.5rem,env(safe-area-inset-bottom))] rounded-[1.75rem]`;

/**
 * Bottom sheet — more opaque so canvas behind doesn’t wash the panel,
 * still frosted at the edges via blur.
 */
export const mobileGlassSheet =
  "mx-2.5 rounded-[1.75rem] border border-border/40 bg-background/95 shadow-sm backdrop-blur-2xl dark:border-border/50 dark:bg-background/92";

/** Compact floating control (zoom, chips). */
export const mobileGlassPill =
  `${mobileGlassSurface} rounded-2xl`;

/** Side drawer on phone. */
export const mobileGlassDrawer =
  "rounded-[1.75rem] border border-border/40 bg-background/95 shadow-sm backdrop-blur-2xl dark:border-border/50 dark:bg-background/92";

/** Space reserved under content for the floating dock (phone only). */
export const mobileDockClearance =
  "max-md:pb-[calc(5.75rem+env(safe-area-inset-bottom))]";

/** Sheet sits above dock: dock height ≈ 3.25rem + mb + safe-area. */
export const mobileSheetBottom =
  "bottom-[calc(4.25rem+env(safe-area-inset-bottom))]";
