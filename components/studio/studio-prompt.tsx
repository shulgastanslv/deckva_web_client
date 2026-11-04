"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Clock,
  FileIcon,
  FolderUp,
  Globe,
  ImageIcon,
  Link2,
  Loader2,
  Paperclip,
  Trash2,
  X,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { cn } from "@/lib/utils";

export type StudioAttachment = {
  id: string;
  value: string; // URL или DataURL
  label: string;
  kind: "file" | "link";
  mimeType?: string;
};

export type StudioPromptSubmit = {
  topic: string;
  attachments: StudioAttachment[];
};

const RECENT_KEY = "studio_recent_prompts";
const MAX_RECENTS = 5;

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (!/^https?:$/i.test(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appliedTopic = useRef(false);

  const [value, setValue] = useState(initialTopic);
  const [attachments, setAttachments] = useState<StudioAttachment[]>([]);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);

  // Состояние диалога добавления ссылки
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");

  const [promptError, setPromptError] = useState<string | null>(null);
  const [readingFile, setReadingFile] = useState(false);

  // Синхронизация initialTopic
  useEffect(() => {
    if (appliedTopic.current || !initialTopic) return;
    appliedTopic.current = true;
    setValue(initialTopic);
  }, [initialTopic]);

  // Загрузка недавних запросов
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
  const canSend = trimmed.length >= 2 && !disabled && !busy && !readingFile;

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const applyLink = () => {
    const next = normalizeUrl(linkDraft);
    if (next === null) {
      setPromptError("Укажите корректный URL (http:// или https://)");
      return;
    }
    if (!next) {
      setLinkOpen(false);
      return;
    }

    setAttachments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        value: next,
        label: next,
        kind: "link",
      },
    ]);

    setLinkDraft("");
    setLinkOpen(false);
    setPromptError(null);
  };

  const pickFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setReadingFile(true);
    setPromptError(null);

    try {
      const newAttachments: StudioAttachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let fileData = "";

        if (file.type.startsWith("image/")) {
          fileData = await fileToDataUrl(file, { maxEdge: 1080, quality: 0.82 });
        } else {
          fileData = URL.createObjectURL(file);
        }

        newAttachments.push({
          id: crypto.randomUUID(),
          value: fileData,
          label: file.name,
          kind: "file",
          mimeType: file.type,
        });
      }

      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (err) {
      reportError(err, messages.errors.readImage);
      setPromptError("Ошибка при чтении файла");
    } finally {
      setReadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submit = (topic = trimmed) => {
    const finalTopic = topic.trim();
    if (finalTopic.length < 2 || disabled || busy || readingFile) return;

    saveRecent(finalTopic);
    void onSubmit({ topic: finalTopic, attachments });
  };

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
          placeholder="Опишите задачу — тему, детали, аудиторию…"
          className={cn(
            "field-sizing-content min-h-[88px] w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[15px] leading-relaxed text-foreground outline-none",
            "placeholder:text-muted-foreground/70",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />

        {/* Форма ввода ссылки */}
        {linkOpen && (
          <div className="mx-2 mb-2 flex items-center gap-2 rounded-2xl bg-background/80 px-3 py-2">
            <Globe className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={linkDraft}
              onChange={(e) => {
                setLinkDraft(e.target.value);
                setPromptError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setLinkOpen(false);
                  setPromptError(null);
                }
              }}
              disabled={disabled || busy}
              placeholder="Вставьте ссылку (https://…)"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <button
              type="button"
              onClick={applyLink}
              disabled={disabled || busy}
              className="rounded-full px-2.5 py-1 text-[12px] font-medium text-foreground hover:bg-muted"
            >
              Добавить
            </button>
            <button
              type="button"
              onClick={() => {
                setLinkOpen(false);
                setPromptError(null);
              }}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Список прикрепленных вложений */}
        {attachments.length > 0 && (
          <div className="mx-2 mb-2 flex flex-wrap gap-1.5">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-[12px] text-foreground shadow-sm"
              >
                {att.kind === "link" ? (
                  <Link2 className="size-3 shrink-0 text-muted-foreground" />
                ) : att.mimeType?.startsWith("image/") ? (
                  <ImageIcon className="size-3 shrink-0 text-muted-foreground" />
                ) : (
                  <FileIcon className="size-3 shrink-0 text-muted-foreground" />
                )}
                <span className="max-w-[150px] truncate" title={att.label}>
                  {att.label}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  disabled={disabled || busy}
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {promptError && (
          <p className="mx-4 mb-2 text-[12px] text-destructive">{promptError}</p>
        )}

        {/* Панель действий */}
        <div className="flex items-center justify-between gap-3 px-2 pb-1">
          <div className="flex min-w-0 items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                void pickFiles(e.target.files);
              }}
            />

            {/* Меню прикрепления (Файлы / Ссылка) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={disabled || busy || readingFile}
                  title="Прикрепить"
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    (attachments.length > 0 || linkOpen || readingFile) &&
                      "bg-muted text-foreground",
                  )}
                >
                  {readingFile ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Paperclip className="size-4" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="min-w-[170px] rounded-2xl border-0 bg-muted p-1.5 shadow-none"
              >
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-xl px-2.5 py-2 text-[13px]"
                  onSelect={() => {
                    fileInputRef.current?.click();
                  }}
                >
                  <FolderUp className="size-3.5" />
                  Загрузить файлы
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-xl px-2.5 py-2 text-[13px]"
                  onSelect={() => {
                    setLinkOpen(true);
                  }}
                >
                  <Link2 className="size-3.5" />
                  Добавить ссылку
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Меню Recent запросов */}
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
                  sideOffset={8}
                  className="w-[280px] rounded-2xl border-0 bg-muted p-1.5 shadow-none"
                >
                  <div className="flex items-center justify-between px-2 py-1">
                    <DropdownMenuLabel className="p-0 text-[11px] font-normal text-muted-foreground">
                      Недавние запросы
                    </DropdownMenuLabel>
                    <button
                      type="button"
                      onClick={clearRecents}
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                      Очистить
                    </button>
                  </div>
                  <DropdownMenuSeparator className="my-1 bg-border/40" />
                  {recentPrompts.map((recentItem, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      className="cursor-pointer truncate rounded-xl px-2.5 py-1.5 text-[13px]"
                      onSelect={() => setValue(recentItem)}
                    >
                      <span className="truncate">{recentItem}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <p className="truncate pl-1 text-[12px] text-muted-foreground">
              {busy
                ? "Генерация…"
                : readingFile
                  ? "Чтение файлов…"
                  : "Enter для отправки · Shift+Enter для новой строки"}
            </p>
          </div>

          {/* Кнопка отправки */}
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

      {error && <p className="mt-3 text-[13px] text-destructive">{error}</p>}
    </div>
  );
}