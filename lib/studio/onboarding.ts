/** First-run carousel topics — activation chips on empty studio home. */
export const STARTER_CAROUSEL_PROMPTS = [
  {
    id: "launch",
    label: "Launch",
    topic:
      "A product launch in six slides: the offer, who it is for, the proof, and what to do next.",
  },
  {
    id: "howto",
    label: "How-to",
    topic:
      "A how-to carousel where each slide is one clear step, and the last slide is the result.",
  },
  {
    id: "offer",
    label: "Offer",
    topic:
      "An offer in five slides: the problem, the thing, the proof, the price, and the next step.",
  },
  {
    id: "tips",
    label: "Tips",
    topic:
      "A tips carousel with one practical tip per slide and a short takeaway at the end.",
  },
  {
    id: "myths",
    label: "Myths",
    topic:
      "A myth-busting carousel: one common myth per slide, then the truth, ending with a clear takeaway.",
  },
  {
    id: "checklist",
    label: "Checklist",
    topic:
      "A checklist carousel where each slide is one item to complete before a launch or deadline.",
  },
  {
    id: "story",
    label: "Story",
    topic:
      "A founder story in six slides: the spark, the struggle, the turn, the proof, and the ask.",
  },
  {
    id: "comparison",
    label: "Compare",
    topic:
      "A comparison carousel: option A vs option B, who each is for, and a simple recommendation.",
  },
  {
    id: "mistakes",
    label: "Mistakes",
    topic:
      "Common mistakes carousel: one mistake per slide with a fix, ending with a better default habit.",
  },
  {
    id: "framework",
    label: "Framework",
    topic:
      "A simple framework carousel: name the model, walk through 3–4 steps, then show how to apply it.",
  },
  {
    id: "case",
    label: "Case study",
    topic:
      "A case-study carousel: context, goal, what changed, the numbers, and what to copy.",
  },
  {
    id: "thread",
    label: "Thread",
    topic:
      "A thread-style carousel that opens with a hook, builds one idea per slide, and closes with a CTA.",
  },
  {
    id: "brand",
    label: "Brand",
    topic:
      "A personal brand carousel: who you help, how you help, proof, and how to work with you.",
  },
  {
    id: "pricing",
    label: "Pricing",
    topic:
      "A pricing carousel: the offer tiers, who each is for, what’s included, and how to choose.",
  },
  {
    id: "onboarding",
    label: "Onboarding",
    topic:
      "A customer onboarding carousel: day-one setup, first win, common blockers, and the next milestone.",
  },
] as const;

export type StarterCarouselId = (typeof STARTER_CAROUSEL_PROMPTS)[number]["id"];

/** Pick a fresh random subset for the home “ready topic” chips. */
export function pickStarterPrompts(count = 4) {
  const pool = [...STARTER_CAROUSEL_PROMPTS];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  const n = Math.min(Math.max(3, count), pool.length);
  return pool.slice(0, n);
}
