"use client";

import { useEffect, useRef, useState } from "react";
import type { Group } from "fabric";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sidebarSelectTrigger, sidebarTextarea } from "@/components/canvas/sidebar/sidebar-ui";
import {
  CODE_LANGS,
  isCodeBlock,
  readCodeOptions,
  type CodeBlockOptions,
  type CodeLang,
} from "@/lib/canvas/code-block";
import { cn } from "@/lib/utils";

const INDENT = "  ";

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

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-lg">
        <DialogHeader className="space-y-1 px-5 pt-5 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {t("editCode")}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            {t("pasteOrEdit")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-5 py-4">
          <div className="flex gap-2">
            <Input
              value={options?.filename ?? ""}
              onChange={(e) => patchOptions({ filename: e.target.value })}
              placeholder={t("filename")}
              aria-label={t("filename")}
              className="min-w-0 flex-1"
            />
            <Select
              value={options?.lang ?? "go"}
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
          </div>

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
              if (e.key !== "Tab") return;
              e.preventDefault();
              const el = textareaRef.current;
              if (!el) return;
              const start = el.selectionStart;
              const end = el.selectionEnd;
              const next =
                start !== end || e.shiftKey
                  ? indentBlock(code, start, end, e.shiftKey)
                  : replaceSelection(code, start, end, INDENT);
              setCode(next.value);
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
            autoFocus
            className={cn(sidebarTextarea, "h-64 font-mono")}
            placeholder={t("pasteCode")}
            aria-label={t("code")}
          />

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={close}
            >
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
