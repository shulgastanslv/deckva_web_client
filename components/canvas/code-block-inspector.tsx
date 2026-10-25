"use client";

import { useEffect, useState } from "react";
import type { Group } from "fabric";
import { useCanvasManager } from "@/context/canvas-manager";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import { PillSlider } from "@/components/ui/pill-slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CODE_LANGS,
  CODE_THEMES,
  readCodeOptions,
  type CodeBlockOptions,
  type CodeLang,
  type CodeThemeId,
} from "@/lib/canvas/code-block";

export function CodeBlockInspector({ group }: { group: Group }) {
  const manager = useCanvasManager();
  const [draft, setDraft] = useState<CodeBlockOptions>(() => readCodeOptions(group));

  useEffect(() => {
    setDraft(readCodeOptions(group));
  }, [group]);

  const patch = (partial: Partial<CodeBlockOptions>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const apply = () => {
    if (!manager) return;
    manager.objects.updateCodeBlock(group, draft);
    manager.commit();
  };

  return (
    <CollapsibleGroup id="rs-code" title="Code" defaultOpen>
      <div className="flex flex-col gap-2.5">
        <textarea
          value={draft.code}
          onChange={(e) => patch({ code: e.target.value })}
          rows={8}
          spellCheck={false}
          className="w-full resize-y rounded-2xl bg-muted/40 px-3 py-2.5 font-mono text-[12px] leading-relaxed outline-none placeholder:text-muted-foreground focus:bg-muted/60"
          placeholder="Paste your code…"
          aria-label="Code"
        />

        <div className="grid grid-cols-2 gap-1.5">
          <Select
            value={draft.lang}
            onValueChange={(next) => patch({ lang: next as CodeLang })}
          >
            <SelectTrigger className="h-8 rounded-full px-2.5 text-[13px]" aria-label="Language">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent position="popper">
              {CODE_LANGS.map((lang) => (
                <SelectItem key={lang.id} value={lang.id} className="text-[13px]">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={draft.theme}
            onValueChange={(next) => patch({ theme: next as CodeThemeId })}
          >
            <SelectTrigger className="h-8 rounded-full px-2.5 text-[13px]" aria-label="Theme">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent position="popper">
              {CODE_THEMES.map((theme) => (
                <SelectItem key={theme.id} value={theme.id} className="text-[13px]">
                  {theme.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <input
          value={draft.filename}
          onChange={(e) => patch({ filename: e.target.value })}
          placeholder="filename.ts"
          aria-label="Filename"
          className="h-8 w-full rounded-full bg-muted/40 px-3 text-[13px] outline-none placeholder:text-muted-foreground focus:bg-muted/60"
        />

        <PillSlider
          label="Font size"
          value={draft.fontSize}
          min={14}
          max={40}
          step={1}
          formatValue={(n) => `${Math.round(n)}px`}
          onValueChange={(fontSize) => patch({ fontSize })}
        />
        <PillSlider
          label="Padding"
          value={draft.padding}
          min={12}
          max={56}
          step={1}
          formatValue={(n) => `${Math.round(n)}px`}
          onValueChange={(padding) => patch({ padding })}
        />
        <PillSlider
          label="Radius"
          value={draft.radius}
          min={0}
          max={40}
          step={1}
          formatValue={(n) => `${Math.round(n)}px`}
          onValueChange={(radius) => patch({ radius })}
        />

        <label className="flex items-center justify-between gap-2 rounded-full bg-muted/40 px-3 py-2">
          <span className="text-[13px] text-foreground/85">Window chrome</span>
          <Switch
            checked={draft.showChrome}
            onCheckedChange={(showChrome) => patch({ showChrome })}
          />
        </label>
        <label className="flex items-center justify-between gap-2 rounded-full bg-muted/40 px-3 py-2">
          <span className="text-[13px] text-foreground/85">Line numbers</span>
          <Switch
            checked={draft.showLineNumbers}
            onCheckedChange={(showLineNumbers) => patch({ showLineNumbers })}
          />
        </label>

        <Button
          type="button"
          className="h-9 w-full rounded-full"
          disabled={!manager}
          onClick={apply}
        >
          Apply
        </Button>
      </div>
    </CollapsibleGroup>
  );
}
