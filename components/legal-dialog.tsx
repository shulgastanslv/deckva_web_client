"use client";

import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type LegalKind = "terms" | "privacy";

const TERMS_SECTIONS: { heading: string; body: string[] }[] = [
  { heading: "service", body: ["service1", "service2"] },
  { heading: "accounts", body: ["accounts1", "accounts2"] },
  { heading: "yourWork", body: ["yourWork1", "yourWork2", "yourWork3"] },
  {
    heading: "acceptableUse",
    body: ["acceptableUse1", "acceptableUse2", "acceptableUse3"],
  },
  { heading: "otherServices", body: ["otherServices1", "otherServices2"] },
  { heading: "saving", body: ["saving1", "saving2"] },
  { heading: "ending", body: ["ending1"] },
  { heading: "liability", body: ["liability1"] },
  { heading: "changes", body: ["changes1"] },
];

const PRIVACY_SECTIONS: { heading: string; body: string[] }[] = [
  { heading: "who", body: ["who1"] },
  { heading: "account", body: ["account1", "account2", "account3"] },
  { heading: "projects", body: ["projects1", "projects2"] },
  { heading: "session", body: ["session1", "session2"] },
  { heading: "news", body: ["news1"] },
  { heading: "processors", body: ["processors1", "processors2"] },
  { heading: "retention", body: ["retention1", "retention2"] },
  { heading: "choices", body: ["choices1", "choices2"] },
  { heading: "children", body: ["children1"] },
  { heading: "security", body: ["security1", "security2"] },
];

interface LegalDialogProps {
  kind: LegalKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LegalDialog({ kind, open, onOpenChange }: LegalDialogProps) {
  const t = useTranslations("dialogs.legal");
  const updated = t("updated");
  const ns = kind;
  const sectionDefs = kind === "terms" ? TERMS_SECTIONS : PRIVACY_SECTIONS;

  const title = kind === "terms" ? t("termsTitle") : t("privacyTitle");
  const intro = kind === "terms" ? t("termsIntro") : t("privacyIntro");

  const sections = sectionDefs.map((section) => ({
    heading: t(`${ns}.sections.${section.heading}`),
    paragraphs: section.body.map((key) =>
      key === "changes1" || key === "security2"
        ? t(`${ns}.body.${key}`, { date: updated })
        : t(`${ns}.body.${key}`),
    ),
  }));

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
        <div className="max-h-[min(70vh,560px)] space-y-4 overflow-y-auto px-5 py-4">
          {sections.map((section) => (
            <section key={section.heading} className="space-y-1.5">
              <h3 className="text-[13px] font-medium text-foreground">
                {section.heading}
              </h3>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-[13px] leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
