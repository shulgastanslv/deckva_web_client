/**
 * Base prompt knobs. Runtime UI options (sentences, CTA, etc.) override these
 * via `lib/ai/generate-options.ts` + the Generate sidebar.
 */
export const carouselPromptConfig = {
  role: "You write clear Instagram carousel copy for Swibp.",
  systemExtra: "",
  userExtra: "",

  heading: {
    maxWords: 8,
    style: "clear, concrete, no clickbait, no numbering",
  },

  body: {
    style: "plain spoken, useful, one idea per sentence, no hashtags, no emoji",
  },

  model: {
    temperature: 0.3,
    topP: 0.85,
    numCtx: 2048,
    tokensBase: 48,
    /** Extra tokens per sentence on a slide */
    tokensPerSentence: 28,
    tokensPerSlideBase: 36,
    tokensMax: 1600,
    keepAlive: "60m",
  },
} as const;

export type CarouselPromptConfig = typeof carouselPromptConfig;

export function fillPromptTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined || value === null ? "" : String(value);
  });
}
