"use client";

import { useState } from "react";
import {
  Broom as BrushCleaning,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSlidesController } from "@/context/canvas-manager";
import { useCanvasStore } from "@/store/useCanvasStore";

/** Wipe the whole carousel back to one empty slide (not the image pixel eraser). */
export function ClearCanvasButton() {
  const slides = useSlidesController();
  const [open, setOpen] = useState(false);
  const t = useTranslations("editor.clear");
  const tc = useTranslations("common");

  const handleClear = () => {
    const store = useCanvasStore.getState();
    store.setSlides([
      {
        id: 1,
        canvasJSON: { version: "6.0.0", objects: [], background: "#ffffff" },
        thumbnail: null,
      },
    ]);
    store.setCurrentSlideId(1);
    store.setDirty(true);
    void slides?.loadCurrent();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
 className="size-9 rounded-md border-none text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground"
          title={t("aria")}
        >
          <BrushCleaning className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("body")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
 className="rounded-md border-none bg-muted/40 shadow-none hover:bg-muted/60"
            onClick={() => setOpen(false)}
          >
            {tc("cancel")}
          </Button>
          <Button
            variant="destructive"
 className="rounded-md"
            onClick={handleClear}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
