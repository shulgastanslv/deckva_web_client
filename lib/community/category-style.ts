/** Stable pastel chip tones for community / template category labels. */
const PASTEL_TONES = [
  "bg-rose-100 text-rose-800 dark:bg-rose-950/55 dark:text-rose-200",
  "bg-orange-100 text-orange-800 dark:bg-orange-950/55 dark:text-orange-200",
  "bg-amber-100 text-amber-900 dark:bg-amber-950/55 dark:text-amber-200",
  "bg-lime-100 text-lime-900 dark:bg-lime-950/55 dark:text-lime-200",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/55 dark:text-emerald-200",
  "bg-teal-100 text-teal-800 dark:bg-teal-950/55 dark:text-teal-200",
  "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/55 dark:text-cyan-200",
  "bg-sky-100 text-sky-800 dark:bg-sky-950/55 dark:text-sky-200",
  "bg-blue-100 text-blue-800 dark:bg-blue-950/55 dark:text-blue-200",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/55 dark:text-indigo-200",
  "bg-violet-100 text-violet-800 dark:bg-violet-950/55 dark:text-violet-200",
  "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/55 dark:text-fuchsia-200",
  "bg-pink-100 text-pink-800 dark:bg-pink-950/55 dark:text-pink-200",
  "bg-stone-100 text-stone-800 dark:bg-stone-900/60 dark:text-stone-200",
] as const;

export function communityCategoryTone(category: string): string {
  const key = category.trim().toLowerCase();
  if (!key) return PASTEL_TONES[PASTEL_TONES.length - 1]!;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return PASTEL_TONES[Math.abs(hash) % PASTEL_TONES.length]!;
}

export const communityCategoryChipClass =
  "inline-flex max-w-full truncate rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide";
