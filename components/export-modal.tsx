"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Check,
  Copy,
  Download,
  Loader2,
  Share2,
} from "lucide-react";
import { FaFacebook, FaLinkedin, FaTelegram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";
import { useSlidesController } from "@/context/canvas-manager";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useProject } from "@/hooks/use-project";
import { useSession } from "next-auth/react";
import { setProjectPublic } from "@/actions/projects";
import { cn } from "@/lib/utils";
import {
  copyImageToClipboard,
  downloadSlidesAsZip,
  downloadSlidesSeparately,
  renderSlidesToImages,
  type ExportFormat,
  type RenderedSlide,
} from "@/lib/export/carousel";
import {
  blobToShareFile,
  canNativeShareFiles,
  nativeShareFiles,
  SOCIAL_NETWORKS,
  socialShareUrl,
  type SocialNetwork,
} from "@/lib/share/social";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNeedAuth?: () => void;
}

type PackMode = "zip" | "files";
type ScaleOption = 1 | 2;
type Panel = "download" | "share";

const NETWORK_ICONS: Record<SocialNetwork, React.ElementType> = {
  x: FaXTwitter,
  telegram: FaTelegram,
  linkedin: FaLinkedin,
  threads: SiThreads,
  facebook: FaFacebook,
  whatsapp: FaWhatsapp,
};

