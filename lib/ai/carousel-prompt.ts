export function carouselSystemPrompt(): string {
  return 'Reply with JSON only: {"title":"...","slides":[{"heading":"...","body":"..."}]}. Same language as theme. heading ≤6 words, body ≤12 words.';
}

export function carouselUserPrompt(theme: string, slides: number): string {
  return `${slides} slides about: ${theme.trim()}`;
}
