"use client";

import {
  Layers2,
  Loader2,
  ScanSearch,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { useImageTools, type ImageToolId } from "@/components/canvas/use-image-tools";
import { Button } from "@/components/ui/button";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import { cn } from "@/lib/utils";
import type { UpscaleScale } from "@/lib/image/deckva-tools";

const SCALES: UpscaleScale[] = [2, 3, 4];

function busyLabel(busy: ImageToolId | null) {
  if (busy === "remove-bg") return "Removing background…";
  if (busy === "upscale") return "Upscaling…";
  if (busy === "magic-layer") return "Splitting layers…";
  return null;
}

export function SidebarEnhance() {
  const {
    image,
    canRun,
    busy,
    error,
    scale,
    setScale,
    removeBackground,
    upscale,
    magicLayer,
  } = useImageTools();

  const status = busyLabel(busy);

  return (
    <div className="flex flex-col gap-2">
      <CollapsibleGroup id="enhance-tools" title="Image tools">
        {!image && (
          <p className="px-1 text-[13px] leading-snug text-muted-foreground">
            Select an image on the canvas to use these tools.
          </p>
        )}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 w-full justify-start gap-2 rounded-full text-[13px]"
          disabled={!canRun}
          onClick={() => void removeBackground()}
        >
          {busy === "remove-bg" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <WandSparkles className="size-4" />
          )}
          Remove background
        </Button>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            {SCALES.map((value) => (
              <button
                key={value}
                type="button"
                disabled={Boolean(busy)}
                onClick={() => setScale(value)}
                className={cn(
                  "h-8 flex-1 rounded-full text-[13px] tabular-nums transition-colors disabled:opacity-40",
                  scale === value
                    ? "bg-foreground text-background"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {value}×
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-9 w-full justify-start gap-2 rounded-full text-[13px]"
            disabled={!canRun}
            onClick={() => void upscale()}
          >
            {busy === "upscale" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ScanSearch className="size-4" />
            )}
            Upscale {scale}×
          </Button>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 w-full justify-start gap-2 rounded-full text-[13px]"
          disabled={!canRun}
          onClick={() => void magicLayer()}
        >
          {busy === "magic-layer" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Layers2 className="size-4" />
          )}
          Magic layer
        </Button>

        {status && (
          <p className="flex items-center gap-1.5 px-1 text-[13px] leading-snug text-muted-foreground">
            <Sparkles className="size-3.5 shrink-0" />
            {status}
          </p>
        )}
        {error && (
          <p className="px-1 text-[13px] leading-snug text-destructive">{error}</p>
        )}
      </CollapsibleGroup>
    </div>
  );
}
