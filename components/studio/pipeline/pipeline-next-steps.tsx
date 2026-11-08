"use client";

import { ArrowRight } from "lucide-react";

import {
  GENERATION_REGISTRY,
  type GenerationTypeDef,
} from "@/lib/studio/generation/registry";
import type { GenerationKind } from "@/lib/studio/generation/types";
import { PIPELINE_PRIMARY } from "@/lib/studio/pipeline";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function PipelineNextSteps({
  from,
  onSelect,
  className,
  dense,
}: {
  from: GenerationKind;
  onSelect: (next: GenerationKind) => void;
  className?: string;
  dense?: boolean;
}) {
  const t = useTranslations("studio");
  const def = GENERATION_REGISTRY[from];
  const primary = def.nextSteps
    .map((kind) => GENERATION_REGISTRY[kind])
    .filter(Boolean) as GenerationTypeDef[];
  const helpers = (def.helperSteps ?? [])
    .map((kind) => GENERATION_REGISTRY[kind])
    .filter(Boolean) as GenerationTypeDef[];

  if (primary.length === 0 && helpers.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {primary.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {!dense ? (
            <p className="w-full text-[12px] text-muted-foreground">
              {t("continueToCarousel")}
            </p>
          ) : null}
          {primary.map((step) => {
            const Icon = step.icon;
            const isCarousel = step.kind === PIPELINE_PRIMARY;
            const label =
              step.kind === "text"
                ? t("caption")
                : step.kind === "palette"
                  ? t("palette")
                  : t("carousel");
            return (
              <button
                key={step.kind}
                type="button"
                onClick={() => onSelect(step.kind)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors",
                  isCarousel
                    ? "bg-foreground text-background hover:opacity-90"
                    : "bg-muted/40 text-foreground hover:bg-muted/60",
                  dense && "px-2.5 py-1.5 text-[12px]",
                )}
              >
                <Icon className="size-3.5 opacity-70" />
                {isCarousel ? t("makeCarouselCta") : label}
                <ArrowRight className="size-3 opacity-50" />
              </button>
            );
          })}
        </div>
      ) : null}

      {helpers.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {!dense ? (
            <p className="w-full text-[12px] text-muted-foreground">
              {t("orPrepFirst")}
            </p>
          ) : null}
          {helpers.map((step) => {
            const Icon = step.icon;
            const label =
              step.kind === "text"
                ? t("caption")
                : step.kind === "palette"
                  ? t("palette")
                  : t("carousel");
            return (
              <button
                key={step.kind}
                type="button"
                onClick={() => onSelect(step.kind)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full bg-muted/30 px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
                  dense && "px-2.5 py-1 text-[12px]",
                )}
              >
                <Icon className="size-3.5 opacity-70" />
                {label}
                <ArrowRight className="size-3 opacity-40" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
