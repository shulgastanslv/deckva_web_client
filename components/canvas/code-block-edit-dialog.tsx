"use client";

import { useEffect, useState } from "react";
import type { Group } from "fabric";

import { useCanvasManager } from "@/context/canvas-manager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  isCodeBlock,
  readCodeOptions,
  type CodeBlockOptions,
} from "@/lib/canvas/code-block";

export function CodeBlockEditDialog() {
  const manager = useCanvasManager();
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [code, setCode] = useState("");
  const [options, setOptions] = useState<CodeBlockOptions | null>(null);

  useEffect(() => {
    if (!manager) return;
    return manager.on("editCode", (target) => {
      if (!isCodeBlock(target)) return;
      const next = readCodeOptions(target);
      setGroup(target);
      setOptions(next);
      setCode(next.code);
      setOpen(true);
    });
  }, [manager]);

  const close = () => {
    setOpen(false);
    setGroup(null);
    setOptions(null);
  };

  const save = () => {
    if (!manager || !group || !options) return;
    manager.objects.updateCodeBlock(group, { ...options, code });
    manager.commit();
    close();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent className="flex max-h-[min(40rem,90dvh)] w-[min(42rem,calc(100vw-2rem))] flex-col gap-4 overflow-hidden rounded-3xl border-0 bg-background p-5 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit code</DialogTitle>
          <DialogDescription>
            Paste or edit the snippet. Save to refresh the block on the canvas.
          </DialogDescription>
        </DialogHeader>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              save();
            }
          }}
          spellCheck={false}
          autoFocus
          className="min-h-[18rem] w-full flex-1 resize-none rounded-2xl bg-muted/30 px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:bg-muted/45"
          placeholder="Paste your code…"
          aria-label="Code"
        />

        <DialogFooter className="gap-2 sm:justify-between">
          <p className="hidden text-[12px] text-muted-foreground sm:block">
            ⌘/Ctrl + Enter to save
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-9 rounded-full"
              onClick={close}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-9 rounded-full"
              onClick={save}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
