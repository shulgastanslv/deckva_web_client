"use client";

import { useEffect, useRef, useState } from "react";
import type { Group } from "fabric";
import { useCanvasManager } from "@/context/canvas-manager";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import { PillSlider } from "@/components/ui/pill-slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CODE_LANGS,
  CODE_PADDINGS,
  CODE_THEMES,
  readCodeOptions,
  type CodeBlockOptions,
  type CodeLang,
  type CodePadding,
  type CodeThemeId,
} from "@/lib/canvas/code-block";
import { cn } from "@/lib/utils";

export function CodeBlockInspector({ group }: { group: Group }) {
  const manager = useCanvasManager();
  const [draft, setDraft] = useState<CodeBlockOptions>(() => readCodeOptions(group));
  const groupRef = useRef(group);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    groupRef.current = group;
    setDraft(readCodeOptions(group));
  }, [group]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const applyNow = (next: CodeBlockOptions) => {
    if (!manager) return;
    const current = groupRef.current;
    const updated = manager.objects.updateCodeBlock(current, next);
    groupRef.current = updated;
  };

  const scheduleApply = (next: CodeBlockOptions) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      applyNow(next);
      timerRef.current = null;
    }, 180);
  };

  const patch = (partial: Partial<CodeBlockOptions>, immediate = false) => {
    setDraft((prev) => {
      const next = { ...prev, ...partial };
      if (immediate) {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        queueMicrotask(() => applyNow(next));
      } else {
        scheduleApply(next);
      }
      return next;
    });
  };

  const activeTheme = CODE_THEMES.find((theme) => theme.id === draft.theme);

  return (
    <CollapsibleGroup id="rs-code" title="Code" defaultOpen>
      <div className="flex flex-col gap-3">
        <textarea
          value={draft.code}
          onChange={(e) => patch({ code: e.target.value })}
          rows={8}
          spellCheck={false}
          className="w-full resize-y rounded-2xl bg-muted/40 px-3 py-2.5 font-mono text-[12px] leading-relaxed outline-none placeholder:text-muted-foreground focus:bg-muted/60"
          placeholder="Paste your code…"
          aria-label="Code"
        />
        <p className="px-1 text-[12px] text-muted-foreground">
          Tip: double-click the block (or empty canvas) to edit in a larger editor.
        </p>

        <Select
          value={draft.theme}
          onValueChange={(next) => patch({ theme: next as CodeThemeId }, true)}
        >
          <SelectTrigger className="h-10 rounded-full  w-full px-3 text-[13px]" aria-label="Theme">
            <SelectValue placeholder="Theme"> 
              {activeTheme ? (
                <span className="flex items-center gap-2">
                  <span
                    className="size-3.5 shrink-0 rounded-full"
                    style={{
                      background: `linear-gradient(140deg, ${activeTheme.background.from}, ${activeTheme.background.to})`,
                    }}
                  />
                  {activeTheme.label}
                </span>
              ) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-80">
            {CODE_THEMES.map((theme) => (
              <SelectItem key={theme.id} value={theme.id} className="text-[13px]">
                <span className="flex items-center gap-2">
                  <span
                    className="size-3.5 shrink-0 rounded-full"
                    style={{
                      background: `linear-gradient(140deg, ${theme.background.from}, ${theme.background.to})`,
                    }}
                  />
                  {theme.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-1.5">
          <Select
            value={draft.lang}
            onValueChange={(next) => patch({ lang: next as CodeLang }, true)}
          >
            <SelectTrigger className="h-9 rounded-full px-3 text-[13px]" aria-label="Language">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-72">
              {CODE_LANGS.map((lang) => (
                <SelectItem key={lang.id} value={lang.id} className="text-[13px]">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            value={draft.filename}
            onChange={(e) => patch({ filename: e.target.value })}
            placeholder="Untitled"
            aria-label="Title"
            className="h-9 w-full rounded-full bg-muted/40 px-3 text-[13px] outline-none placeholder:text-muted-foreground focus:bg-muted/60"
          />
        </div>

        <div className="space-y-1.5">
          <p className="px-1 text-[12px] font-medium text-muted-foreground">Padding</p>
          <div className="flex rounded-full bg-muted/40 p-0.5">
            {CODE_PADDINGS.map((pad) => (
              <button
                key={pad}
                type="button"
                onClick={() => patch({ padding: pad as CodePadding }, true)}
                className={cn(
                  "h-8 flex-1 rounded-full text-[13px] font-medium transition-colors",
                  draft.padding === pad
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {pad}
              </button>
            ))}
          </div>
        </div>

        <PillSlider
          label="Font size"
          value={draft.fontSize}
          min={16}
          max={48}
          step={1}
          formatValue={(n) => `${Math.round(n)}px`}
          onValueChange={(fontSize) => patch({ fontSize })}
        />
        <PillSlider
          label="Radius"
          value={draft.radius}
          min={0}
          max={32}
          step={1}
          formatValue={(n) => `${Math.round(n)}px`}
          onValueChange={(radius) => patch({ radius })}
        />

        <label className="flex items-center justify-between gap-2 rounded-full bg-muted/40 px-3 py-2">
          <span className="text-[13px] text-foreground/85">Dark mode</span>
          <Switch
            checked={draft.darkMode}
            onCheckedChange={(darkMode) => patch({ darkMode }, true)}
          />
        </label>
        <label className="flex items-center justify-between gap-2 rounded-full bg-muted/40 px-3 py-2">
          <span className="text-[13px] text-foreground/85">Background</span>
          <Switch
            checked={draft.showBackground}
            onCheckedChange={(showBackground) => patch({ showBackground }, true)}
          />
        </label>
        <label className="flex items-center justify-between gap-2 rounded-full bg-muted/40 px-3 py-2">
          <span className="text-[13px] text-foreground/85">Transparent</span>
          <Switch
            checked={draft.transparent}
            onCheckedChange={(transparent) => patch({ transparent }, true)}
          />
        </label>
        <label className="flex items-center justify-between gap-2 rounded-full bg-muted/40 px-3 py-2">
          <span className="text-[13px] text-foreground/85">Window controls</span>
          <Switch
            checked={draft.showChrome}
            onCheckedChange={(showChrome) => patch({ showChrome }, true)}
          />
        </label>
        <label className="flex items-center justify-between gap-2 rounded-full bg-muted/40 px-3 py-2">
          <span className="text-[13px] text-foreground/85">Line numbers</span>
          <Switch
            checked={draft.showLineNumbers}
            onCheckedChange={(showLineNumbers) => patch({ showLineNumbers }, true)}
          />
        </label>
      </div>
    </CollapsibleGroup>
  );
}
