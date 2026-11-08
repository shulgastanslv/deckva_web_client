"use client";

import { useState } from "react";

import type { ArtifactListItem } from "@/actions/artifacts";
import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import { StudioTemplatesDialog } from "@/components/studio/dialogs/studio-templates-dialog";
import { StudioBrandDialog } from "@/components/studio/dialogs/start/studio-brand-dialog";
import { StudioCarouselDialog } from "@/components/studio/dialogs/start/studio-carousel-dialog";
import { StudioCodeBlockDialog } from "@/components/studio/dialogs/start/studio-codeblock-dialog";
import { StudioListDialog } from "@/components/studio/dialogs/start/studio-list-dialog";
import { StudioPaletteDialog } from "@/components/studio/dialogs/start/studio-palette-dialog";
import { StudioTextDialog } from "@/components/studio/dialogs/start/studio-text-dialog";
import {
  StudioCreateTile,
  StudioStartTile,
} from "@/components/studio/start/studio-start-tile";
import { StudioStartRow } from "@/components/studio/start/studio-start-row";
import {
  StudioPrompt,
  type GenerationKind,
  type StudioPromptSubmit,
} from "@/components/studio/studio-prompt";
import {
  START_BLOCK_ORDER,
  START_BLOCKS,
  type CarouselStartForm,
  type StartBlockId,
} from "@/lib/studio/start-blocks";
import { inferPromptLanguage, normalizeHandle } from "@/lib/ai/prompt";
import { useTranslations } from "next-intl";

type DialogId = StartBlockId;

export function StudioStartSection({
  name,
  topic,
  initialType = "carousel",
  onBlank,
  onTemplates,
  onBrandKit,
  onImportJson,
  onSelectKind,
  onGenerate,
  onTextGenerate,
  onPaletteGenerate,
  onCarouselGenerate,
  onCodeInsert,
  onListInsert,
  onBrandApply,
  palettes = [],
  defaultHandle,
  generating,
  generateError,
}: {
  name: string | null;
  topic?: string;
  initialType?: GenerationKind;
  onBlank: () => void;
  onTemplates: () => void;
  onBrandKit?: () => void;
  onImportJson?: (file: File) => void | Promise<void>;
  onSelectKind: (kind: GenerationKind) => void;
  onGenerate: (input: StudioPromptSubmit) => void | Promise<void>;
  onTextGenerate: (topic: string) => boolean | void | Promise<boolean | void>;
  onPaletteGenerate: (
    topic: string,
  ) => boolean | void | Promise<boolean | void>;
  onCarouselGenerate: (
    form: CarouselStartForm,
  ) => boolean | void | Promise<boolean | void>;
  onCodeInsert: (code: string) => boolean | void | Promise<boolean | void>;
  onListInsert: (items: string[]) => boolean | void | Promise<boolean | void>;
  onBrandApply: (
    artifact: ArtifactListItem,
  ) => boolean | void | Promise<boolean | void>;
  palettes?: ArtifactListItem[];
  defaultHandle?: string;
  generating?: boolean;
  generateError?: string | null;
}) {
  void name;
  void onSelectKind;
  void onTemplates;

  const t = useTranslations("studio");
  const [active, setActive] = useState<DialogId | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const handle = normalizeHandle(defaultHandle);
  const language = inferPromptLanguage(topic ?? "");

  const closeIfOk = async (result: boolean | void) => {
    if (result !== false) setActive(null);
  };

  return (
    <div className="flex flex-col">
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-[22px]">
              {t("makeCarousel")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("makeCarouselSub")}</p>
          </div>
          <StudioCreateMenu
            onBlank={onBlank}
            onTemplates={() => setTemplatesOpen(true)}
            onCarousel={() => setActive("carousel")}
            onBrandKit={onBrandKit}
            onImportJson={onImportJson}
            label={t("viewOptions")}
            align="end"
          />
        </div>
        <div className="m-6 flex flex-row gap-4">
          <StudioCreateTile onClick={onBlank} />
          <StudioStartRow>
            {START_BLOCK_ORDER.map((id) => {
              const block = START_BLOCKS[id];
              return (
                <StudioStartTile
                  key={id}
                  title={block.title}
                  iconName={block.iconName}
                  onClick={() => setActive(id)}
                />
              );
            })}
          </StudioStartRow>
        </div>
        <StudioPrompt
          initialTopic={topic}
          initialType={initialType}
          onSubmit={onGenerate}
          busy={generating}
          error={generateError}
        />
      </section>

      <StudioTemplatesDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
      />

      <StudioTextDialog
        open={active === "text"}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
        busy={generating}
        error={generateError}
        onSubmit={async (value) => {
          await closeIfOk(await onTextGenerate(value));
        }}
      />

      <StudioPaletteDialog
        open={active === "palette"}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
        busy={generating}
        error={generateError}
        onSubmit={async (value) => {
          await closeIfOk(await onPaletteGenerate(value));
        }}
      />

      <StudioCarouselDialog
        open={active === "carousel"}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
        busy={generating}
        error={generateError}
        defaultHandle={handle}
        defaultLanguage={language}
        onSubmit={async (form) => {
          await closeIfOk(await onCarouselGenerate(form));
        }}
      />

      <StudioCodeBlockDialog
        open={active === "codeblock"}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
        busy={generating}
        error={generateError}
        onSubmit={async (code) => {
          await closeIfOk(await onCodeInsert(code));
        }}
      />

      <StudioListDialog
        open={active === "list"}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
        busy={generating}
        error={generateError}
        onSubmit={async (items) => {
          await closeIfOk(await onListInsert(items));
        }}
      />

      <StudioBrandDialog
        open={active === "brand"}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
        palettes={palettes}
        busy={generating}
        error={generateError}
        onApply={async (artifact) => {
          await closeIfOk(await onBrandApply(artifact));
        }}
      />
    </div>
  );
}
