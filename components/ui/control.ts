/**
 * Single control size for the studio UI (= Button `sm`).
 * Change every class here together (Tailwind needs full string literals).
 * Used by Button / Input / Select / Tabs / sidebar tokens / custom control shells.
 */
export const controlH = "h-10";
/** @deprecated same as `controlH` — kept for call-sites that still import it */
export const controlHSm = "h-10";
export const controlSize = "size-10";

/**
 * Shared Input / SelectTrigger / custom select-shell chrome.
 * Keep padding + type identical so neighbors line up.
 */
export const controlField =
  "box-border h-10 min-h-10 rounded-md border-none bg-muted/40 px-3.5 text-[13px] font-normal shadow-none";

/** Select size attrs — keep in sync with `controlH`. */
export const controlHSelectDefault = "data-[size=default]:h-10";
export const controlHSelectSm = "data-[size=sm]:h-10";

/** Tabs list height — keep in sync with `controlH`. */
export const controlHTabsHorizontal = "group-data-horizontal/tabs:h-10";
