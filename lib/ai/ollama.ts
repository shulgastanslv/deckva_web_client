import { Ollama } from "ollama";

import { carouselSystemPrompt, carouselUserPrompt } from "./carousel-prompt";
import { extractJsonObject, ideasSystemPrompt, ideasUserPrompt } from "./ideas";

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

/** One-shot JSON chat — faster than streaming JSONL for small local models. */
export async function completeOllamaCarousel(input: {
  theme: string;
  slides: number;
  signal?: AbortSignal;
}): Promise<unknown> {
  const ollama = client();
  const clear = withAbort(ollama, input.signal);
  try {
    const response = await ollama.chat({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      keep_alive: "60m",
      options: {
        temperature: 0.2,
        top_p: 0.85,
        num_predict: Math.min(500, 24 + input.slides * 36),
        num_ctx: 1024,
      },
      messages: [
        { role: "system", content: carouselSystemPrompt() },
        { role: "user", content: carouselUserPrompt(input.theme, input.slides) },
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
      keep_alive: "60m",
      options: {
        temperature: 0.5,
        num_predict: 320,
        num_ctx: 1024,
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
