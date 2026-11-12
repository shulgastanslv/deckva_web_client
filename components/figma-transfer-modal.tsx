"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowSquareOut,
  Check,
  DownloadSimple as Download,
  SpinnerGap as Loader2,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  importFigmaFramesAction,
  listFigmaFramesAction,
} from "@/actions/figma";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSlidesController } from "@/context/canvas-manager";
import { useApplyTemplate } from "@/hooks/use-apply-template";
import { trackEvent } from "@/lib/analytics";
import {
  downloadSlidesForFigma,
  type FigmaExportFormat,
} from "@/lib/export/figma";
import type { FigmaFrameNode } from "@/lib/figma/api";
import {
  buildSlideFromImageDataUrl,
  majorityRatio,
} from "@/lib/figma/slides";
import { CANVAS_RATIOS, type FabricCanvasJSON } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/store/useCanvasStore";

const TOKEN_KEY = "deckva.figma.pat";

type Panel = "import" | "export";

function FigmaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 36" className={className} aria-hidden>
      <path fill="#F24E1E" d="M0 6a6 6 0 0 1 6-6h6v12H6A6 6 0 0 1 0 6Z" />
      <path fill="#FF7262" d="M12 0h6a6 6 0 0 1 0 12h-6V0Z" />
      <path fill="#A259FF" d="M0 18a6 6 0 0 1 6-6h6v12H6a6 6 0 0 1-6-6Z" />
      <path fill="#1ABCFE" d="M18 12a6 6 0 1 0 0 12 6 6 0 1 0 0-12Z" />
      <path fill="#0ACF83" d="M6 36a6 6 0 0 0 6-6v-6H6a6 6 0 0 0 0 12Z" />
    </svg>
  );
}

