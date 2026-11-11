"use client";

import type { IconType } from "react-icons";
import {
  SiAnthropic,
  SiClaude,
  SiDeepseek,
  SiGoogledrive,
  SiGooglegemini,
  SiHuggingface,
  SiMeta,
  SiMistralai,
  SiOllama,
  SiPerplexity,
  SiPinterest,
  SiX,
} from "react-icons/si";
import { cn } from "@/lib/utils";

export type BrandKey =
  | "openai"
  | "anthropic"
  | "claude"
  | "gemini"
  | "google"
  | "deepseek"
  | "mistral"
  | "meta"
  | "ollama"
  | "huggingface"
  | "perplexity"
  | "xai"
  | "pinterest"
  | "googledrive"
  | "unknown";

type BrandMeta = {
  key: BrandKey;
  label: string;
  color: string;
  Icon?: IconType;
  /** Fallback CDN mark when Simple Icons lacks the brand (e.g. OpenAI). */
  src?: string;
};

const BRANDS: Record<BrandKey, BrandMeta> = {
  openai: {
    key: "openai",
    label: "OpenAI",
    color: "#10A37F",
    src: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@1.26.0/icons/openai.svg",
  },
  anthropic: {
    key: "anthropic",
    label: "Anthropic",
    color: "#D97757",
    Icon: SiAnthropic,
  },
  claude: {
    key: "claude",
    label: "Claude",
    color: "#D97757",
    Icon: SiClaude,
  },
  gemini: {
    key: "gemini",
    label: "Gemini",
    color: "#8E75B2",
    Icon: SiGooglegemini,
  },
  google: {
    key: "google",
    label: "Google",
    color: "#4285F4",
    Icon: SiGooglegemini,
  },
  deepseek: {
    key: "deepseek",
    label: "DeepSeek",
    color: "#4D6BFE",
    Icon: SiDeepseek,
  },
  mistral: {
    key: "mistral",
    label: "Mistral",
    color: "#F7D046",
    Icon: SiMistralai,
  },
  meta: {
    key: "meta",
    label: "Meta",
    color: "#0082FB",
    Icon: SiMeta,
  },
  ollama: {
    key: "ollama",
    label: "Ollama",
    color: "#000000",
    Icon: SiOllama,
  },
  huggingface: {
    key: "huggingface",
    label: "Hugging Face",
    color: "#FFD21E",
    Icon: SiHuggingface,
  },
  perplexity: {
    key: "perplexity",
    label: "Perplexity",
    color: "#1FB8CD",
    Icon: SiPerplexity,
  },
  xai: {
    key: "xai",
    label: "xAI",
    color: "#000000",
    Icon: SiX,
  },
  pinterest: {
    key: "pinterest",
    label: "Pinterest",
    color: "#E60023",
    Icon: SiPinterest,
  },
  googledrive: {
    key: "googledrive",
    label: "Google Drive",
    color: "#4285F4",
    Icon: SiGoogledrive,
  },
  unknown: {
    key: "unknown",
    label: "Model",
    color: "#2F5BFF",
  },
};

export function resolveBrandFromModelId(modelId: string): BrandMeta {
  const id = modelId.toLowerCase();
  if (id.includes("claude") || id.includes("anthropic")) return BRANDS.claude;
  if (id.includes("gemini") || id.includes("google")) return BRANDS.gemini;
  if (id.includes("gpt") || id.includes("openai") || /\bo[1-4]\b/.test(id)) return BRANDS.openai;
  if (id.includes("deepseek")) return BRANDS.deepseek;
  if (id.includes("mistral") || id.includes("mixtral")) return BRANDS.mistral;
  if (id.includes("llama") || id.includes("meta")) return BRANDS.meta;
  if (id.includes("ollama")) return BRANDS.ollama;
  if (id.includes("hugging") || id.includes("hf")) return BRANDS.huggingface;
  if (id.includes("perplexity") || id.includes("sonar")) return BRANDS.perplexity;
  if (id.includes("grok") || id.includes("xai")) return BRANDS.xai;
  return BRANDS.unknown;
}

export function getBrand(key: BrandKey): BrandMeta {
  return BRANDS[key];
}

export function BrandIcon({
  brand,
  modelId,
  className,
}: {
  brand?: BrandKey;
  modelId?: string;
  className?: string;
}) {
  const meta = brand
    ? BRANDS[brand]
    : modelId
      ? resolveBrandFromModelId(modelId)
      : BRANDS.unknown;
  const box = cn("size-5 shrink-0", className);

  if (meta.Icon) {
    const Icon = meta.Icon;
    return <Icon className={box} style={{ color: meta.color }} aria-hidden />;
  }

  if (meta.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={meta.src}
        alt=""
        width={20}
        height={20}
        className={box}
        draggable={false}
      />
    );
  }

  return (
    <span
      className={cn(box, "inline-flex items-center justify-center rounded-md text-[10px] font-bold text-white")}
      style={{ backgroundColor: meta.color }}
      aria-hidden
    >
      AI
    </span>
  );
}

export function AiModelIcon({
  modelId,
  className,
}: {
  modelId: string;
  className?: string;
}) {
  return <BrandIcon modelId={modelId} className={className} />;
}
