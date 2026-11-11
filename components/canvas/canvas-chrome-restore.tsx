"use client";

import {
  Browser as PanelTop,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

/** Floating control when canvas toolbar + slide navigator are hidden. */
export function CanvasChromeRestore({ onShow }: { onShow: () => void }) {
  const t = useTranslations("editor.toolbar");

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onShow}
        className="pointer-events-auto h-9 gap-1.5 rounded-md bg-background/90 px-3.5 text-[13px] font-medium text-foreground backdrop-blur-md"
        title={t("showBarsTitle")}
      >
        <PanelTop className="size-3.5" />
        {t("showBars")}
        <kbd className="ml-0.5 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          \
        </kbd>
      </Button>
    </div>
  );
}
