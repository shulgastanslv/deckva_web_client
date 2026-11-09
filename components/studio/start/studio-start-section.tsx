"use client";

import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import { StudioPrompt } from "@/components/studio/studio-prompt";
import type { StudioPromptSubmit } from "@/lib/studio/generation/types";
import { useTranslations } from "next-intl";

/** Home create strip: prompt → generate project. */
export function StudioStartSection({
  topic,
  onBlank,
  onTemplates,
  onBrandKit,
  onImportJson,
  onGenerate,
  generating,
  generateError,
  focusMode = false,
}: {
  name?: string | null;
  topic?: string;
  onBlank: () => void;
  onTemplates: () => void;
  onBrandKit?: () => void;
  onImportJson?: (file: File) => void | Promise<void>;
  onGenerate: (input: StudioPromptSubmit) => void | Promise<void>;
  generating?: boolean;
  generateError?: string | null;
  focusMode?: boolean;
}) {
  const t = useTranslations("studio");

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-[22px]">
            {t("makeCarousel")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {focusMode ? t("activationSub") : t("makeCarouselSub")}
          </p>
        </div>
        <StudioCreateMenu
          onBlank={onBlank}
          onTemplates={onTemplates}
          onBrandKit={onBrandKit}
          onImportJson={onImportJson}
          label={t("viewOptions")}
          align="end"
        />
      </div>

      <StudioPrompt
        initialTopic={topic}
        onSubmit={onGenerate}
        busy={generating}
        error={generateError}
      />
    </section>
  );
}
