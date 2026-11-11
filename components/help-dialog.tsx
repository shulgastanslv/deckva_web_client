"use client";

import { useTranslations } from "next-intl";

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

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const t = useTranslations("dialogs.help");

  const notes = [
    { label: t("moveTitle"), text: t("moveBody") },
    { label: t("objectTitle"), text: t("objectBody") },
    { label: t("panelsTitle"), text: t("panelsBody") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 rounded-2xl border-border p-5">
        <DialogHeader className="space-y-1.5 border-b border-border/40 pb-3 text-left">
          <DialogTitle className="text-[13px] font-semibold tracking-tight">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
            {t("intro")}
          </DialogDescription>
        </DialogHeader>

        <ul className="pt-1">
          {notes.map((note) => (
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
