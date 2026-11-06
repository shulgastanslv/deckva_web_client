"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  ChevronDown,
  Clock,
  LayoutTemplate,
  Loader2,
  Palette,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type GenerationType = "idea" | "palette" | "carousel";

export type StudioPromptSubmit = {
  topic: string;
  type: GenerationType;
};

const RECENT_KEY = "studio_recent_prompts";
const MAX_RECENTS = 5;

const GENERATION_TYPES = [
  { value: "idea", label: "Идея", icon: Sparkles, placeholder: "Опишите тему для генерации идей..." },
  { value: "palette", label: "Палитра", icon: Palette, placeholder: "Опишите настроение или бренд для генерации палитры..." },
  { value: "carousel", label: "Дизайн каруселей", icon: LayoutTemplate, placeholder: "Опишите контент и стиль для дизайна карусели..." },
] as const;

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
  const appliedTopic = useRef(false);

  const [value, setValue] = useState(initialTopic);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [generationType, setGenerationType] = useState<GenerationType>("idea");

  useEffect(() => {
    if (appliedTopic.current || !initialTopic) return;
    appliedTopic.current = true;
    setValue(initialTopic);
  }, [initialTopic]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        setRecentPrompts(JSON.parse(stored));
      }
    } catch {
      // Игнорируем ошибки парсинга
    }
  }, []);

  const saveRecent = (promptText: string) => {
    try {
      const filtered = recentPrompts.filter((item) => item !== promptText);
      const updated = [promptText, ...filtered].slice(0, MAX_RECENTS);
      setRecentPrompts(updated);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {
      // Игнорируем ошибки записи
    }
  };

  const clearRecents = () => {
    setRecentPrompts([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      // Игнорируем ошибки
    }
  };

  const trimmed = value.trim();
  const canSend = trimmed.length >= 2 && !disabled && !busy;

  const submit = (topic = trimmed) => {
    const finalTopic = topic.trim();
    if (finalTopic.length < 2 || disabled || busy) return;

    saveRecent(finalTopic);
    void onSubmit({ topic: finalTopic, type: generationType });
  };

  const currentTypeData = GENERATION_TYPES.find((t) => t.value === generationType) || GENERATION_TYPES[0];

  return (
    <div className="w-full">
      <div
        className={cn(
          "rounded-[1.75rem] bg-muted/20 p-2 transition-colors",
          "focus-within:bg-muted/30",
        )}
      >
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
          placeholder={currentTypeData.placeholder}
          className={cn(
            "field-sizing-content min-h-[88px] w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[15px] leading-relaxed text-foreground outline-none",
            "placeholder:text-muted-foreground/70",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />

        <div className="flex items-center justify-between gap-3 px-2 pb-1">
          <div className="flex min-w-0 items-center gap-2">
            {/* Меню выбора типа генерации */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={disabled || busy}
                  className="inline-flex h-8 items-center gap-2 rounded-full bg-foreground px-3.5 text-[13px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <span className="hidden sm:inline-block">{currentTypeData.label}</span>
                  <ChevronDown className="size-3.5 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={10}
                className="w-full rounded-2xl border-neutral-200/80 bg-white p-2 border-none dark:bg-neutral-900"
                >
                {GENERATION_TYPES.map((type) => (
                  <DropdownMenuItem
                    key={type.value}
                    onSelect={() => setGenerationType(type.value)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-muted focus:bg-muted"
                  >
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Меню истории запросов */}
            {recentPrompts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled || busy}
                    title="История запросов"
                    className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Clock className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={10}
                  className="w-[280px] rounded-2xl border border-border/50 bg-background p-2 shadow-lg"
                >
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <DropdownMenuLabel className="p-0 text-[12px] font-medium text-muted-foreground">
                      Недавние запросы
                    </DropdownMenuLabel>
                    <button
                      type="button"
                      onClick={clearRecents}
                      className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                      Очистить
                    </button>
                  </div>
                  <DropdownMenuSeparator className="my-1.5 bg-border/50" />
                  {recentPrompts.map((recentItem, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      className="flex cursor-pointer items-center rounded-xl px-3 py-2.5 text-[14px] text-foreground transition-colors hover:bg-muted focus:bg-muted"
                      onSelect={() => setValue(recentItem)}
                    >
                      <span className="truncate">{recentItem}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <p className="hidden md:block truncate pl-2 text-[12px] text-muted-foreground">
              {busy ? "Генерация…" : "Enter для отправки · Shift+Enter для новой строки"}
            </p>
          </div>

          <button
            type="button"
            disabled={!canSend}
            onClick={() => submit()}
            title="Отправить"
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

      {error && <p className="mt-3 px-2 text-[13px] text-destructive">{error}</p>}
    </div>
  );
}