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
  {
    id: "faq",
    label: "FAQ",
    topic:
      "An FAQ carousel: one common question per slide with a short clear answer, ending with how to ask more.",
  },
  {
    id: "beforeAfter",
    label: "Before/after",
    topic:
      "A before-and-after carousel: the old way, the pain, the change, the new result, and what to try next.",
  },
  {
    id: "roadmap",
    label: "Roadmap",
    topic:
      "A roadmap carousel: the destination, 4–5 milestones in order, and the first step to start today.",
  },
  {
    id: "testimonials",
    label: "Proof",
    topic:
      "A social-proof carousel: a bold claim, 3–4 short testimonials or results, then a soft CTA.",
  },
  {
    id: "trends",
    label: "Trends",
    topic:
      "A trends carousel: what’s shifting now, why it matters, 3 concrete examples, and how to respond.",
  },
  {
    id: "habits",
    label: "Habits",
    topic:
      "A habits carousel: one small daily habit per slide with why it works, ending with a 7-day challenge.",
  },
  {
    id: "unpopular",
    label: "Hot take",
    topic:
      "An unpopular-opinion carousel: a sharp take, why most people get it wrong, the better approach, and a CTA.",
  },
  {
    id: "stats",
    label: "Stats",
    topic:
      "A stats carousel: one surprising number per slide with a one-line meaning, closing with the insight.",
  },
  {
    id: "tools",
    label: "Tools",
    topic:
      "A tools carousel: 5 tools for one job, who each is for, and a simple pick for beginners.",
  },
  {
    id: "audience",
    label: "Audience",
    topic:
      "An audience carousel: who you serve, their pains, the transformation, and how they usually find you.",
  },
  {
    id: "webinar",
    label: "Event",
    topic:
      "An event promo carousel: the promise, who it’s for, the agenda highlights, and how to join.",
  },
  {
    id: "teaser",
    label: "Teaser",
    topic:
      "A teaser carousel: a hook, three curiosity gaps, a reveal of what’s coming, and a waitlist CTA.",
  },
  {
    id: "recap",
    label: "Recap",
    topic:
      "A weekly recap carousel: 5 highlights, one lesson, and what you’re focusing on next.",
  },
  {
    id: "manifesto",
    label: "Manifesto",
    topic:
      "A manifesto carousel: the belief, what you reject, what you stand for, and an invite to join.",
  },
  {
    id: "swipeFile",
    label: "Swipe file",
    topic:
      "A swipe-file carousel: 5 examples worth stealing, what makes each work, and how to adapt one today.",
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
