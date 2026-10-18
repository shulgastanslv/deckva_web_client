import type { CarouselGenerateOptions } from "./generate-options";
import {
  CAROUSEL_COPY_STYLES,
  DEFAULT_CAROUSEL_COPY_STYLE_ID,
  formatCarouselStyleCatalog,
} from "./carousel-styles";

/** Model + copy knobs for carousel generation. */
export const carouselPromptConfig = {
  headingMaxWords: 8,
  temperature: 0.55,
  topP: 0.9,
  numCtx: 4096,
  tokensBase: 64,
  tokensPerSentence: 28,
  tokensPerSlideBase: 40,
  tokensMax: 2000,
  keepAlive: "60m",
} as const;

/** System prompt assembled from the typed style catalog (no markdown file). */
export function buildCarouselStylesSystemPrompt(): string {
  const catalog = formatCarouselStyleCatalog(CAROUSEL_COPY_STYLES);
  const styleCount = CAROUSEL_COPY_STYLES.length;

  return [
    "You write Threads / Instagram carousels.",
    "",
    "OUTPUT",
    "- JSON only. No markdown. No commentary.",
    "- Schema:",
    "{",
    `  "styleId": "${DEFAULT_CAROUSEL_COPY_STYLE_ID}",`,
    '  "styleName": "Hook ladder",',
    '  "whyStyle": "one short reason tied to the topic",',
    '  "title": "short carousel title",',
    '  "slides": [',
    '    { "heading": "...", "body": "..." }',
    "  ]",
    "}",
    "- Exactly N slides (N comes from the user message).",
    '- Slide 1 = cover / hook. Last slide = payoff or clean close. No "follow / save / like" CTA.',
    `- heading ≤ ${carouselPromptConfig.headingMaxWords} words, concrete, no numbering like "1." unless the chosen style requires numbers in the text itself.`,
    "- body: exactly the requested sentence count per slide. Plain spoken. No hashtags. No emoji.",
    "- Same language as the Theme.",
    "- One idea per slide. No repeating the same tip in different words.",
    "",
    "STYLE SELECTION (mandatory)",
    "1. Read the Theme.",
    "2. Pick EXACTLY ONE style from the catalog below.",
    "3. Put its id in styleId and its name in styleName.",
    "4. Write whyStyle in ≤12 words.",
    "5. Structure the deck to match that style's rules.",
    "6. If the topic fits several styles, prefer the most specific match (not the generic tip list).",
    "7. Never invent a style outside the catalog.",
    "",
    `STYLE CATALOG (${styleCount})`,
    "",
    catalog,
    "",
    "HARD RULES",
    "- Do not mix two styles in one response.",
    "- Do not put style names into slide headings.",
    '- Do not write "Slide 1" in the content.',
    "- Prefer concrete nouns over abstract adjectives.",
    `- If Theme is empty or nonsense, still pick ${DEFAULT_CAROUSEL_COPY_STYLE_ID} and write a safe generic tips deck about clear communication.`,
  ].join("\n");
}

export function carouselSystemPrompt(options: CarouselGenerateOptions): string {
  return [
    buildCarouselStylesSystemPrompt(),
    "",
    "RUNTIME CONSTRAINTS",
    `- heading ≤${carouselPromptConfig.headingMaxWords} words`,
    `- body: exactly ${options.sentences} sentence(s) per slide`,
  ].join("\n");
}

export function carouselUserPrompt(
  theme: string,
  slides: number,
  options: CarouselGenerateOptions,
): string {
  return [
    `Theme: ${theme.trim()}`,
    `Slides: ${slides}`,
    `Sentences per slide: ${options.sentences}`,
  ].join("\n");
}

export function carouselNumPredict(slides: number, sentences: number): number {
  const m = carouselPromptConfig;
  return Math.min(
    m.tokensMax,
    m.tokensBase + slides * (m.tokensPerSlideBase + sentences * m.tokensPerSentence),
  );
}
