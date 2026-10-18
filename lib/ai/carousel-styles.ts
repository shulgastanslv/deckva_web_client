/** Narrative / copy structure for AI-generated carousels (not visual palettes). */

export interface CarouselCopyStyle {
  id: string;
  name: string;
  useWhen: string;
  shape: string;
  voice: string;
}

export const CAROUSEL_COPY_STYLES: readonly CarouselCopyStyle[] = [
  {
    id: "01_hook_ladder",
    name: "Hook ladder",
    useWhen: 'broad tips, beginner advice, "how to start X"',
    shape:
      "Slide 1 bold promise → each next slide one sharper tip → last slide the key rule",
    voice: "clear, practical, no fluff",
  },
  {
    id: "02_contrarian",
    name: "Contrarian take",
    useWhen: 'hot takes, myths, "stop doing X", industry opinions',
    shape:
      "Slide 1 challenges common belief → middle slides evidence / reasons → last slide the better alternative",
    voice: "sharp, confident, not rude",
  },
  {
    id: "03_myth_bust",
    name: "Myth vs reality",
    useWhen: 'misconceptions, "people think…", education that corrects errors',
    shape:
      "Alternate or pair myth → truth. Cover names the myth zone. Close with the corrected mental model",
    voice: "calm teacher",
  },
  {
    id: "04_mistake_list",
    name: "Mistakes to avoid",
    useWhen: 'pitfalls, "don\'t do this", common failures',
    shape:
      "Cover = the expensive mistake zone. One mistake per middle slide (what + why it hurts). Close = the fix habit",
    voice: "blunt, helpful",
  },
  {
    id: "05_framework",
    name: "Named framework",
    useWhen: 'systems, mental models, processes, "X method"',
    shape:
      "Cover names the framework. One step / pillar per slide. Close = when to use it",
    voice: "structured, memorable labels",
  },
  {
    id: "06_checklist",
    name: "Checklist carousel",
    useWhen: 'launch prep, audits, routines, "before you post / ship"',
    shape:
      "Cover = what you are checking. Each slide one check item with a short why. Close = pass/fail rule",
    voice: "crisp, actionable",
  },
  {
    id: "07_before_after",
    name: "Before → after",
    useWhen: "transformation, results, redesign, habit change",
    shape:
      "Cover = the gap. Early slides = before pain. Middle = the shift. Late slides = after state. Close = the lever that caused it",
    voice: "concrete, sensory details",
  },
  {
    id: "08_story_arc",
    name: "Mini story",
    useWhen: "personal lessons, founder stories, case anecdotes",
    shape: "Setup → tension → decision → result → lesson. One beat per slide",
    voice: "first or close third person, narrative, still useful",
  },
  {
    id: "09_case_study",
    name: "Mini case study",
    useWhen: "a product, campaign, client, or experiment with outcomes",
    shape: "Context → goal → action → metric/result → takeaway",
    voice: "specific numbers if given; otherwise qualitative but precise",
  },
  {
    id: "10_compare",
    name: "A vs B",
    useWhen: "choices, tools, approaches, tradeoffs",
    shape:
      'Cover frames the choice. Then criteria slides. Then "pick A if… / pick B if…". Close = decision rule',
    voice: "fair, decisive",
  },
  {
    id: "11_problem_solve",
    name: "Problem → solution",
    useWhen: 'pain-led topics, troubleshooting, "stuck with X"',
    shape:
      "Cover = the pain. Diagnose causes. Then solutions. Close = first action today",
    voice: "empathetic, direct",
  },
  {
    id: "12_faq",
    name: "FAQ carousel",
    useWhen: 'objections, onboarding, "people ask me…"',
    shape:
      "Cover = the question cluster. Each slide one Q as heading + short A as body. Close = the umbrella answer",
    voice: "plain Q&A",
  },
  {
    id: "13_glossary",
    name: "Beginner glossary",
    useWhen: 'jargon-heavy niches, "terms explained", first-week learning',
    shape:
      "Cover = why the words matter. One term per slide (heading = term, body = plain definition + tiny example). Close = how to use the vocab",
    voice: "simple, no jargon inside definitions",
  },
  {
    id: "14_stats_proof",
    name: "Proof / stats",
    useWhen: 'research, benchmarks, "why this works", authority posts',
    shape:
      "Cover = the claim. Each slide one proof point. Close = what to do with the proof",
    voice:
      "sober, no fake precision. If no real numbers in theme, use qualitative proof only — never invent statistics",
  },
  {
    id: "15_build_public",
    name: "Build in public",
    useWhen: "shipping, indie hacking, creator process, weekly updates",
    shape:
      "Cover = what is being built. Constraints → attempts → what broke → what changed → next bet",
    voice: "honest, operator tone",
  },
  {
    id: "16_teardown",
    name: "Teardown",
    useWhen: "dissecting a post, product, landing page, funnel, or tweet",
    shape:
      "Cover = what is under the microscope. One observation per slide. Close = reusable principle",
    voice: "analytical, specific",
  },
  {
    id: "17_soft_life",
    name: "Soft / reflective",
    useWhen: "wellness, mindset, slow living, gentle habits",
    shape:
      "Cover = the feeling or tension. Soft observations. Close = one small permission or practice",
    voice: "warm, short, no hustle language",
  },
  {
    id: "18_punchy",
    name: "Punchy one-liners",
    useWhen: "motivation, brand lines, manifesto, short attention topics",
    shape:
      "Almost every slide is a strong heading; body is one short reinforcing line. Cover has the thesis. Close lands the line people remember",
    voice: "rhythmic, bold, still concrete",
  },
  {
    id: "19_deep_unpack",
    name: "One idea, deep unpack",
    useWhen: "a single nuanced concept that needs explanation, not a tip dump",
    shape:
      "Cover names the idea. Then definition → why it matters → how it shows up → common miss → how to practice",
    voice: "focused, no side quests",
  },
  {
    id: "20_playbook",
    name: "Day-one playbook",
    useWhen: '"start today", 7-day plans, first session guides, tactical how-tos',
    shape:
      "Cover = the outcome in one session / week. Ordered actions. Close = success criteria",
    voice: "coach, sequential, timed where useful",
  },
] as const;

export const DEFAULT_CAROUSEL_COPY_STYLE_ID = CAROUSEL_COPY_STYLES[0]!.id;

export function formatCarouselStyleCatalog(
  styles: readonly CarouselCopyStyle[] = CAROUSEL_COPY_STYLES,
): string {
  return styles
    .map(
      (style) =>
        [
          `${style.id} — ${style.name}`,
          `Use when: ${style.useWhen}.`,
          `Shape: ${style.shape}.`,
          `Voice: ${style.voice}.`,
        ].join("\n"),
    )
    .join("\n\n");
}
