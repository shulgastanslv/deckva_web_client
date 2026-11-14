"use client";

import { Plus } from "@phosphor-icons/react";

import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import { StudioPrompt } from "@/components/studio/studio-prompt";
import { STARTER_CAROUSEL_PROMPTS } from "@/lib/studio/onboarding";
import type { StudioPromptSubmit } from "@/lib/studio/generation/types";
import { trackEvent } from "@/lib/analytics";
import { useTranslations } from "next-intl";

/** Home create strip: title + prompt, then starters. */
export function StudioStartSection({
  topic,
  onBlank,
  onTemplates,
  onBrandKit,
  onImportJson,
  onGenerate,
  onStarter,
  generating,
  generateError,
}: {
  name?: string | null;
  topic?: string;
  onBlank: () => void;
  onTemplates: () => void;
  onBrandKit?: () => void;
  onImportJson?: (file: File) => void | Promise<void>;
  onGenerate: (input: StudioPromptSubmit) => void | Promise<void>;
  onStarter?: (topic: string, starterId: string) => void | Promise<void>;
  generating?: boolean;
  generateError?: string | null;
  focusMode?: boolean;
}) {
  const t = useTranslations("studio");

  return (
    <section>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {t("makeCarousel")}
          </h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground sm:text-sm">
            {t("activationSub")}
          </p>
        </div>
        <StudioCreateMenu
          onBlank={onBlank}
          onTemplates={onTemplates}
          onBrandKit={onBrandKit}
          onImportJson={onImportJson}
          label={t("otherWays")}
          leading={<Plus className="size-3.5 stroke-[1.5]" />}
          align="end"
          triggerClassName="shrink-0 gap-1.5 bg-muted/40 px-3.5 text-[13px] font-normal text-foreground hover:bg-muted/60 data-[state=open]:bg-muted/60"
        />
      </div>

      <StudioPrompt
        initialTopic={topic}
        onSubmit={onGenerate}
        busy={generating}
        error={generateError}
      />

      {onStarter ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[12px] text-muted-foreground">
            {t("tryStarter")}
          </span>
          {STARTER_CAROUSEL_PROMPTS.map((starter) => (
            <button
              key={starter.id}
              type="button"
              disabled={generating}
              onClick={() => {
                trackEvent("studio_starter_chip", { id: starter.id });
                void onStarter(
                  t(`starters.${starter.id}.topic`),
                  starter.id,
                );
              }}
              className="inline-flex h-8 items-center rounded-md bg-muted/40 px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-muted/60 disabled:opacity-60"
            >
              {t(`starters.${starter.id}.label`)}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
