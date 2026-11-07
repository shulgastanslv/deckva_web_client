"use client";

import { ArrowRight } from "lucide-react";

import {
  GENERATION_REGISTRY,
  type GenerationTypeDef,
} from "@/lib/studio/generation/registry";
import type { GenerationKind } from "@/lib/studio/generation/types";
import { cn } from "@/lib/utils";

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
  const def = GENERATION_REGISTRY[from];
  const steps = def.nextSteps
    .map((kind) => GENERATION_REGISTRY[kind])
    .filter(Boolean) as GenerationTypeDef[];

  if (steps.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {!dense ? (
        <p className="text-[12px] text-muted-foreground">Next step</p>
      ) : null}
      {steps.map((step) => {
        const Icon = step.icon;
        return (
          <button
            key={step.kind}
            type="button"
            onClick={() => onSelect(step.kind)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full bg-muted/40 px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60",
              dense && "px-2.5 py-1 text-[12px]",
            )}
          >
            <Icon className="size-3.5 opacity-70" />
            Generate {step.label.toLowerCase()}
            <ArrowRight className="size-3 opacity-50" />
          </button>
        );
      })}
    </div>
  );
}
