"use client";

import { useEffect, useRef, useState } from "react";
import type { Group } from "fabric";
import { useCanvasManager } from "@/context/canvas-manager";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import { PillSlider } from "@/components/ui/pill-slider";
import { PillSelect } from "@/components/ui/pill-select";
import { Switch } from "@/components/ui/switch";
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

  const themeOptions = CODE_THEMES.map((theme) => ({
    value: theme.id,
    label: theme.label,
    leading: (
      <span
        className="size-3.5 shrink-0 rounded-full"
        style={{
          background: `linear-gradient(140deg, ${theme.background.from}, ${theme.background.to})`,
        }}
      />
    ),
  }));

  const langOptions = CODE_LANGS.map((lang) => ({
    value: lang.id,
    label: lang.label,
  }));

  return (
    <CollapsibleGroup id="rs-code" title="Code" defaultOpen>
      <div className="flex flex-col gap-2.5">
        <textarea
          value={draft.code}
          onChange={(e) => patch({ code: e.target.value })}
          rows={8}
          spellCheck={false}
          className="w-full resize-y rounded-[1.25rem] bg-muted/20 px-3.5 py-3 font-mono text-[12px] leading-relaxed outline-none placeholder:text-muted-foreground focus:bg-muted/30"
          placeholder="Paste your code…"
          aria-label="Code"
        />
        <p className="px-1 text-[12px] text-muted-foreground">
          Double-click the block for a larger editor.
        </p>

        <PillSelect
          label="Theme"
          value={draft.theme}
          onValueChange={(next) => patch({ theme: next as CodeThemeId }, true)}
          options={themeOptions}
          contentClassName="max-h-80"
        />

        <PillSelect
          label="Language"
          value={draft.lang}
          onValueChange={(next) => patch({ lang: next as CodeLang }, true)}
          options={langOptions}
        />

        <label className="relative flex h-10 w-full items-center overflow-hidden rounded-full bg-muted/20">
          <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3.5 text-[13px] font-medium text-foreground/85">
            Filename
          </span>
          <input
            value={draft.filename}
            onChange={(e) => patch({ filename: e.target.value })}
            placeholder="Untitled"
            aria-label="Filename"
            className="h-full w-full bg-transparent pr-3.5 pl-[5.75rem] text-right text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div className="space-y-1.5">
          <p className="px-1 text-[12px] font-medium text-muted-foreground">Padding</p>
          <div className="flex h-10 rounded-full bg-muted/20 p-1">
            {CODE_PADDINGS.map((pad) => (
              <button
                key={pad}
                type="button"
                onClick={() => patch({ padding: pad as CodePadding }, true)}
                className={cn(
                  "h-full flex-1 rounded-full text-[13px] font-medium transition-colors",
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

        {(
          [
            ["Dark mode", "darkMode"],
            ["Background", "showBackground"],
            ["Transparent", "transparent"],
            ["Window controls", "showChrome"],
            ["Line numbers", "showLineNumbers"],
          ] as const
        ).map(([label, key]) => (
          <label
            key={key}
            className="flex h-10 items-center justify-between gap-2 rounded-full bg-muted/20 px-3.5"
          >
            <span className="text-[13px] font-medium text-foreground/85">{label}</span>
            <Switch
              checked={draft[key]}
              onCheckedChange={(value) => patch({ [key]: value }, true)}
            />
          </label>
        ))}
      </div>
    </CollapsibleGroup>
  );
}
