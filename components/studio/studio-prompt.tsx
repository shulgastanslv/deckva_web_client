"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Clock as Clock3,
  Layout as LayoutTemplate,
  SpinnerGap as Loader2,
  Paperclip,
  Plus,
  Scroll as ScrollText,
  MagnifyingGlass as Search,
  Shapes,
} from "@phosphor-icons/react";

import { listAiModels } from "@/actions/ai";
import {
  AiModelIcon,
  BrandIcon,
  resolveBrandFromModelId,
  type BrandKey,
} from "@/components/studio/brand-icon";
import { menuIconClass } from "@/components/canvas/sidebar/sidebar-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AiModelInfo } from "@/lib/ai/types";
import type { StudioPromptSubmit } from "@/lib/studio/generation/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const MODEL_KEY = "studio_ai_model";
const HISTORY_KEY = "studio_prompt_recents";
const MAX_HISTORY = 6;

type ModelFilter = "all" | "free" | BrandKey;

const CONNECTORS = [
  { id: "pinterest" as const, label: "Pinterest", brand: "pinterest" as const },
  { id: "google-drive" as const, label: "Google Drive", brand: "googledrive" as const },
];

const PROVIDER_FILTERS: { id: ModelFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "openai", label: "OpenAI" },
  { id: "claude", label: "Claude" },
  { id: "gemini", label: "Gemini" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "mistral", label: "Mistral" },
];

function loadHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

