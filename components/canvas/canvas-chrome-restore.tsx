"use client";

import { PanelTop } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Floating control when canvas toolbar + slide navigator are hidden. */
export function CanvasChromeRestore({ onShow }: { onShow: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onShow}
        className="pointer-events-auto h-9 gap-1.5 rounded-full bg-background/90 px-3.5 text-[13px] font-medium text-foreground backdrop-blur-md"
        title="Show toolbar and slides (\\)"
      >
        <PanelTop className="size-3.5" />
        Show bars
        <kbd className="ml-0.5 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          \
        </kbd>
      </Button>
    </div>
  );
}
