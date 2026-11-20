export const TOUR_DONE_KEY = "deckva.studio.tour.v1";
/** Session-only: replay tour without signing out / clearing auth. */
export const TOUR_FORCE_KEY = "deckva.studio.tour.force";
export const TOUR_STEP_KEY = "deckva.studio.tour.step";
export const TOUR_PROJECT_KEY = "deckva.studio.tour.projectId";

export const TOUR_STEPS = [
  { id: "prompt", area: "home" },
  { id: "starters", area: "home" },
  { id: "openEditor", area: "home", action: "openEditor" },
  { id: "editorRail", area: "editor" },
  { id: "editorElements", area: "editor" },
  { id: "editorCanvas", area: "editor" },
  { id: "editorToolbar", area: "editor" },
  { id: "editorInspector", area: "editor" },
  { id: "editorExport", area: "editor" },
] as const;

export type TourStepDef = (typeof TOUR_STEPS)[number];
export type TourStepId = TourStepDef["id"];
export type TourArea = TourStepDef["area"];

export function tourStepAt(index: number): TourStepDef | null {
  return TOUR_STEPS[index] ?? null;
}

export function isTourDone(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(TOUR_DONE_KEY) === "1";
  } catch {
    return true;
  }
}

export function markTourDone(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOUR_DONE_KEY, "1");
  } catch {
    // ignore
  }
  clearTourForce();
}

export function isTourForced(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(TOUR_FORCE_KEY) === "1";
  } catch {
    return false;
  }
}

export function armTourForce(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(TOUR_FORCE_KEY, "1");
  } catch {
    // ignore
  }
}

export function clearTourForce(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(TOUR_FORCE_KEY);
    window.sessionStorage.removeItem(TOUR_STEP_KEY);
  } catch {
    // ignore
  }
}

export function readTourStepIndex(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.sessionStorage.getItem(TOUR_STEP_KEY);
    const n = raw == null ? 0 : Number(raw);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.min(Math.floor(n), TOUR_STEPS.length - 1);
  } catch {
    return 0;
  }
}

export function writeTourStepIndex(index: number): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(TOUR_STEP_KEY, String(index));
  } catch {
    // ignore
  }
}

export function readTourProjectId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(TOUR_PROJECT_KEY);
  } catch {
    return null;
  }
}

export function writeTourProjectId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(TOUR_PROJECT_KEY, id);
  } catch {
    // ignore
  }
}

export function shouldForceTourFromQuery(
  searchParams: URLSearchParams | { get(name: string): string | null },
): boolean {
  const raw = searchParams.get("playNow");
  return raw === "1" || raw === "true";
}

export function stripPlayNowFromUrl(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("playNow")) return;
  url.searchParams.delete("playNow");
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

export function tourSelector(step: TourStepId): string {
  return `[data-tour="${step}"]`;
}

export function findTourTarget(step: TourStepId): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(tourSelector(step));
}

export function pathnameTourArea(pathname: string | null): TourArea | "other" {
  if (!pathname) return "other";
  if (pathname.startsWith("/studio/editor")) return "editor";
  if (pathname === "/studio" || pathname === "/studio/") return "home";
  return "other";
}