function pushHistory(topic: string): string[] {
  const next = [topic, ...loadHistory().filter((item) => item !== topic)].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function StudioPrompt({
  onSubmit,
  disabled,
  busy,
  error,
  initialTopic = "",
}: {
  onSubmit: (input: StudioPromptSubmit) => void | Promise<void>;
  disabled?: boolean;
  busy?: boolean;
  error?: string | null;
  initialTopic?: string;
}) {
  const t = useTranslations("studio");
  const tc = useTranslations("common");
  const appliedTopic = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelSearchRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState(initialTopic);
  const [models, setModels] = useState<AiModelInfo[]>([]);
  const [modelId, setModelId] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [modelQuery, setModelQuery] = useState("");
  const [modelFilter, setModelFilter] = useState<ModelFilter>("all");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);

  useEffect(() => {
    if (appliedTopic.current || !initialTopic) return;
    appliedTopic.current = true;
    setValue(initialTopic);
  }, [initialTopic]);

  useEffect(() => {
    setHistory(loadHistory());
    try {
      const stored = localStorage.getItem(MODEL_KEY);
      if (stored) setModelId(stored);
    } catch {
      // ignore
    }

    let cancelled = false;
    void (async () => {
      try {
        const catalog = await listAiModels();
        if (cancelled) return;
        setModels(catalog.models);
        setModelId((prev) => {
          if (prev && catalog.models.some((m) => m.modelId === prev)) return prev;
          return catalog.models[0]?.modelId ?? "";
        });
      } catch {
        // AI server may be offline — generation will surface the error
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!modelMenuOpen) return;
    const id = window.setTimeout(() => modelSearchRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [modelMenuOpen]);

  const selected = models.find((m) => m.modelId === modelId) ?? models[0];
  const trimmed = value.trim();
  const canSend = trimmed.length >= 2 && !disabled && !busy;

  const availableFilters = useMemo(() => {
    const present = new Set(models.map((m) => resolveBrandFromModelId(m.modelId).key));
    return PROVIDER_FILTERS.filter((item) => {
      if (item.id === "all" || item.id === "free") return true;
      return present.has(item.id);
    });
  }, [models]);

  const filteredModels = useMemo(() => {
    const q = modelQuery.trim().toLowerCase();
    return models.filter((model) => {
      if (modelFilter === "free" && !model.isFree) return false;
      if (modelFilter !== "all" && modelFilter !== "free") {
        if (resolveBrandFromModelId(model.modelId).key !== modelFilter) return false;
      }
      if (!q) return true;
      return (
        model.displayName.toLowerCase().includes(q) ||
        model.modelId.toLowerCase().includes(q)
      );
    });
  }, [models, modelQuery, modelFilter]);

  const pickModel = (id: string) => {
    setModelId(id);
    try {
      localStorage.setItem(MODEL_KEY, id);
    } catch {
      // ignore
    }
  };

  const submit = () => {
    if (!canSend) return;
    setHistory(pushHistory(trimmed));
    void onSubmit({ topic: trimmed, modelId: selected?.modelId });
  };

  return (
    <div className="w-full space-y-3">
      <div className="rounded-2xl bg-muted/25 p-2 transition-colors focus-within:bg-muted/35 dark:bg-muted/20 dark:focus-within:bg-muted/30">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          disabled={disabled || busy}
          placeholder={t("placeholderCarousel")}
          className={cn(
            "field-sizing-content min-h-[88px] max-h-[160px] w-full resize-none overflow-y-auto bg-transparent px-3.5 pt-3 pb-2 text-[15px] leading-relaxed text-foreground outline-none",
            "placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />

        <div className="flex items-center justify-between gap-2 px-1.5 pb-1">
          <div className="flex min-w-0 items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept="image/*,.pdf,.txt,.md"
              onChange={() => {
                /* placeholder — wiring later */
              }}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={disabled || busy}
                  aria-label={t("prompt.add")}
                  className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted/60 disabled:opacity-50"
                >
                  <Plus className={menuIconClass} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8} className="w-56 rounded-2xl p-1.5">
                <DropdownMenuItem
                  className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] focus:bg-muted/50"
                  onSelect={() => fileInputRef.current?.click()}
                >
                  <Paperclip className={menuIconClass} />
                  {t("prompt.addFiles")}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-border/50" />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] focus:bg-muted/50 data-[state=open]:bg-muted/50">
                    <ScrollText className={menuIconClass} />
                    <span className="flex-1 text-left">{t("prompt.skills")}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent sideOffset={8} className="w-56 rounded-2xl p-1.5">
                    <DropdownMenuItem disabled className="rounded-xl px-2.5 py-2 text-[13px] text-muted-foreground">
                      {t("prompt.comingSoon")}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] focus:bg-muted/50 data-[state=open]:bg-muted/50">
                    <LayoutTemplate className={menuIconClass} />
                    <span className="flex-1 text-left">{t("prompt.connectors")}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent sideOffset={8} className="w-64 rounded-2xl p-2">
                    {CONNECTORS.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 rounded-xl px-2 py-2"
                      >
                        <BrandIcon brand={item.brand} />
                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                          {item.label}
                        </span>
                        <button
                          type="button"
                          className="h-7 shrink-0 rounded-md border border-border/60 bg-transparent px-2.5 text-[12px] font-medium text-foreground hover:bg-muted/40"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                        >
                          {t("prompt.connect")}
                        </button>
                      </div>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem
                  disabled
                  className="cursor-default gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] text-muted-foreground"
                >
                  <Shapes className={menuIconClass} />
                  {t("prompt.addAssets")}
                  <span className="ml-auto text-[11px]">{t("prompt.soon")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {models.length > 0 ? (
              <DropdownMenu
                open={modelMenuOpen}
                onOpenChange={(open) => {
                  setModelMenuOpen(open);
                  if (!open) {
                    setModelQuery("");
                    setModelFilter("all");
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled || busy}
                    className="inline-flex h-9 max-w-[220px] items-center gap-2 rounded-md px-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60 data-[state=open]:bg-muted/60 disabled:opacity-60"
                  >
                    {selected ? <AiModelIcon modelId={selected.modelId} /> : null}
                    <span className="truncate">{selected?.displayName ?? t("prompt.model")}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={10}
                  className="w-[320px] rounded-2xl p-1.5"
                  onCloseAutoFocus={(event) => event.preventDefault()}
                >
                  <div
                    className="space-y-2 px-1.5 pb-1.5 pt-1"
                    onPointerDown={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        ref={modelSearchRef}
                        value={modelQuery}
                        onChange={(event) => setModelQuery(event.target.value)}
                        placeholder={t("prompt.searchModels")}
                        className="h-9 w-full rounded-md bg-muted/40 pr-3 pl-8 text-[13px] outline-none placeholder:text-muted-foreground focus:bg-muted/60"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {availableFilters.map((item) => {
                        const active = modelFilter === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setModelFilter(item.id)}
                            className={cn(
                              "inline-flex h-7 items-center rounded-md px-2 text-[12px] font-medium transition-colors",
                              active
                                ? "bg-foreground text-background"
                                : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                            )}
                          >
                            {item.id !== "all" && item.id !== "free" ? (
                              <span className="mr-1.5 inline-flex">
                                <BrandIcon brand={item.id} className="size-3.5" />
                              </span>
                            ) : null}
                            {item.id === "all"
                              ? tc("all")
                              : item.id === "free"
                                ? t("prompt.free")
                                : item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <DropdownMenuSeparator className="my-1.5 bg-border/50" />

                  <div className="max-h-64 overflow-y-auto overscroll-contain">
                    {filteredModels.length === 0 ? (
                      <p className="px-3 py-6 text-center text-[12px] text-muted-foreground">
                        {t("prompt.noModelsMatch")}
                      </p>
                    ) : (
                      filteredModels.map((model) => (
                        <DropdownMenuItem
                          key={model.modelId}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] focus:bg-muted/50",
                            model.modelId === selected?.modelId && "bg-muted/50",
                          )}
                          onSelect={() => pickModel(model.modelId)}
                        >
                          <AiModelIcon modelId={model.modelId} />
                          <span className="min-w-0 flex-1 truncate">{model.displayName}</span>
                          {model.isFree ? (
                            <span className="shrink-0 text-[12px] text-muted-foreground">{t("prompt.free")}</span>
                          ) : null}
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            {history.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled || busy}
                    aria-label={t("prompt.recentPrompts")}
                    className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
                  >
                    <Clock3 className={menuIconClass} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={8} className="w-72 rounded-2xl p-1.5">
                  <DropdownMenuLabel className="px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                    {t("prompt.recentHistory")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-border/50" />
                  {history.map((item) => (
                    <DropdownMenuItem
                      key={item}
                      className="cursor-pointer rounded-xl px-3 py-2.5 text-[13px] focus:bg-muted/50"
                      onSelect={() => setValue(item)}
                    >
                      <span className="line-clamp-2">{item}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canSend}
              onClick={submit}
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors rounded-full",
                canSend
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {busy ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ArrowUp className="size-5 stroke-[1.5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 px-0.5">
          {history.slice(0, 4).map((item) => (
            <button
              key={item}
              type="button"
              disabled={disabled || busy}
              onClick={() => setValue(item)}
              className="max-w-[220px] truncate rounded-md bg-muted/40 px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
              title={item}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="px-1 text-[13px] text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
