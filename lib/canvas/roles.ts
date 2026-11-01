/**
 * One catalog for every canvas object role.
 * Chrome sync, insight text, pinning, and double-click read this
 * instead of keeping their own string lists.
 */
export const ROLE_CATALOG = {
  number: { chrome: true, skipInsights: true },
  handle: { chrome: true, skipInsights: true },
  swipe: { chrome: true, skipInsights: true },
  cue: { skipInsights: true },
  social: { skipInsights: true },
  cta: { skipInsights: true },
  split: { pinned: true, activate: "split" },
  frame: { activate: "frame" },
  arrow: {},
  progress: {},
  caption: {},
  code: {},
} as const;

export type ObjectRole = keyof typeof ROLE_CATALOG;
export type RoleActivate = "split" | "frame";

type Flagged<Flag extends string> = {
  [K in ObjectRole]: (typeof ROLE_CATALOG)[K] extends Record<Flag, unknown> ? K : never;
}[ObjectRole];

/** Roles copied onto every slide (counter, author chip, swipe cue). */
export type ChromeRole = Flagged<"chrome">;

export function objectRole(value: unknown): ObjectRole | null {
  return typeof value === "string" && value in ROLE_CATALOG ? (value as ObjectRole) : null;
}

function carriedRole(obj: object | null | undefined): unknown {
  if (!obj) return undefined;
  return (obj as { swibpRole?: unknown }).swibpRole;
}

export function roleOf(obj: object | null | undefined): ObjectRole | null {
  return objectRole(carriedRole(obj));
}

export function hasRole(obj: object | null | undefined, role: ObjectRole): boolean {
  return roleOf(obj) === role;
}

export function chromeRole(value: unknown): ChromeRole | null {
  const role = objectRole(value);
  if (!role || !("chrome" in ROLE_CATALOG[role])) return null;
  return role as ChromeRole;
}

/** What a double-click on this role should do. Shapes without a role stay fillable. */
export function activateFor(role: ObjectRole | null): RoleActivate | null {
  if (role !== "split" && role !== "frame") return null;
  return ROLE_CATALOG[role].activate;
}

export function isPinnedRole(obj: object | null | undefined): boolean {
  const role = roleOf(obj);
  return role != null && "pinned" in ROLE_CATALOG[role];
}

/** Corner labels are not the slide's own copy. */
export function skipsInsightText(role: unknown): boolean {
  const parsed = objectRole(role);
  return parsed != null && "skipInsights" in ROLE_CATALOG[parsed];
}
