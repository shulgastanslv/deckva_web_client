"use client";

import { useRef, useState } from "react";
import {
  ArrowUp,
  ImagePlus,
  Link2,
  Loader2,
  Monitor,
  X,
} from "lucide-react";

import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "How a fitness coach should post on Instagram",
  "5 Next.js features every founder should know",
  "Как заработать первые $1000 на фрилансе",
] as const;

export type StudioPromptSubmit = {
  topic: string;
  cover: string;
};

type CoverAttachment = {
  value: string;
  label: string;
  kind: "file" | "link";
};

function normalizeCoverUrl(raw: string): string | null {
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
}: {
  onSubmit: (input: StudioPromptSubmit) => void | Promise<void>;
  disabled?: boolean;
  busy?: boolean;
  error?: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [cover, setCover] = useState<CoverAttachment | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const [coverError, setCoverError] = useState<string | null>(null);
  const [readingFile, setReadingFile] = useState(false);

  const trimmed = value.trim();
  const canSend = trimmed.length >= 2 && !disabled && !busy && !readingFile;

  const clearCover = () => {
    setCover(null);
    setLinkDraft("");
    setCoverError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyLink = () => {
    const next = normalizeCoverUrl(linkDraft);
    if (next === null) {
      setCoverError("Use an http(s) image URL");
      return;
    }
    if (!next) {
      clearCover();
      setLinkOpen(false);
      return;
    }
    setCover({ value: next, label: next, kind: "link" });
    setCoverError(null);
    setLinkOpen(false);
  };

  const pickFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setCoverError(messages.errors.chooseImage);
      return;
    }
    setReadingFile(true);
    setCoverError(null);
    try {
      const dataUrl = await fileToDataUrl(file, { maxEdge: 1080, quality: 0.82 });
      setCover({
        value: dataUrl,
        label: file.name || "Cover image",
        kind: "file",
      });
      setLinkOpen(false);
      setLinkDraft("");
    } catch (err) {
      reportError(err, messages.errors.readImage);
      setCoverError(messages.errors.readImage);
    } finally {
      setReadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submit = (topic = trimmed) => {
    if (topic.trim().length < 2 || disabled || busy || readingFile) return;
    void onSubmit({ topic: topic.trim(), cover: cover?.value ?? "" });
  };

  return (
    <div>
      <div
        className={cn(
          "rounded-3xl bg-muted/40 p-2 transition-colors",
          "focus-within:bg-muted/55",
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
          placeholder="Describe a carousel — topic, tone, audience…"
          className={cn(
            "field-sizing-content min-h-[72px] w-full resize-none bg-transparent px-4 pt-3 pb-2 text-[15px] leading-relaxed text-foreground outline-none",
            "placeholder:text-muted-foreground/80",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />

        {linkOpen ? (
          <div className="mx-2 mb-2 flex flex-col gap-1.5 rounded-2xl bg-background/70 px-3 py-2">
            <div className="flex items-center gap-2">
              <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
              <input
                value={linkDraft}
                onChange={(e) => {
                  setLinkDraft(e.target.value);
                  setCoverError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setLinkOpen(false);
                    setCoverError(null);
                  }
                }}
                disabled={disabled || busy}
                placeholder="Paste cover image URL…"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <button
                type="button"
                onClick={applyLink}
                disabled={disabled || busy}
                className="rounded-full px-2.5 py-1 text-[12px] font-medium text-foreground hover:bg-muted"
              >
                Attach
              </button>
              <button
                type="button"
                onClick={() => {
                  setLinkOpen(false);
                  setCoverError(null);
                }}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Close"
              >
                <X className="size-3.5" />
              </button>
            </div>
            {coverError ? (
              <p className="pl-5 text-[12px] text-destructive">{coverError}</p>
            ) : (
              <p className="pl-5 text-[11px] text-muted-foreground">
                Used on the first slide.
              </p>
            )}
          </div>
        ) : null}

        {cover && !linkOpen ? (
          <div className="mx-2 mb-2 flex items-center gap-2 rounded-full bg-background/70 px-3 py-1.5">
            {cover.kind === "link" ? (
              <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ImagePlus className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            <span
              className="min-w-0 flex-1 truncate text-[12px] text-foreground"
              title={cover.label}
            >
              {cover.label}
            </span>
            <button
              type="button"
              onClick={clearCover}
              disabled={disabled || busy}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Remove cover"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : null}

        {!linkOpen && coverError ? (
          <p className="mx-4 mb-2 text-[12px] text-destructive">{coverError}</p>
        ) : null}

        <div className="flex items-center justify-between gap-3 px-2 pb-1">
          <div className="flex min-w-0 items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                void pickFile(e.target.files);
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={disabled || busy || readingFile}
                  title="Attach cover"
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    (cover || linkOpen || readingFile) &&
                      "bg-muted text-foreground",
                  )}
                >
                  {readingFile ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="size-3.5" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="min-w-[180px] rounded-2xl border-0 bg-muted p-1.5 shadow-none dark:bg-muted"
              >
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-xl px-2.5 py-2 text-[13px]"
                  onSelect={() => {
                    setLinkOpen(false);
                    setCoverError(null);
                    fileInputRef.current?.click();
                  }}
                >
                  <Monitor className="size-3.5" />
                  From computer
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-xl px-2.5 py-2 text-[13px]"
                  onSelect={() => {
                    setLinkDraft(cover?.kind === "link" ? cover.value : "");
                    setLinkOpen(true);
                    setCoverError(null);
                  }}
                >
                  <Link2 className="size-3.5" />
                  From link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="truncate text-[12px] text-muted-foreground">
              {busy
                ? "Opening editor…"
                : readingFile
                  ? "Reading image…"
                  : "Enter to generate · Shift+Enter for a new line"}
            </p>
          </div>
          <button
            type="button"
            disabled={!canSend}
            onClick={() => submit()}
            title="Generate carousel"
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
        <p className="mt-3 text-[13px] text-destructive">{error}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <PromptSuggestion
            key={suggestion}
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || busy || readingFile}
            className="h-8 rounded-full px-3 text-[12px] font-medium"
            onClick={() => {
              setValue(suggestion);
              submit(suggestion);
            }}
          >
            {suggestion}
          </PromptSuggestion>
        ))}
      </div>
    </div>
  );
}
