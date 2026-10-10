"use client";

import { HelpArt } from "@/components/canvas/canvas_icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NOTES = [
  { label: "Move", text: "Drag objects. Space pans. Scroll zooms." },
  { label: "Object", text: "Right-click for actions on the selection." },
  { label: "Panels", text: "Keys 1–9 switch panels. Esc leaves focus." },
];

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 rounded-2xl border-border p-5">
        <DialogHeader className="space-y-1.5 border-b border-border/40 pb-3 text-left">
          <div className="flex items-center gap-2.5">
            <HelpArt className="size-8 shrink-0" />
            <DialogTitle className="text-[13px] font-semibold tracking-tight">
              Help
            </DialogTitle>
          </div>
          <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
            One slide at a time. The strip under the canvas is the carousel.
          </DialogDescription>
        </DialogHeader>

        <ul className="pt-1">
          {NOTES.map((note) => (
            <li
              key={note.label}
              className="flex items-baseline gap-3 border-b border-border/40 py-3 last:border-b-0 last:pb-0"
            >
              <span className="w-14 shrink-0 text-[13px] font-medium text-foreground">
                {note.label}
              </span>
              <span className="text-[13px] leading-relaxed text-muted-foreground">
                {note.text}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
