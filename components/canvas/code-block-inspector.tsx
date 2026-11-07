"use client";

import { useEffect, useRef, useState } from "react";
import type { Group } from "fabric";
import { Code2, Smartphone } from "lucide-react";
import { useCanvasManager } from "@/context/canvas-manager";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import { PillSlider } from "@/components/ui/pill-slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CodeChromeCards } from "@/components/canvas/sidebar/code-chrome-cards";
import { SidebarSearchSelect } from "@/components/canvas/sidebar/sidebar-search-select";
import {
  CODE_LANGS,
  CODE_PADDINGS,
  CODE_THEMES,
  DEFAULT_CODE_OPTIONS,
  fontSizeFromUiScale,
  readCodeOptions,
  resolveChromeStyle,
  uiScaleFromFontSize,
  type CodeBlockOptions,
  type CodeChromeStyle,
  type CodeLang,
  type CodePadding,
  type CodeThemeId,
} from "@/lib/canvas/code-block";
import { cn } from "@/lib/utils";
import { sidebarActionBtn } from "@/components/canvas/sidebar/sidebar-ui";

function useCodeDraft(group: Group | null) {
  const manager = useCanvasManager();
  const [draft, setDraft] = useState<CodeBlockOptions>(() =>
    group ? readCodeOptions(group) : { ...DEFAULT_CODE_OPTIONS },
  );
  const groupRef = useRef(group);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    groupRef.current = group;
    setDraft(group ? readCodeOptions(group) : { ...DEFAULT_CODE_OPTIONS });
  }, [group]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const applyNow = (next: CodeBlockOptions) => {
    if (!manager || !groupRef.current) return;
    const current = groupRef.current;
    const updated = manager.objects.updateCodeBlock(current, next);
    groupRef.current = updated;
  };

  const scheduleApply = (next: CodeBlockOptions) => {
    if (!groupRef.current) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      applyNow(next);
      timerRef.current = null;
    }, 180);
  };

  const patch = (partial: Partial<CodeBlockOptions>, immediate = false) => {
    setDraft((prev) => {
      const next = {
        ...prev,
        ...partial,
        chromeStyle: resolveChromeStyle(
          partial.chromeStyle ?? prev.chromeStyle,
          partial.showChrome ?? prev.showChrome,
        ),
      };
      next.showChrome = next.chromeStyle !== "none";
      if (!groupRef.current) return next;
      if (immediate) {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        queueMicrotask(() => applyNow(next));
      } else {
        scheduleApply(next);
      }
      return next;
    });
  };

  return { draft, patch, hasTarget: Boolean(group) };
}

