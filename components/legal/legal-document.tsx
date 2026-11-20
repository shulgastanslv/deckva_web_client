"use client";

import { useTranslations } from "next-intl";

import {
  legalSectionsFor,
  type LegalKind,
} from "@/lib/legal/sections";
import { cn } from "@/lib/utils";

export function useLegalDocument(kind: LegalKind) {
  const t = useTranslations("dialogs.legal");
  const updated = t("updated");
  const ns = kind;
  const sectionDefs = legalSectionsFor(kind);

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

  return { title, intro, sections, updated };
}

export function LegalDocument({
  kind,
  className,
  compact = false,
}: {
  kind: LegalKind;
  className?: string;
  /** Tighter type for dialogs. */
  compact?: boolean;
}) {
  const { title, intro, sections } = useLegalDocument(kind);
  const headingClass = compact
    ? "text-[13px] font-medium text-foreground"
    : "text-base font-medium text-foreground";
  const bodyClass = compact
    ? "text-[13px] leading-relaxed text-muted-foreground"
    : "text-[15px] leading-relaxed text-muted-foreground";

  return (
    <article className={cn("space-y-6", className)}>
      <header className="space-y-1.5">
        <h1
          className={cn(
            compact
              ? "text-[13px] font-semibold tracking-tight text-foreground"
              : "text-2xl font-semibold tracking-tight text-foreground",
          )}
        >
          {title}
        </h1>
        <p className={bodyClass}>{intro}</p>
      </header>
      <div className="space-y-5">
        {sections.map((section) => (
          <section key={section.heading} className="space-y-1.5">
            <h2 className={headingClass}>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className={bodyClass}>
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
