"use client";

import { useEffect, useRef, useState } from "react";
import type { Group } from "fabric";
import { Code2, Smartphone } from "lucide-react";
import { useCanvasManager } from "@/context/canvas-manager";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import { PillSlider } from "@/components/ui/pill-slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CodeAppearanceSelect } from "@/components/canvas/sidebar/code-chrome-cards";
import {
  CODE_PADDINGS,
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

  return (
    <div className="flex flex-col gap-3 text-[14px]">
      {showAddButton ? (
        <Button
          type="button"
          variant="secondary"
          className={cn(sidebarActionBtn, "h-10 w-full text-[13px]")}
          onClick={() => onAdd?.(draft)}
        >
          <Code2 className="size-4" />
          Add code block
        </Button>
      ) : null}

      <CodeAppearanceSelect
        chromeStyle={chromeStyle}
        theme={draft.theme}
        lang={draft.lang}
        darkMode={draft.darkMode}
        onChromeChange={(style: CodeChromeStyle) =>
          patch({ chromeStyle: style, showChrome: style !== "none" }, true)
        }
        onThemeChange={(next: CodeThemeId) => patch({ theme: next }, true)}
        onLangChange={(next: CodeLang) => patch({ lang: next }, true)}
      />

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
          className="flex h-10 items-center justify-between gap-2 rounded-full bg-muted/20 px-3.5"
        >
          <span className="text-[13px] font-medium text-foreground/85">{label}</span>
          <Switch
            checked={draft[key]}
            onCheckedChange={(value) => patch({ [key]: value }, true)}
          />
        </label>
      ))}
        {!hasTarget ? (
        <p className="px-1 text-[13px] text-muted-foreground">
          Settings below apply to the next code block you add. Select a block
          on the canvas to edit it live.
        </p>
      ) : null}

    
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
