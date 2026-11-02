/** Local copies of fffuel dddepth 3D shape backgrounds (`public/dddepth/3dshapes`). */
export const DDDEPTH_COUNT = 354;

export function dddepthPath(index: number): string {
  const n = Math.min(DDDEPTH_COUNT, Math.max(1, Math.round(index)));
  return `/dddepth/3dshapes/dddepth-${String(n).padStart(3, "0")}.jpg`;
}

export const DDDEPTH_BACKGROUNDS: readonly string[] = Array.from(
  { length: DDDEPTH_COUNT },
  (_, i) => dddepthPath(i + 1),
);
