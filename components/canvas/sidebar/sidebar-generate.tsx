"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Sparkles, X } from "lucide-react";

import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import {
  beginGenerateSession,
  cancelGenerateSession,
  endGenerateSession,
} from "@/lib/ai/generate-session";
import {
  DEFAULT_GENERATE_OPTIONS,
  type HeadingPosition,
} from "@/lib/ai/generate-options";
import { runCarouselGenerate } from "@/lib/ai/run-carousel-generate";
import { suggestedSetById } from "@/lib/ai/carousel-style";
import { getTemplates, type TemplateListItem } from "@/actions/templates";
import { SUGGESTED_SETS } from "@/lib/presets/backgrounds";
import { useCanvasStore } from "@/store/useCanvasStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function SidebarGenerate() {
  const manager = useCanvasManager();
  const slidesController = useSlidesController();
  const genStatus = useCanvasStore((s) => s.genStatus);
  const [theme, setTheme] = useState("");
  const [slides, setSlides] = useState(5);
  const [setId, setSetId] = useState<string>("butter");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [headingPosition, setHeadingPosition] = useState<HeadingPosition>(
    DEFAULT_GENERATE_OPTIONS.headingPosition,
  );
  const [sentences, setSentences] = useState(DEFAULT_GENERATE_OPTIONS.sentences);
  const [edgeCount, setEdgeCount] = useState(DEFAULT_GENERATE_OPTIONS.edgeCount);
  const [localError, setLocalError] = useState<string | null>(null);

  const busy = genStatus === "streaming" || genStatus === "building";
  const selectedSet = suggestedSetById(setId) ?? SUGGESTED_SETS[0]!;
  const selectedTemplate = templates.find((tpl) => tpl.id === templateId) ?? null;
  const usingTemplate = Boolean(templateId);

  useEffect(() => {
    let alive = true;
    setTemplatesLoading(true);
    void getTemplates()
      .then((res) => {
        if (!alive) return;
        if (res.success) setTemplates(res.templates.slice(0, 24));
        else setTemplates([]);
      })
      .finally(() => {
        if (alive) setTemplatesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const cancel = () => {
    cancelGenerateSession();
    useCanvasStore.getState().setGenerate({
      genStatus: "idle",
      genPhase: "",
      genFx: "idle",
    });
  };

  const applyPalette = (id: string) => {
    const set = suggestedSetById(id);
    if (!set) return;
    setSetId(set.id);
    useCanvasStore.getState().setPalette({
      background: set.background,
      text: set.text,
      accent: set.accent,
      card: set.card,
    });
  };

  const generate = async () => {
    if (!manager || !slidesController || busy) return;
    const trimmed = theme.trim();
    if (trimmed.length < 2) return;

    setLocalError(null);
    const abort = beginGenerateSession();

    try {
      await runCarouselGenerate({
        theme: trimmed,
        slides,
        setId,
        options: {
          headingPosition,
          sentences,
          edgeCount,
          swipeHint: false,
          swipeText: DEFAULT_GENERATE_OPTIONS.swipeText,
          includeCta: false,
          templateId,
        },
        store: useCanvasStore,
        manager,
        slidesController,
        signal: abort.signal,
      });
    } catch (error) {
      if (abort.signal.aborted) return;
      const message = error instanceof Error ? error.message : "Generation failed";
      setLocalError(message);
      useCanvasStore.getState().setGenerate({
        genStatus: "error",
        genError: message,
        genPhase: "Generation failed",
        genFx: "idle",
      });
    } finally {
      endGenerateSession(abort);
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 px-1 py-1 text-[13px] text-foreground">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="gen-theme" className="px-1 text-muted-foreground">
          Theme
        </Label>
        <Textarea
          id="gen-theme"
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
          placeholder="Seed a niche, or paste a full carousel brief…"
          rows={3}
          disabled={busy}
          className="min-h-28 resize-y"
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex min-w-0 items-center justify-between gap-2 px-1">
          <Label className="text-muted-foreground">Template</Label>
          <div className="flex items-center gap-1">
            <span className="truncate text-[10px] text-muted-foreground">
              {selectedTemplate?.title ?? "Default layout"}
            </span>
            {templateId ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={busy}
                onClick={() => setTemplateId(null)}
                title="Clear template"
              >
                <X className="size-3" />
              </Button>
            ) : null}
          </div>
        </div>
        {templatesLoading ? (
          <div className="flex h-16 items-center justify-center text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <p className="px-1 text-[11px] text-muted-foreground">
            No templates yet — generation uses the default layout.
          </p>
        ) : (
          <ScrollArea className="h-full w-full rounded-xl border border-border/40">
            <div className="grid grid-cols-3 gap-1.5 p-1.5">
              <Button
                type="button"
                variant={!templateId ? "default" : "ghost"}
                disabled={busy}
                onClick={() => setTemplateId(null)}
                className="aspect-4/5 h-auto w-full flex-col gap-1 rounded-lg px-1 py-2 text-[10px] whitespace-normal"
              >
                Default
              </Button>
              {templates.map((tpl) => {
                const active = tpl.id === templateId;
                return (
                  <Button
                    key={tpl.id}
                    type="button"
                    variant="outline"
                    disabled={busy}
                    title={tpl.title}
                    onClick={() => {
                      setTemplateId(tpl.id);
                      setSlides(Math.min(20, Math.max(1, tpl.slideCount || slides)));
                    }}
                    className={cn(
                      "relative aspect-4/5 h-auto w-full overflow-hidden rounded-lg border p-0",
                      active && "ring-2 ring-foreground/70 border-foreground",
                    )}
                  >
                    {tpl.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tpl.previewUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="line-clamp-3 px-1 text-[10px] leading-tight text-muted-foreground">
                        {tpl.title}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      {!usingTemplate ? (
        <div className="flex flex-col gap-1.5">
          <Label className="px-1 text-muted-foreground">Palette</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                className="h-9 w-full justify-between rounded-full px-3"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-4 shrink-0 rounded-full border border-border/50"
                    style={{ backgroundColor: selectedSet.background }}
                  />
                  <span className="truncate">{selectedSet.label}</span>
                </span>
                <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) max-h-64 overflow-y-auto">
              {SUGGESTED_SETS.map((set) => {
                const active = set.id === setId;
                return (
                  <DropdownMenuItem
                    key={set.id}
                    onClick={() => applyPalette(set.id)}
                    className="gap-2"
                  >
                    <span
                      className="size-4 shrink-0 rounded-full border border-border/50"
                      style={{ backgroundColor: set.background }}
                    />
                    <span className="min-w-0 flex-1 truncate">{set.label}</span>
                    {active ? <Check className="size-3.5 shrink-0" /> : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <p className="px-1 text-[11px] text-muted-foreground">
          Layout and colors come from the template. AI only rewrites the text.
        </p>
      )}

      <Separator />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="gen-slides" className="px-1 text-muted-foreground">
          Slides
        </Label>
        <Input
          id="gen-slides"
          type="number"
          min={1}
          max={20}
          value={slides}
          disabled={busy}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (!Number.isFinite(next)) return;
            setSlides(Math.min(20, Math.max(1, Math.round(next))));
          }}
        />
      </div>

      {!usingTemplate ? (
        <div className="flex flex-col gap-1.5">
          <Label className="px-1 text-muted-foreground">Heading position</Label>
          <Tabs
            value={headingPosition}
            onValueChange={(value) => setHeadingPosition(value as HeadingPosition)}
            className="w-full gap-0"
          >
            <TabsList className="grid h-9 w-full grid-cols-3 rounded-full">
              <TabsTrigger value="top" disabled={busy} className="rounded-full text-[12px]">
                Top
              </TabsTrigger>
              <TabsTrigger value="center" disabled={busy} className="rounded-full text-[12px]">
                Center
              </TabsTrigger>
              <TabsTrigger value="bottom" disabled={busy} className="rounded-full text-[12px]">
                Bottom
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <Label className="text-muted-foreground">Sentences per slide</Label>
          <span className="text-[11px] text-muted-foreground tabular-nums">{sentences}</span>
        </div>
        <Slider
          min={1}
          max={8}
          step={1}
          value={[sentences]}
          disabled={busy}
          onValueChange={(value) => setSentences(value[0] ?? 1)}
        />
      </div>

      {!usingTemplate ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <Label className="text-muted-foreground">Edge texts</Label>
            <span className="text-[11px] text-muted-foreground tabular-nums">{edgeCount}</span>
          </div>
          <Slider
            min={0}
            max={4}
            step={1}
            value={[edgeCount]}
            disabled={busy}
            onValueChange={(value) => setEdgeCount(value[0] ?? 0)}
          />
        </div>
      ) : null}

      {localError ? <p className="px-1 text-[11px] text-destructive">{localError}</p> : null}

      <div className="sticky bottom-0 z-10 -mx-1 flex gap-1.5 bg-background/95 px-1 pt-2 pb-1 backdrop-blur-sm">
        <Button
          type="button"
          disabled={theme.trim().length < 2 || !manager || !slidesController || busy}
          onClick={() => void generate()}
          className="h-9 min-w-0 flex-1 rounded-full"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          {busy ? "Generating…" : "Generate"}
        </Button>
        {busy ? (
          <Button type="button" variant="secondary" onClick={cancel} className="h-9 rounded-full">
            Stop
          </Button>
        ) : null}
      </div>
    </div>
  );
}
