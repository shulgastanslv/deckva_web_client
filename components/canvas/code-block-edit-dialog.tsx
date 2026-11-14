"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "fabric";
import { useTranslations } from "next-intl";
import {
  ArrowFatLinesLeft as IndentDecrease,
  ArrowFatLinesRight as IndentIncrease,
  Check,
  ClipboardText as ClipboardPaste,
  Copy,
  Eraser,
  TextAa as Wrap,
  ArrowCounterClockwise as RotateCcw,
} from "@phosphor-icons/react";

import { useCanvasManager } from "@/context/canvas-manager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CODE_LANGS,
  DEFAULT_CODE,
  isCodeBlock,
  readCodeOptions,
  type CodeBlockOptions,
  type CodeLang,
} from "@/lib/canvas/code-block";
import { cn } from "@/lib/utils";

const INDENT = "  ";

function replaceSelection(
  value: string,
  start: number,
  end: number,
  next: string,
) {
  return {
    value: value.slice(0, start) + next + value.slice(end),
    cursor: start + next.length,
  };
}

function indentBlock(code: string, start: number, end: number, out = false) {
  const lineStart = code.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const rawEnd = end;
  const block = code.slice(lineStart, rawEnd);
  const lines = block.split("\n");
  const nextLines = lines.map((line) => {
    if (!out) return INDENT + line;
    if (line.startsWith("\t")) return line.slice(1);
    if (line.startsWith(INDENT)) return line.slice(INDENT.length);
    if (line.startsWith(" ")) return line.replace(/^ +/, (m) => m.slice(Math.min(2, m.length)));
    return line;
  });
  const nextBlock = nextLines.join("\n");
  const value = code.slice(0, lineStart) + nextBlock + code.slice(rawEnd);
  return {
    value,
    start: lineStart,
    end: lineStart + nextBlock.length,
  };
}

function formatCode(code: string) {
  return code
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .replace(/\n*$/, "\n");
}

function commentPrefix(lang: CodeLang) {
  if (lang === "python" || lang === "shell" || lang === "yaml" || lang === "toml" || lang === "dockerfile") {
    return "# ";
  }
  if (lang === "html" || lang === "markdown" || lang === "vue" || lang === "svelte") {
    return "<!-- ";
  }
  if (lang === "sql") return "-- ";
  return "// ";
}

function toggleComments(code: string, start: number, end: number, lang: CodeLang) {
  const prefix = commentPrefix(lang);
  const lineStart = code.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const block = code.slice(lineStart, end);
  const lines = block.split("\n");
  const allCommented = lines.every(
    (line) => !line.trim() || line.trimStart().startsWith(prefix.trim()),
  );
  const nextLines = lines.map((line) => {
    if (!line.trim()) return line;
    const leading = line.match(/^\s*/)?.[0] ?? "";
    const body = line.slice(leading.length);
    if (allCommented) {
      if (body.startsWith(prefix)) return leading + body.slice(prefix.length);
      if (body.startsWith(prefix.trim())) {
        return leading + body.slice(prefix.trim().length);
      }
      return line;
    }
    return leading + prefix + body;
  });
  const nextBlock = nextLines.join("\n");
  return {
    value: code.slice(0, lineStart) + nextBlock + code.slice(end),
    start: lineStart,
    end: lineStart + nextBlock.length,
  };
}