function Segmented<T extends string>({
  value,
  options,
  disabled,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  disabled?: boolean;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-md bg-muted/50 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value as T)}
          className={cn(
            "h-8 flex-1 rounded-md text-[13px] transition-colors disabled:opacity-50",
            value === opt.value
              ? "bg-background font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}

const fieldClass =
  "h-9 w-full rounded-md border-none bg-muted/40 px-3 text-[13px] text-foreground shadow-none outline-none placeholder:text-muted-foreground focus:bg-muted/50";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNeedAuth?: () => void;
};

export function FigmaTransferModal({ open, onOpenChange, onNeedAuth }: Props) {
  const t = useTranslations("dialogs.figma");
  const slidesController = useSlidesController();
  const { applyPayload } = useApplyTemplate();
  const slides = useCanvasStore((s) => s.slides);
  const markedSlideIds = useCanvasStore((s) => s.markedSlideIds);
  const canvasDimensions = useCanvasStore((s) => s.canvasDimensions);

  const [panel, setPanel] = useState<Panel>("import");
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [remember, setRemember] = useState(true);
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [frames, setFrames] = useState<FigmaFrameNode[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [listing, setListing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<FigmaExportFormat>("svg");
  const [scope, setScope] = useState<"all" | "marked">("all");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;
    try {
      const saved = localStorage.getItem(TOKEN_KEY);
      if (saved) {
        setToken(saved);
        setRemember(true);
      }
    } catch {
      /* ignore */
    }
  }, [open]);

  useEffect(() => {
    if (open) return;
    abortRef.current?.abort();
    abortRef.current = null;
    setListing(false);
    setImporting(false);
    setExporting(false);
    setProgress(0);
    setError(null);
    setPanel("import");
  }, [open]);

  const exportSlides = useMemo(
    () =>
      scope === "marked"
        ? slides.filter((slide) => markedSlideIds.includes(slide.id))
        : slides,
    [scope, slides, markedSlideIds],
  );

  const persistToken = (value: string) => {
    try {
      if (remember && value.trim()) localStorage.setItem(TOKEN_KEY, value.trim());
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  };

  const toggleFrame = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(frames.map((f) => f.id)));
  };

  const handleList = async () => {
    setError(null);
    setListing(true);
    try {
      const res = await listFigmaFramesAction({ url, token });
      if (res.success === false) {
        if (/sign in/i.test(res.error)) onNeedAuth?.();
        setError(res.error);
        return;
      }
      persistToken(token);
      setFileKey(res.fileKey);
      setFileName(res.fileName);
      setFrames(res.frames);
      setSelected(
        new Set(
          res.focusedNodeId
            ? [res.focusedNodeId]
            : res.frames.slice(0, 12).map((f) => f.id),
        ),
      );
      trackEvent("figma_frames_listed", { count: res.frames.length });
    } finally {
      setListing(false);
    }
  };

  const handleImport = async () => {
    if (!fileKey || selected.size === 0 || importing) return;
    setError(null);
    setImporting(true);
    setProgress(0);
    try {
      const chosen = frames.filter((f) => selected.has(f.id));
      const res = await importFigmaFramesAction({
        fileKey,
        token,
        nodeIds: [...selected],
        frames: chosen,
      });
      if (res.success === false) {
        if (/sign in/i.test(res.error)) onNeedAuth?.();
        setError(res.error);
        return;
      }

      const ratio = majorityRatio(res.slides);
      const size = CANVAS_RATIOS[ratio];
      const canvasSlides: FabricCanvasJSON[] = [];
      for (let i = 0; i < res.slides.length; i++) {
        const slide = res.slides[i]!;
        canvasSlides.push(
          await buildSlideFromImageDataUrl(slide.dataUrl, size),
        );
        setProgress(Math.round(((i + 1) / res.slides.length) * 100));
      }

      slidesController?.saveCurrent();
      await applyPayload({
        aspectRatio: ratio,
        slides: canvasSlides,
      });
      trackEvent("figma_imported", { slides: canvasSlides.length });
      toast.success(t("importDone", { count: canvasSlides.length }));
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("importFailed"));
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    if (exporting || exportSlides.length === 0) return;
    slidesController?.saveCurrent();
    const state = useCanvasStore.getState();
    const controller = new AbortController();
    abortRef.current = controller;
    setExporting(true);
    setProgress(0);
    setError(null);
    try {
      await downloadSlidesForFigma({
        slides: state.slides
          .filter((slide) => exportSlides.some((c) => c.id === slide.id))
          .map((s) => ({ id: s.id, canvasJSON: s.canvasJSON })),
        size: state.canvasDimensions,
        projectTitle: state.projectTitle,
        format: exportFormat,
        multiplier: 2,
        signal: controller.signal,
        onProgress: (done, total) => {
          setProgress(Math.round((done / total) * 100));
        },
      });
      trackEvent("figma_exported", {
        format: exportFormat,
        slides: exportSlides.length,
      });
      toast.success(t("exportDone"));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : t("exportFailed"));
    } finally {
      setExporting(false);
      abortRef.current = null;
    }
  };

  const busy = listing || importing || exporting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-[440px]">
        <DialogHeader className="space-y-1 px-5 pt-5 text-left">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <FigmaMark className="h-5 w-[14px]" />
            {t("title")}
          </DialogTitle>
          <p className="text-[13px] text-muted-foreground">{t("subtitle")}</p>
        </DialogHeader>

        <div className="px-5 pt-4">
          <Segmented
            value={panel}
            disabled={busy}
            onChange={(v) => setPanel(v)}
            options={[
              { value: "import" as const, label: t("importTab") },
              { value: "export" as const, label: t("exportTab") },
            ]}
          />
        </div>

        {panel === "import" ? (
          <div className="space-y-3.5 px-5 py-4">
            <div className="space-y-1.5">
              <FieldLabel>{t("fileLink")}</FieldLabel>
              <input
                className={fieldClass}
                value={url}
                disabled={busy}
                placeholder={t("fileLinkPlaceholder")}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <FieldLabel>{t("token")}</FieldLabel>
                <a
                  href="https://www.figma.com/developers/api#access-tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  {t("tokenHelp")}
                  <ArrowSquareOut className="size-3" />
                </a>
              </div>
              <input
                type="password"
                autoComplete="off"
                className={fieldClass}
                value={token}
                disabled={busy}
                placeholder={t("tokenPlaceholder")}
                onChange={(e) => setToken(e.target.value)}
              />
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted-foreground">
                <input
                  type="checkbox"
                  className="size-3.5 rounded-sm accent-foreground"
                  checked={remember}
                  disabled={busy}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                {t("rememberToken")}
              </label>
            </div>

            <Button
              type="button"
              disabled={busy || !url.trim() || !token.trim()}
              onClick={() => void handleList()}
              className="h-9 w-full rounded-md border-none bg-muted/50 text-[13px] shadow-none hover:bg-muted/60"
            >
              {listing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("listing")}
                </>
              ) : (
                t("loadFrames")
              )}
            </Button>

            {fileName ? (
              <p className="truncate text-[12px] text-muted-foreground">
                {fileName}
                {frames.length > 0
                  ? ` · ${t("frameCount", { count: frames.length })}`
                  : null}
              </p>
            ) : null}

            {frames.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel>{t("frames")}</FieldLabel>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={selectAll}
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    {t("selectAll")}
                  </button>
                </div>
                <ul className="max-h-44 space-y-1 overflow-y-auto rounded-md bg-muted/20 p-1.5">
                  {frames.map((frame) => {
                    const on = selected.has(frame.id);
                    return (
                      <li key={frame.id}>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => toggleFrame(frame.id)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors",
                            on
                              ? "bg-muted/60 text-foreground"
                              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-4 shrink-0 items-center justify-center rounded-sm",
                              on ? "bg-foreground text-background" : "bg-muted/60",
                            )}
                          >
                            {on ? <Check className="size-3" weight="bold" /> : null}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{frame.name}</span>
                          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                            {frame.width}×{frame.height}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            {error ? (
              <p className="text-[12px] text-destructive">{error}</p>
            ) : null}

            {importing ? (
              <p className="text-[12px] text-muted-foreground">
                {t("importing")} {progress}%
              </p>
            ) : null}

            <Button
              type="button"
              disabled={busy || !fileKey || selected.size === 0}
              onClick={() => void handleImport()}
              className="h-9 w-full rounded-md border-none bg-primary text-[13px] text-primary-foreground shadow-none hover:bg-primary/90"
            >
              {importing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("importing")}
                </>
              ) : (
                t("importSelected", { count: selected.size })
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3.5 px-5 py-4">
            <p className="text-[13px] text-muted-foreground">{t("exportHint")}</p>

            <div className="space-y-1.5">
              <FieldLabel>{t("slides")}</FieldLabel>
              <Segmented
                value={scope}
                disabled={busy}
                onChange={(v) => setScope(v)}
                options={[
                  {
                    value: "all" as const,
                    label: t("allSlides", { count: slides.length }),
                  },
                  {
                    value: "marked" as const,
                    label: t("markedSlides", { count: markedSlideIds.length }),
                  },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel>{t("format")}</FieldLabel>
              <Segmented
                value={exportFormat}
                disabled={busy}
                onChange={(v) => setExportFormat(v)}
                options={[
                  { value: "svg" as const, label: "SVG" },
                  { value: "png" as const, label: "PNG" },
                ]}
              />
            </div>

            <p className="text-[12px] text-muted-foreground">
              {canvasDimensions.width}×{canvasDimensions.height}
              {" · "}
              {t("slideCount", { count: exportSlides.length })}
            </p>

            {error ? (
              <p className="text-[12px] text-destructive">{error}</p>
            ) : null}

            {exporting ? (
              <p className="text-[12px] text-muted-foreground">
                {t("exporting")} {progress}%
              </p>
            ) : null}

            <Button
              type="button"
              disabled={busy || exportSlides.length === 0}
              onClick={() => void handleExport()}
              className="h-9 w-full rounded-md border-none bg-primary text-[13px] text-primary-foreground shadow-none hover:bg-primary/90"
            >
              {exporting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("exporting")}
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  {t("downloadZip")}
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
