"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Group } from "fabric";
import { FileCodeIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useCanvasManager } from "@/context/canvas-manager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/components/ui/code-block";
import { sidebarSelectTrigger } from "@/components/canvas/sidebar/sidebar-ui";
import { useHighlightedCode } from "@/hooks/use-highlighted-code";
import {
  CODE_LANGS,
  isCodeBlock,
  readCodeOptions,
  type CodeBlockOptions,
  type CodeLang,
} from "@/lib/canvas/code-block";
import { cn } from "@/lib/utils";

const INDENT = "  ";

function highlightLanguage(lang: CodeLang) {
  if (lang === "auto" || lang === "plaintext") return "text";
  if (lang === "shell") return "bash";
  return lang;
}

function replaceSelection(value: string, start: number, end: number, next: string) {
  return {
    value: value.slice(0, start) + next + value.slice(end),
    cursor: start + next.length,
  };
}

function indentBlock(code: string, start: number, end: number, out = false) {
  const lineStart = code.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const block = code.slice(lineStart, end);
  const lines = block.split("\n");
  const nextLines = lines.map((line) => {
    if (!out) return INDENT + line;
    if (line.startsWith("\t")) return line.slice(1);
    if (line.startsWith(INDENT)) return line.slice(INDENT.length);
    if (line.startsWith(" ")) return line.replace(/^ +/, (m) => m.slice(Math.min(2, m.length)));
    return line;
  });
  const nextBlock = nextLines.join("\n");
  return {
    value: code.slice(0, lineStart) + nextBlock + code.slice(end),
    start: lineStart,
    end: lineStart + nextBlock.length,
  };
}

function CodeBlockEditor({
  code,
  language,
  onChange,
  onSave,
  textareaRef,
}: {
  code: string;
  language: string;
  onChange: (value: string) => void;
  onSave: () => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const lines = useHighlightedCode(code, language);
  const shown = code.endsWith("\n") ? [...lines, ""] : lines.length > 0 ? lines : [""];

  return (
    <CodeBlockContent tabIndex={-1} className="max-h-80 min-h-64">
      <span className="relative grid min-w-max grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3">
        <span
          aria-hidden
          className="pointer-events-none select-none text-end text-muted-foreground"
        >
          {shown.map((_, index) => (
            <span key={index} className="block min-h-lh">
              {index + 1}
            </span>
          ))}
        </span>
        <span className="relative min-w-max">
          <span aria-hidden className="pointer-events-none block">
            {shown.map((line, index) => (
              <CodeBlockLine key={index} className="mx-0 px-0">
                {line === "" || (Array.isArray(line) && line.length === 0) ? "\u00a0" : line}
              </CodeBlockLine>
            ))}
          </span>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                onSave();
                return;
              }
              if (event.key !== "Tab") return;
              event.preventDefault();
              const el = textareaRef.current;
              if (!el) return;
              const start = el.selectionStart;
              const end = el.selectionEnd;
              const next =
                start !== end || event.shiftKey
                  ? indentBlock(code, start, end, event.shiftKey)
                  : replaceSelection(code, start, end, INDENT);
              onChange(next.value);
              const selStart = "start" in next ? next.start : next.cursor;
              const selEnd = "end" in next ? next.end : next.cursor;
              requestAnimationFrame(() => {
                const node = textareaRef.current;
                if (!node) return;
                node.focus();
                node.setSelectionRange(selStart, selEnd);
              });
            }}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoFocus
            aria-label="Code"
            className="absolute inset-0 size-full resize-none border-0 bg-transparent p-0 font-mono text-sm leading-relaxed text-transparent caret-foreground outline-none selection:bg-foreground/15"
          />
        </span>
      </span>
    </CodeBlockContent>
  );
}

export function CodeBlockEditDialog() {
  const manager = useCanvasManager();
  const t = useTranslations("editor.code");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [code, setCode] = useState("");
  const [options, setOptions] = useState<CodeBlockOptions | null>(null);
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
    });
  }, [manager]);

  const close = () => {
    setOpen(false);
    setGroup(null);
    setOptions(null);
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

  const lang = options?.lang ?? "go";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl">
        <DialogHeader className="space-y-1 px-5 pt-5 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {t("editCode")}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            {t("pasteOrEdit")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-5 py-4">
          <CodeBlock className="rounded-md border-0 bg-muted/40 shadow-none dark:bg-muted/30">
            <CodeBlockHeader>
              <CodeBlockTitle className="flex min-w-0 flex-1 items-center font-normal">
                <FileCodeIcon />
                <input
                  value={options?.filename ?? ""}
                  onChange={(event) => patchOptions({ filename: event.target.value })}
                  placeholder={t("filename")}
                  aria-label={t("filename")}
                  className="min-w-0 flex-1 bg-transparent font-sans text-sm font-normal text-foreground outline-none placeholder:text-muted-foreground"
                />
              </CodeBlockTitle>
              <CodeBlockActions>
                <Select
                  value={lang}
                  onValueChange={(value) => patchOptions({ lang: value as CodeLang })}
                >
                  <SelectTrigger
                    aria-label={t("language")}
                    className={cn(sidebarSelectTrigger, "w-[9.5rem] shrink-0")}
                  >
                    <SelectValue placeholder={t("language")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 rounded-2xl p-1.5">
                    {CODE_LANGS.map((item) => (
                      <SelectItem
                        key={item.id}
                        value={item.id}
                        className="rounded-md py-2.5 pl-3.5 pr-10 text-[13px] font-normal focus:bg-muted/50"
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CodeBlockCopyButton value={code} />
              </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockEditor
              code={code}
              language={highlightLanguage(lang)}
              onChange={setCode}
              onSave={save}
              textareaRef={textareaRef}
            />
          </CodeBlock>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={close}>
              {tc("cancel")}
            </Button>
            <Button type="button" className="flex-1" onClick={save}>
              {tc("save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
