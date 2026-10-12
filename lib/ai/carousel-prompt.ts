import { readFile } from "node:fs/promises";
import path from "node:path";

import type { CarouselGenerateOptions } from "./generate-options";

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

export const CAROUSEL_STYLES_PROMPT_PATH = path.join(
  process.cwd(),
  "docs",
  "ollama-carousel-styles-prompt.md",
);

const FALLBACK_SYSTEM_PROMPT = [
  "You write Threads / Instagram carousels.",
  'JSON only: {"title":"...","slides":[{"heading":"...","body":"..."}]}',
  "Slide 1 is an introduction. No follow/save CTA.",
  "Same language as the theme. No markdown.",
].join("\n");

let cachedSystemPrompt: string | null = null;
let cachedPromptPath: string | null = null;

/** Pull the first fenced ```text block after a markdown heading. */
export function extractPromptSection(markdown: string, heading: string): string {
  const headingIdx = markdown.indexOf(heading);
  if (headingIdx < 0) {
    throw new Error(`Prompt file missing heading: ${heading}`);
  }

  const after = markdown.slice(headingIdx + heading.length);
  const match = after.match(/```(?:text)?\r?\n([\s\S]*?)\r?\n```/);
  const body = match?.[1]?.trim();
  if (!body) {
    throw new Error(`Prompt file missing fenced block after: ${heading}`);
  }
  return body;
}

/** Load + cache the SYSTEM PROMPT block from docs/ollama-carousel-styles-prompt.md */
export async function loadCarouselStylesSystemPrompt(
  filePath: string = CAROUSEL_STYLES_PROMPT_PATH,
): Promise<string> {
  if (cachedSystemPrompt && cachedPromptPath === filePath) {
    return cachedSystemPrompt;
  }

  try {
    const markdown = await readFile(filePath, "utf8");
    const prompt = extractPromptSection(markdown, "## SYSTEM PROMPT");
    cachedSystemPrompt = prompt;
    cachedPromptPath = filePath;
    return prompt;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[carousel-prompt] Falling back to inline system prompt: ${reason}`);
    cachedSystemPrompt = FALLBACK_SYSTEM_PROMPT;
    cachedPromptPath = filePath;
    return FALLBACK_SYSTEM_PROMPT;
  }
}

/** Clear cache — useful in tests or after editing the md at runtime. */
export function clearCarouselPromptCache(): void {
  cachedSystemPrompt = null;
  cachedPromptPath = null;
}

export async function carouselSystemPrompt(options: CarouselGenerateOptions): Promise<string> {
  const base = await loadCarouselStylesSystemPrompt();
  return [
    base,
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
