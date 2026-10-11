import type { CarouselGenerateOptions } from "./generate-options";

/** Model + copy knobs for carousel generation. */
export const carouselPromptConfig = {
  role: "You write clear Threads carousel",
  headingMaxWords: 8,
  headingStyle: "clear, concrete, no clickbait, no numbering",
  bodyStyle: "plain spoken, useful, one idea per sentence, no hashtags, no emoji",
  temperature: 0.3,
  topP: 0.85,
  numCtx: 2048,
  tokensBase: 48,
  tokensPerSentence: 28,
  tokensPerSlideBase: 36,
  tokensMax: 1600,
  keepAlive: "60m",
} as const;

export function carouselSystemPrompt(options: CarouselGenerateOptions): string {
  const cfg = carouselPromptConfig;
  return [
    cfg.role,
    'JSON only: {"title":"...","slides":[{"heading":"...","body":"..."}]}',
    `heading ≤${cfg.headingMaxWords} words; ${cfg.headingStyle}`,
    `body: exactly ${options.sentences} sentence(s); ${cfg.bodyStyle}`,
    "Slide 1 is an introduction: set up the topic and hook the reader.",
    "Slides after that are tips/points. No CTA — do not write 'follow' or 'save this'.",
    "Same language as the theme. No markdown.",
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