function Segmented<T extends string | number>({
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
    <div className="flex rounded-full bg-muted/50 p-0.5">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={cn(
            "h-8 flex-1 rounded-full text-[13px] transition-colors disabled:opacity-50",
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

export function ExportModal({ open, onOpenChange, onNeedAuth }: ExportModalProps) {
  const slidesController = useSlidesController();
  const slides = useCanvasStore((s) => s.slides);
  const markedSlideIds = useCanvasStore((s) => s.markedSlideIds);
  const canvasDimensions = useCanvasStore((s) => s.canvasDimensions);
  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const { status } = useSession();
  const { currentProjectId, persist } = useProject();

  const [panel, setPanel] = useState<Panel>("download");
  const [format, setFormat] = useState<ExportFormat>("png");
  const [pack, setPack] = useState<PackMode>("zip");
  const [scale, setScale] = useState<ScaleOption>(2);
  const [scope, setScope] = useState<"all" | "marked">("all");
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [linkBusy, setLinkBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [nativeShareOk, setNativeShareOk] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const renderedRef = useRef<RenderedSlide[] | null>(null);

  useEffect(() => {
    setNativeShareOk(canNativeShareFiles());
  }, []);

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      setExporting(false);
      setProgress(0);
      setDone(false);
      setError(null);
      setPreview(null);
      setCopied(false);
      setSharing(false);
      setLinkBusy(false);
      renderedRef.current = null;
      setPanel("download");
      return;
    }

    slidesController?.saveCurrent();
    const state = useCanvasStore.getState();
    const first =
      scope === "marked"
        ? state.slides.find((s) => markedSlideIds.includes(s.id)) ?? state.slides[0]
        : state.slides[0];
    if (!first) return;

    let cancelled = false;
    void renderSlidesToImages(
      [{ id: first.id, canvasJSON: first.canvasJSON }],
      state.canvasDimensions,
      { format: "png", multiplier: 1 },
    ).then((rows) => {
      if (cancelled) return;
      setPreview(rows[0]?.dataUrl ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [open, scope, markedSlideIds, slidesController]);

  const sizeLabel = useMemo(() => {
    const w = canvasDimensions.width * scale;
    const h = canvasDimensions.height * scale;
    return `${w}×${h}`;
  }, [canvasDimensions, scale]);

  const exportSlides = useMemo(
    () =>
      scope === "marked"
        ? slides.filter((slide) => markedSlideIds.includes(slide.id))
        : slides,
    [scope, slides, markedSlideIds],
  );

  const ensureShareLink = async (): Promise<string | null> => {
    if (status !== "authenticated") {
      onNeedAuth?.();
      return null;
    }
    setLinkBusy(true);
    setError(null);
    try {
      let id = currentProjectId;
      if (!id) {
        const res = await persist();
        if (!res.success || !("projectId" in res) || !res.projectId) {
          setError("Save the project first");
          return null;
        }
        id = res.projectId;
      }
      const pub = await setProjectPublic(id, true);
      if (!pub.success) {
        setError("Couldn't create a public link");
        return null;
      }
      const url = `${window.location.origin}/view/${id}`;
      setShareUrl(url);
      return url;
    } finally {
      setLinkBusy(false);
    }
  };

  const renderExport = async (): Promise<RenderedSlide[] | null> => {
    if (exportSlides.length === 0) return null;
    slidesController?.saveCurrent();
    const state = useCanvasStore.getState();
    const controller = new AbortController();
    abortRef.current = controller;
    setExporting(true);
    setProgress(0);
    setError(null);
    setDone(false);

    try {
      const rendered = await renderSlidesToImages(
        state.slides
          .filter((slide) => exportSlides.some((chosen) => chosen.id === slide.id))
          .map((s) => ({ id: s.id, canvasJSON: s.canvasJSON })),
        state.canvasDimensions,
        {
          format,
          quality: format === "jpeg" ? 0.92 : 1,
          multiplier: scale,
          signal: controller.signal,
          onProgress: (doneCount, total) => {
            setProgress(Math.round((doneCount / total) * 100));
          },
        },
      );
      renderedRef.current = rendered;
      if (rendered[0]?.dataUrl) setPreview(rendered[0].dataUrl);
      return rendered;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return null;
      console.error(err);
      setError(err instanceof Error ? err.message : "Export failed");
      return null;
    } finally {
      setExporting(false);
      abortRef.current = null;
    }
  };

  const handleDownload = async () => {
    if (exporting || exportSlides.length === 0) return;
    const rendered = await renderExport();
    if (!rendered || rendered.length === 0) return;
    const title = useCanvasStore.getState().projectTitle;
    if (pack === "zip") {
      await downloadSlidesAsZip(rendered, title, format);
    } else {
      downloadSlidesSeparately(rendered, title, format);
    }
    setDone(true);
  };

  const handleCopyFirst = async () => {
    if (exporting || exportSlides.length === 0) return;
    const rendered = renderedRef.current ?? (await renderExport());
    if (!rendered?.[0]) return;
    try {
      await copyImageToClipboard(rendered[0].blob);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't copy");
    }
  };

  const handleNativeShare = async () => {
    if (sharing || exportSlides.length === 0) return;
    setSharing(true);
    setError(null);
    try {
      const rendered = renderedRef.current ?? (await renderExport());
      if (!rendered || rendered.length === 0) return;
      const ext = format === "jpeg" ? "jpg" : "png";
      const base = projectTitle.trim() || "carousel";
      const files = rendered.map((slide) =>
        blobToShareFile(
          slide.blob,
          `${base}-${String(slide.index + 1).padStart(2, "0")}.${ext}`,
        ),
      );
      const result = await nativeShareFiles(files, {
        title: projectTitle,
        text: "Carousel from Swibp",
      });
      if (result === "unavailable") {
        setError("This device can't share image files. Download instead.");
      }
    } finally {
      setSharing(false);
    }
  };

  const openSocial = async (network: SocialNetwork) => {
    const url = shareUrl || (await ensureShareLink());
    if (!url) return;
    const href = socialShareUrl(network, {
      url,
      text: `${projectTitle} — carousel`,
    });
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const busy = exporting || sharing || linkBusy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl border-none p-0 sm:max-w-[400px]">
        <DialogHeader className="space-y-1 px-5 pt-5 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Export
          </DialogTitle>
          <p className="text-[13px] text-muted-foreground">
            {scope === "marked"
              ? `${exportSlides.length} of ${slides.length} marked`
              : `${slides.length} slide${slides.length === 1 ? "" : "s"}`}
            {" · "}
            {sizeLabel}
          </p>
        </DialogHeader>

        {preview ? (
          <div className="mx-5 mt-4 overflow-hidden rounded-2xl bg-muted/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Export preview"
              className="mx-auto max-h-40 w-auto object-contain"
            />
          </div>
        ) : null}

        <div className="px-5 pt-4">
          <Segmented
            value={panel}
            disabled={busy}
            onChange={(v) => setPanel(v as Panel)}
            options={[
              { value: "download", label: "Download" },
              { value: "share", label: "Share" },
            ]}
          />
        </div>

        {panel === "download" ? (
          <div className="space-y-3.5 px-5 py-4">
            <div className="space-y-1.5">
              <FieldLabel>Slides</FieldLabel>
              <Segmented
                value={scope}
                disabled={busy}
                onChange={(value) => setScope(value as "all" | "marked")}
                options={[
                  { value: "all", label: "All" },
                  {
                    value: "marked",
                    label:
                      markedSlideIds.length > 0
                        ? `Marked ${markedSlideIds.length}`
                        : "Marked",
                  },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <FieldLabel>Format</FieldLabel>
                <Segmented
                  value={format}
                  disabled={busy}
                  onChange={(v) => setFormat(v as ExportFormat)}
                  options={[
                    { value: "png", label: "PNG" },
                    { value: "jpeg", label: "JPEG" },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Scale</FieldLabel>
                <Segmented
                  value={scale}
                  disabled={busy}
                  onChange={(v) => setScale(v as ScaleOption)}
                  options={[
                    { value: 1, label: "1×" },
                    { value: 2, label: "2×" },
                  ]}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Pack</FieldLabel>
              <Segmented
                value={pack}
                disabled={busy}
                onChange={(v) => setPack(v as PackMode)}
                options={[
                  { value: "zip", label: "ZIP" },
                  { value: "files", label: "Files" },
                ]}
              />
            </div>
            {scope === "marked" && exportSlides.length === 0 && (
              <p className="text-[13px] text-muted-foreground">
                Mark slides with the corner check on the strip.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3.5 px-5 py-4">
            <p className="text-[13px] leading-snug text-muted-foreground">
              Post the carousel link, or hand images straight to Instagram,
              Stories, and Messages when your device supports it.
            </p>

            {nativeShareOk ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full rounded-full"
                disabled={busy || exportSlides.length === 0}
                onClick={() => void handleNativeShare()}
              >
                {sharing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Share2 className="size-4" />
                )}
                {sharing ? "Preparing…" : "Share images"}
              </Button>
            ) : null}

            <div className="space-y-1.5">
              <FieldLabel>Social</FieldLabel>
              <div className="grid grid-cols-3 gap-1.5">
                {SOCIAL_NETWORKS.map((network) => {
                  const Icon = NETWORK_ICONS[network.id];
                  return (
                    <Button
                      key={network.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-full text-[13px]"
                      disabled={busy}
                      onClick={() => void openSocial(network.id)}
                    >
                      <Icon className="size-3.5" />
                      {network.label}
                    </Button>
                  );
                })}
              </div>
              <p className="text-[11px] leading-snug text-muted-foreground">
                Social buttons open a public view link. Sign in if the project
                is not saved yet.
              </p>
            </div>
          </div>
        )}

        {(exporting || done) && (
          <div className="space-y-1.5 px-5 pb-2">
            <div className="flex justify-between text-[13px] text-muted-foreground">
              <span>{done ? "Done" : "Rendering…"}</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="px-5 pb-2 text-[13px] text-destructive">{error}</p>
        )}

        <div className="flex gap-2 px-5 pb-5">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-full"
            disabled={busy || exportSlides.length === 0}
            onClick={() => void handleCopyFirst()}
            title="Copy first slide image"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-1 rounded-full"
            disabled={busy || exportSlides.length === 0}
            onClick={() => void handleDownload()}
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : done ? (
              <Check className="size-4" />
            ) : (
              <Download className="size-4" />
            )}
            {exporting ? "Exporting…" : done ? "Downloaded" : "Download"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
