"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LegalDocument,
  useLegalDocument,
} from "@/components/legal/legal-document";
import type { LegalKind } from "@/lib/legal/sections";

export type { LegalKind };

interface LegalDialogProps {
  kind: LegalKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LegalDialog({ kind, open, onOpenChange }: LegalDialogProps) {
  const { title, intro } = useLegalDocument(kind);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl border-border/70 p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border/40 px-5 pt-4 pb-3 text-left">
          <DialogTitle className="text-[13px] font-semibold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            {intro}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[min(70vh,560px)] overflow-y-auto px-5 py-4">
          <LegalDocument kind={kind} compact className="[&>header]:hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
