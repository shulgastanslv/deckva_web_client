"use client";

import { useState } from "react";
import { BrushCleaning } from "lucide-react";
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
          className="size-9 rounded-full border-none text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground"
          title="Clear all slides"
        >
          <BrushCleaning className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Delete every slide?</DialogTitle>
          <DialogDescription>
            The carousel goes back to one empty slide. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            className="h-9 rounded-full border-none bg-muted/40 shadow-none hover:bg-muted/60"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="h-9 rounded-full"
            onClick={handleClear}
          >
            Delete slides
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
