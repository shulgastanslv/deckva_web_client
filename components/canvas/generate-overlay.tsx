"use client";

import { Loader2, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cancelGenerateSession } from "@/lib/ai/generate-session";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";
import Logo from "../logo";

export function GenerateOverlay() {
  const status = useCanvasStore((s) => s.genStatus);
  const phase = useCanvasStore((s) => s.genPhase);
  const progress = useCanvasStore((s) => s.genProgress);
  const built = useCanvasStore((s) => s.genBuiltCount);
  const expected = useCanvasStore((s) => s.genExpectedSlides);
  const error = useCanvasStore((s) => s.genError);
  const resetGenerate = useCanvasStore((s) => s.resetGenerate);

  const active = status === "streaming" || status === "building";
  const show = active || status === "error" || status === "done";

  const cancel = () => {
    cancelGenerateSession();
    useCanvasStore.getState().setGenerate({ genStatus: "idle", genPhase: "", genFx: "idle" });
  };

  if (!show) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex flex-col items-center gap-3 px-4 pt-3">
      <div
        className={cn(
          "pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-border/60",
          "bg-background/90 shadow-xl backdrop-blur-md",
        )}
      >
        <div className="relative h-1 overflow-hidden bg-muted">
          <div
            className="absolute inset-y-0 left-0 bg-foreground transition-[width] duration-300 ease-out"
            style={{ width: `${Math.round(Math.min(1, progress) * 100)}%` }}
          />
        </div>

        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-full",
              status === "error" ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground",
            )}
          >
            {active ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Logo width={16} height={16} className="size-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-foreground">
              {status === "error"
                ? "Generation failed"
                : status === "done"
                  ? "Carousel ready"
                  : "Generating carousel"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {status === "error"
                ? error || "Something went wrong"
                : phase || "Starting…"}
              {expected > 0 && status !== "error" && built > 0
                ? ` · ${built}/${expected}`
                : null}
            </p>
          </div>
          {active ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 rounded-full px-2.5 text-[13px]"
              onClick={cancel}
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-7 rounded-full"
              onClick={() => resetGenerate()}
              title="Dismiss"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
