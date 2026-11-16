"use client";

import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { landMuted, landSerif } from "@/components/landing/landing-shell";
import { RevealItem, RevealStagger } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

export type FaqItem = {
  value: string;
  q: string;
  a: string;
};

export function FaqSection({ items }: { items: FaqItem[] }) {
  const t = useTranslations("landing.faq");

  return (
    <RevealStagger
      stagger={0.1}
      className="mx-auto grid w-full max-w-[960px] gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16"
    >
      <RevealItem soft>
        <h2
          className={cn(
            landSerif,
            "text-[2.5rem] leading-[1.05] sm:text-5xl",
          )}
        >
          {t("title")}
        </h2>
        <p className={cn(landMuted, "mt-4 max-w-xs")}>{t("sub")}</p>
      </RevealItem>
      <RevealItem>
        <Accordion type="single" collapsible defaultValue="project">
          {items.map((item) => (
            <AccordionItem
              key={item.value}
              value={item.value}
              className="border-0"
            >
              <AccordionTrigger className="min-h-12 py-4 text-left text-[15px] font-medium text-[#050038] hover:no-underline sm:text-base dark:text-foreground">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[15px] leading-relaxed text-[#050038]/55 dark:text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </RevealItem>
    </RevealStagger>
  );
}
