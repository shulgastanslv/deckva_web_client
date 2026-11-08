"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { PipelineNextSteps } from "@/components/studio/pipeline/pipeline-next-steps";
import { useStudioCreate } from "@/components/studio/lib/use-studio-create";
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { Button } from "@/components/ui/button";
import {
  aiPaletteToProjectPalette,
  parseAiPalette,
  type AiPalette,
} from "@/lib/ai/generate-palette";
import { loadBrandKit, writeBrandKit } from "@/lib/studio/brand-kit";
import { useArtifact } from "@/lib/studio/queries";
import { reportError } from "@/lib/report-error";
import { messages } from "@/lib/messages";

const SWATCH_KEYS: { key: keyof AiPalette; label: string }[] = [
  { key: "bg", label: "Background" },
  { key: "text", label: "Text" },
  { key: "muted", label: "Muted" },
  { key: "accent", label: "Accent" },
  { key: "accent_text", label: "Accent text" },
  { key: "grid", label: "Grid" },
  { key: "photo", label: "Photo" },
];

export function StudioPaletteArtifact({ artifactId }: { artifactId: string }) {
  const router = useRouter();
  const create = useStudioCreate();
  const query = useArtifact(artifactId, true);
  const artifact = query.data?.artifact;

  const palette = useMemo(() => {
    if (!artifact || artifact.kind !== "PALETTE") return null;
    try {
      return parseAiPalette(artifact.payload);
    } catch {
      return null;
    }
  }, [artifact]);

  if (query.isLoading) {
    return (
      <StudioContent>
        <StudioContentBody className="flex justify-center py-24">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </StudioContentBody>
      </StudioContent>
    );
  }

  if (!artifact || artifact.kind !== "PALETTE" || !palette) {
    return (
      <StudioContent>
        <StudioContentBody className="py-16">
          <p className="text-[15px] text-muted-foreground">Palette not found.</p>
          <Button
            type="button"
            variant="ghost"
            className="mt-3 rounded-full px-0"
            onClick={() => router.push("/studio")}
          >
            Back to studio
          </Button>
        </StudioContentBody>
      </StudioContent>
    );
  }

  const applyToBrandKit = () => {
    try {
      const current = loadBrandKit();
      writeBrandKit({
        ...current,
        palette: aiPaletteToProjectPalette(palette),
      });
    } catch (err) {
      reportError(err, messages.errors.generic);
    }
  };

  const seed = artifact.prompt || palette.name || artifact.title;

  return (
    <StudioContent>
      <StudioContentBody className="max-w-3xl pt-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {artifact.title || palette.name}
            </h1>
            {artifact.prompt ? (
              <p className="mt-1 text-[13px] text-muted-foreground">
                Prompt: {artifact.prompt}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={() => router.push("/studio/browse?tab=palettes")}
            >
              Browse
            </Button>
            <Button
              type="button"
              className="rounded-full"
              onClick={applyToBrandKit}
            >
              Apply to brand kit
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl">
          <div className="flex h-28 w-full">
            {SWATCH_KEYS.slice(0, 5).map(({ key }) => (
              <div
                key={key}
                className="h-full flex-1"
                style={{ backgroundColor: palette[key] }}
              />
            ))}
          </div>
        </div>

        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {SWATCH_KEYS.map(({ key, label }) => (
            <li
              key={key}
              className="flex items-center gap-3 rounded-2xl bg-muted/30 px-3 py-2.5"
            >
              <span
                className="size-9 shrink-0 rounded-xl"
                style={{ backgroundColor: palette[key] }}
              />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground">{label}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {palette[key]}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 space-y-3">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            These colors lock into the carousel. If this palette came from a
            caption, that text is carried forward automatically.
          </p>
          <PipelineNextSteps
            from="palette"
            onSelect={(kind) => {
              if (kind === "carousel") {
                void create.generateCarousel({
                  topic: seed,
                  palette,
                  parentArtifactId: artifact.id,
                });
                return;
              }
              if (kind === "text") {
                void create.generateText({
                  topic: seed,
                  parentArtifactId: artifact.id,
                });
              }
            }}
          />
          {create.generating ? (
            <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Starting carousel…
            </p>
          ) : null}
          {create.generateError ? (
            <p className="text-[13px] text-destructive">{create.generateError}</p>
          ) : null}
        </div>
      </StudioContentBody>
    </StudioContent>
  );
}
