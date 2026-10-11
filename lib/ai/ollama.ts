import { Ollama } from "ollama";

import {
  carouselNumPredict,
  carouselPromptConfig,
  carouselSystemPrompt,
  carouselUserPrompt,
} from "./carousel-prompt";
import type { CarouselGenerateOptions } from "./generate-options";

const OLLAMA_HOST = process.env.OLLAMA_HOST?.trim() || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL?.trim() || "qwen2.5:3b";

export function ollamaModel(): string {
  return OLLAMA_MODEL;
}

function client(): Ollama {
  return new Ollama({ host: OLLAMA_HOST });
}

function withAbort(ollama: Ollama, signal?: AbortSignal): () => void {
  if (!signal) return () => undefined;
  const abort = () => {
    try {
      ollama.abort();
    } catch {
      // ignore
    }
  };
  if (signal.aborted) abort();
  else signal.addEventListener("abort", abort, { once: true });
  return () => signal.removeEventListener("abort", abort);
}

/** Pull JSON object from model text that may wrap it in fences. */
export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // continue
  }
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // continue
    }
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }
  throw new Error("Model did not return JSON");
}

export async function completeOllamaCarousel(input: {
  theme: string;
  slides: number;
  options: CarouselGenerateOptions;
  signal?: AbortSignal;
}): Promise<unknown> {
  const ollama = client();
  const clear = withAbort(ollama, input.signal);
  const { temperature, topP, numCtx, keepAlive } = carouselPromptConfig;

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