export function CodeBlockEditDialog() {
  const manager = useCanvasManager();
  const t = useTranslations("editor.code");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [code, setCode] = useState("");
  const [options, setOptions] = useState<CodeBlockOptions | null>(null);
  const [wrap, setWrap] = useState(true);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!manager) return;
    return manager.on("editCode", (target) => {
      if (!isCodeBlock(target)) return;
      const next = readCodeOptions(target);
      setGroup(target);
      setOptions(next);
      setCode(next.code);
      setOpen(true);
      setCopied(false);
    });
  }, [manager]);

  const stats = useMemo(() => {
    const lines = code.length === 0 ? 0 : code.split("\n").length;
    return { lines, chars: code.length };
  }, [code]);

  const close = () => {
    setOpen(false);
    setGroup(null);
    setOptions(null);
    setCopied(false);
  };

  const save = () => {
    if (!manager || !group || !options) return;
    manager.objects.updateCodeBlock(group, { ...options, code });
    manager.commit();
    close();
  };

  const patchOptions = (partial: Partial<CodeBlockOptions>) => {
    setOptions((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const applyEdit = (
    next: { value: string; start?: number; end?: number; cursor?: number },
  ) => {
    setCode(next.value);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      if (typeof next.cursor === "number") {
        el.setSelectionRange(next.cursor, next.cursor);
      } else if (typeof next.start === "number" && typeof next.end === "number") {
        el.setSelectionRange(next.start, next.end);
      }
    });
  };

  const withSelection = (
    fn: (value: string, start: number, end: number) => {
      value: string;
      start?: number;
      end?: number;
      cursor?: number;
    },
  ) => {
    const el = textareaRef.current;
    if (!el) return;
    applyEdit(fn(code, el.selectionStart, el.selectionEnd));
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };

  const pasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      withSelection((value, start, end) =>
        replaceSelection(value, start, end, text),
      );
    } catch {
      /* ignore — browser may block clipboard read */
    }
  };

  const toolBtn =
    "size-9 shrink-0 rounded-md border-none bg-muted/40 text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent className="flex max-h-[min(48rem,92dvh)] w-[min(52rem,calc(100vw-1.5rem))] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-4xl">
        <DialogHeader className="gap-1 border-b border-border/40 px-5 pt-5 pb-3">
          <DialogTitle>{t("editCode")}</DialogTitle>
          <DialogDescription>{t("pasteOrEdit")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-1.5 border-b border-border/40 px-4 py-2.5">
          <Input
            value={options?.filename ?? ""}
            onChange={(e) => patchOptions({ filename: e.target.value })}
            placeholder={t("filename")}
            aria-label={t("filename")}
            className="w-[8.5rem] rounded-md border-none bg-muted/40 px-3 text-[13px] shadow-none focus-visible:ring-2 focus-visible:ring-ring/20"
          />

          <Select
            value={options?.lang ?? "go"}
            onValueChange={(value) => patchOptions({ lang: value as CodeLang })}
          >
            <SelectTrigger
              aria-label={t("language")}
 className="w-[9.5rem] rounded-md border-none bg-muted/40 px-3.5 text-[13px] font-normal shadow-none hover:bg-muted/60 focus:ring-0 focus-visible:ring-2 focus-visible:ring-ring/20"
            >
              <SelectValue placeholder={t("language")} />
            </SelectTrigger>
            <SelectContent className="max-h-72 rounded-2xl p-1.5">
              {CODE_LANGS.map((item) => (
                <SelectItem
                  key={item.id}
                  value={item.id}
                  className="text-[13px] focus:bg-muted/50"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mx-0.5 hidden h-5 w-px bg-border/50 sm:block" />

          <Button
            type="button"
            variant="ghost"
            size="icon"
 className={toolBtn}
            title={tc("copy")}
            aria-label={tc("copy")}
            onClick={() => void copyCode()}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
 className={toolBtn}
            title={t("paste")}
            aria-label={t("paste")}
            onClick={() => void pasteCode()}
          >
            <ClipboardPaste className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
 className={toolBtn}
            title={t("indent")}
            aria-label={t("indent")}
            onClick={() =>
              withSelection((value, start, end) => indentBlock(value, start, end, false))
            }
          >
            <IndentIncrease className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
 className={toolBtn}
            title={t("outdent")}
            aria-label={t("outdent")}
            onClick={() =>
              withSelection((value, start, end) => indentBlock(value, start, end, true))
            }
          >
            <IndentDecrease className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
 className={cn(toolBtn, wrap && "bg-muted/60 text-foreground")}
            title={t("wrap")}
            aria-label={t("wrap")}
            aria-pressed={wrap}
            onClick={() => setWrap((v) => !v)}
          >
            <Wrap className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
 className={toolBtn}
            title={t("format")}
            aria-label={t("format")}
            onClick={() => setCode((prev) => formatCode(prev))}
          >
            <Eraser className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
 className={toolBtn}
            title={t("resetStarter")}
            aria-label={t("resetStarter")}
            onClick={() => {
              setCode(DEFAULT_CODE);
              patchOptions({ lang: "go", filename: "main.go" });
            }}
          >
            <RotateCcw className="size-4" />
          </Button>

          <div className="ml-auto hidden text-[11px] tabular-nums text-muted-foreground sm:block">
            {t("stats", { lines: stats.lines, chars: stats.chars })}
          </div>
        </div>

        <div className="min-h-0 flex-1 px-4 py-3">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                save();
                return;
              }
              if ((e.metaKey || e.ctrlKey) && e.key === "/") {
                e.preventDefault();
                const lang = options?.lang ?? "go";
                withSelection((value, start, end) =>
                  toggleComments(value, start, end, lang),
                );
                return;
              }
              if (e.key === "Tab") {
                e.preventDefault();
                withSelection((value, start, end) => {
                  if (start !== end) {
                    return indentBlock(value, start, end, e.shiftKey);
                  }
                  if (e.shiftKey) {
                    return indentBlock(value, start, end, true);
                  }
                  return replaceSelection(value, start, end, INDENT);
                });
              }
            }}
            spellCheck={false}
            autoFocus
            wrap={wrap ? "soft" : "off"}
            className={cn(
              "h-[min(28rem,52dvh)] w-full resize-none rounded-2xl bg-muted/30 px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:bg-muted/45",
              !wrap && "overflow-x-auto whitespace-pre",
            )}
            placeholder={t("pasteCode")}
            aria-label={t("code")}
          />
        </div>

        <DialogFooter className="gap-2 border-t border-border/40 px-5 py-3.5 sm:justify-between">
          <p className="hidden text-[12px] text-muted-foreground sm:block">
            {t("editShortcuts")}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
 className="rounded-md border-none bg-muted/40 shadow-none hover:bg-muted/60"
              onClick={close}
            >
              {tc("cancel")}
            </Button>
 <Button type="button" className="rounded-md" onClick={save}>
              {tc("save")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