export function CodeBlockSettings({
  group,
  showAddButton,
  onAdd,
  onOpenFrames,
}: {
  group: Group | null;
  showAddButton?: boolean;
  onAdd?: (options: CodeBlockOptions) => void;
  onOpenFrames?: () => void;
}) {
  const { draft, patch, hasTarget } = useCodeDraft(group);
  const chromeStyle = resolveChromeStyle(draft.chromeStyle, draft.showChrome);
  const uiScale = uiScaleFromFontSize(draft.fontSize);

  const themeOptions = CODE_THEMES.map((theme) => ({
    value: theme.id,
    label: theme.label,
    keywords: theme.id,
    leading: (
      <span
        className="size-4 shrink-0 rounded-full"
        style={{
          background: `linear-gradient(140deg, ${theme.background.from}, ${theme.background.to})`,
        }}
      />
    ),
  }));

  const langOptions = CODE_LANGS.map((lang) => ({
    value: lang.id,
    label: lang.label,
    keywords: lang.id,
  }));

  return (
    <div className="flex flex-col gap-3 text-[14px]">
      {showAddButton ? (
        <Button
          type="button"
          variant="secondary"
          className={cn(sidebarActionBtn, "h-11 w-full text-[14px]")}
          onClick={() => onAdd?.(draft)}
        >
          <Code2 className="size-4" />
          Add code block
        </Button>
      ) : null}

      <div className="space-y-2">
        <p className="px-1 text-[13px] font-medium text-muted-foreground">
          Window
        </p>
        <CodeChromeCards
          value={chromeStyle}
          onChange={(style: CodeChromeStyle) =>
            patch({ chromeStyle: style, showChrome: style !== "none" }, true)
          }
        />
      </div>

      {onOpenFrames ? (
        <button
          type="button"
          onClick={onOpenFrames}
          className="flex w-full items-center gap-2.5 rounded-2xl bg-muted/50 px-3 py-2.5 text-left transition-colors hover:bg-muted dark:bg-muted/25 dark:hover:bg-muted/40"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground dark:bg-muted/50">
            <Smartphone className="size-3.5" />
          </span>
          <span className="min-w-0 flex-1 text-[13px] leading-snug text-muted-foreground">
            Looking for Phone Mockups? Check out{" "}
            <span className="font-medium text-foreground">Frames</span>
          </span>
          <span className="text-muted-foreground">›</span>
        </button>
      ) : null}

      {!hasTarget ? (
        <p className="px-1 text-[13px] text-muted-foreground">
          Settings below apply to the next code block you add. Select a block
          on the canvas to edit it live.
        </p>
      ) : null}

      <textarea
        value={draft.code}
        onChange={(e) => patch({ code: e.target.value })}
        rows={8}
        spellCheck={false}
        className="w-full resize-y rounded-[1.25rem] bg-muted/20 px-3.5 py-3 font-mono text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground focus:bg-muted/30"
        placeholder="Paste your code…"
        aria-label="Code"
      />
      <p className="px-1 text-[13px] text-muted-foreground">
        Double-click the block for a larger editor.
      </p>

      <SidebarSearchSelect
        label="Theme"
        value={draft.theme}
        options={themeOptions}
        onValueChange={(next) => patch({ theme: next as CodeThemeId }, true)}
        searchPlaceholder="Search themes…"
        emptyText="No themes found"
      />

      <SidebarSearchSelect
        label="Language"
        value={draft.lang}
        options={langOptions}
        onValueChange={(next) => patch({ lang: next as CodeLang }, true)}
        searchPlaceholder="Search languages…"
        emptyText="No languages found"
      />

      <label className="relative flex h-11 w-full items-center overflow-hidden rounded-full bg-muted/20">
        <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3.5 text-[14px] font-medium text-foreground/85">
          Filename
        </span>
        <input
          value={draft.filename}
          onChange={(e) => patch({ filename: e.target.value })}
          placeholder="Untitled"
          aria-label="Filename"
          className="h-full w-full bg-transparent pr-3.5 pl-[5.75rem] text-right text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="space-y-1.5">
        <p className="px-1 text-[13px] font-medium text-muted-foreground">Padding</p>
        <div className="flex h-11 rounded-full bg-muted/20 p-1">
          {CODE_PADDINGS.map((pad) => (
            <button
              key={pad}
              type="button"
              onClick={() => patch({ padding: pad as CodePadding }, true)}
              className={cn(
                "h-full flex-1 rounded-full text-[14px] font-medium transition-colors",
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
        label="UI Scale"
        value={uiScale}
        min={60}
        max={170}
        step={5}
        formatValue={(n) => `${Math.round(n)}%`}
        onValueChange={(scale) =>
          patch({ fontSize: fontSizeFromUiScale(scale) })
        }
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
          ["Line numbers", "showLineNumbers"],
        ] as const
      ).map(([label, key]) => (
        <label
          key={key}
          className="flex h-11 items-center justify-between gap-2 rounded-full bg-muted/20 px-3.5"
        >
          <span className="text-[14px] font-medium text-foreground/85">{label}</span>
          <Switch
            checked={draft[key]}
            onCheckedChange={(value) => patch({ [key]: value }, true)}
          />
        </label>
      ))}
    </div>
  );
}

/** Right-sidebar wrapper kept for selection inspector (optional). */
export function CodeBlockInspector({ group }: { group: Group }) {
  return (
    <CollapsibleGroup id="rs-code" title="Code" defaultOpen>
      <CodeBlockSettings group={group} />
    </CollapsibleGroup>
  );
}
