import {
  STARTER_TOPICS,
  type StarterTopic,
} from "@/lib/studio/starter-topics";

export type { StarterTopic };
export { STARTER_TOPICS, starterText } from "@/lib/studio/starter-topics";

export type StarterCarouselId = StarterTopic["id"];

/** Random 3–5 ready topics for the studio home chips. */
export function pickStarterPrompts(count = 4): StarterTopic[] {
  const pool = [...STARTER_TOPICS];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = swap;
  }
  const n = Math.min(pool.length, Math.min(5, Math.max(3, count)));
  return pool.slice(0, n);
}
