"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

import { listAiModels } from "@/actions/ai";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AiModelInfo } from "@/lib/ai/types";
import type { StudioPromptSubmit } from "@/lib/studio/generation/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const MODEL_KEY = "studio_ai_model";

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

  const [value, setValue] = useState(initialTopic);
  const [models, setModels] = useState<AiModelInfo[]>([]);
  const [modelId, setModelId] = useState("");

  useEffect(() => {
    if (appliedTopic.current || !initialTopic) return;
    appliedTopic.current = true;
    setValue(initialTopic);
  }, [initialTopic]);

  useEffect(() => {
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

  const selected = models.find((m) => m.modelId === modelId) ?? models[0];
  const trimmed = value.trim();
  const canSend = trimmed.length >= 2 && !disabled && !busy;

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
    void onSubmit({ topic: trimmed, modelId: selected?.modelId });
  };

  return (
    <div className="w-full">
      <div className="rounded-[1.75rem] bg-muted/20 p-2 transition-colors focus-within:bg-muted/30">
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
            "field-sizing-content min-h-[88px] w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[15px] leading-relaxed text-foreground outline-none",
            "placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />

        <div className="flex items-center justify-between gap-3 px-2 pb-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {models.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled || busy}
                    className="inline-flex h-9 max-w-[200px] items-center rounded-full border-none bg-muted/40 px-3.5 text-[13px] font-medium text-foreground shadow-none transition-colors hover:bg-muted/60 data-[state=open]:bg-muted/60 disabled:opacity-60"
                  >
                    <span className="truncate">
                      {selected?.displayName ?? "Model"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={10}
                  className="w-[280px] rounded-2xl p-1.5"
                >
                  <DropdownMenuLabel className="px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                    Model
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1.5 bg-border/50" />
                  {models.map((model) => (
                    <DropdownMenuItem
                      key={model.modelId}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[13px] focus:bg-muted/50",
                        model.modelId === selected?.modelId && "bg-muted/50",
                      )}
                      onSelect={() => pickModel(model.modelId)}
                    >
                      <span className="truncate">{model.displayName}</span>
                      {model.isFree ? (
                        <span className="ml-auto shrink-0 text-[12px] text-muted-foreground">
                          Free
                        </span>
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            <p className="hidden truncate text-[12px] text-muted-foreground md:block">
              {busy ? tc("generating") : t("activationHint")}
            </p>
          </div>

          <button
            type="button"
            disabled={!canSend}
            onClick={submit}
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
              canSend
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-muted text-muted-foreground",
            )}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-3 px-2 text-[13px] text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
