import { Ollama } from "ollama";

import { carouselSystemPrompt, carouselUserPrompt } from "./carousel-prompt";
import type { CarouselGenerateOptions } from "./generate-options";
import { extractJsonObject, ideasSystemPrompt, ideasUserPrompt } from "./ideas";
import { carouselPromptConfig } from "./prompt-config";

const OLLAMA_HOST = process.env.OLLAMA_HOST?.trim() || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL?.trim() || "qwen2.5:3b";

export function ollamaModel(): string {
  return OLLAMA_MODEL;
}

function client(): Ollama {
  return new Ollama({ host: OLLAMA_HOST });
}

function withAbort(ollama: Ollama, signal?: AbortSignal): () => void {
  const abort = () => {
    try {
      ollama.abort();
    } catch {
      // ignore
    }
  };
  if (!signal) return () => undefined;
  if (signal.aborted) abort();
  else signal.addEventListener("abort", abort, { once: true });
  return () => signal.removeEventListener("abort", abort);
}

function carouselNumPredict(slides: number, sentences: number): number {
  const m = carouselPromptConfig.model;
  const perSlide = m.tokensPerSlideBase + sentences * m.tokensPerSentence;
  return Math.min(m.tokensMax, m.tokensBase + slides * perSlide);
}

export async function completeOllamaCarousel(input: {
  theme: string;
  slides: number;
  options: CarouselGenerateOptions;
  signal?: AbortSignal;
}): Promise<unknown> {
  const ollama = client();
  const clear = withAbort(ollama, input.signal);
  const { temperature, topP, numCtx, keepAlive } = carouselPromptConfig.model;

  try {
    const response = await ollama.chat({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      keep_alive: keepAlive,
      options: {
        temperature,
        top_p: topP,
        num_predict: carouselNumPredict(input.slides, input.options.sentences),
        num_ctx: numCtx,
      },
      messages: [
        { role: "system", content: carouselSystemPrompt(input.options) },
        {
          role: "user",
          content: carouselUserPrompt(input.theme, input.slides, input.options),
        },
      ],
    });
    const content = response.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("Empty Ollama carousel response");
    }
    return extractJsonObject(content);
  } finally {
    clear();
  }
}

export async function completeOllamaIdeas(input: {
  seed: string;
  signal?: AbortSignal;
}): Promise<unknown> {
  const ollama = client();
  const clear = withAbort(ollama, input.signal);
  try {
    const response = await ollama.chat({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      keep_alive: carouselPromptConfig.model.keepAlive,
      options: {
        temperature: 0.5,
        num_predict: 280,
        num_ctx: 1536,
      },
      messages: [
        { role: "system", content: ideasSystemPrompt() },
        { role: "user", content: ideasUserPrompt(input.seed) },
      ],
    });
    const content = response.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("Empty Ollama ideas response");
    }
    return extractJsonObject(content);
  } finally {
    clear();
  }
}
