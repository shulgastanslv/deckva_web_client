import type { CarouselGenerateOptions } from "./generate-options";
import { carouselPromptConfig } from "./prompt-config";

export function carouselSystemPrompt(options: CarouselGenerateOptions): string {
  const cfg = carouselPromptConfig;
  const lines = [
    cfg.role,
    'JSON only: {"title":"...","slides":[{"heading":"...","body":"..."}]}',
    `heading ≤${cfg.heading.maxWords} words; ${cfg.heading.style}`,
    `body: exactly ${options.sentences} sentence(s); ${cfg.body.style}`,
    options.includeCta
      ? "Last slide is a CTA (invite / next step). Earlier slides are tips."
      : "No CTA — every slide is a tip/point. Do not write 'follow' or 'save this'.",
    "Same language as the theme. No markdown.",
  ];

  const extra = cfg.systemExtra.trim();
  if (extra) lines.push(extra);
  return lines.join("\n");
}

export function carouselUserPrompt(
  theme: string,
  slides: number,
  options: CarouselGenerateOptions,
): string {
  const lines = [
    `Theme: ${theme.trim()}`,
    `Slides: ${slides}`,
    `Sentences per slide: ${options.sentences}`,
    options.includeCta ? "Include a CTA on the last slide." : "No CTA slide.",
  ];
  const extra = carouselPromptConfig.userExtra.trim();
  if (extra) lines.push(extra);
  return lines.join("\n");
}
