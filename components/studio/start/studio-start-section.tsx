"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import { StudioStartRow } from "@/components/studio/start/studio-start-row";
import {
  StudioCreateTile,
  StudioStartTile,
} from "@/components/studio/start/studio-start-tile";
import {
  StudioPrompt,
  type StudioPromptSubmit,
} from "@/components/studio/studio-prompt";
import type { StudioIconName } from "@/components/studio/ui/studio-icons";
import { cn } from "@/lib/utils";

const START_ICONS: { title: string; iconName: StudioIconName }[] = [
  { title: "Fire", iconName: "fire" },
  { title: "Layers", iconName: "layers" },
  { title: "List", iconName: "list" },
  { title: "Chart", iconName: "chart" },
  { title: "Trophy", iconName: "trophy" },
  { title: "Rocket", iconName: "rocket" },
  { title: "Image", iconName: "image" },
  { title: "Message", iconName: "message" },
  { title: "Check", iconName: "check" },
  { title: "Wand", iconName: "wand" },
  { title: "Carousel", iconName: "carousel" },
];

export function StudioStartSection({
  onBlank,
  onTemplates,
  onGenerate,
  generating,
  generateError,
}: {
  onBlank: () => void;
  onTemplates: () => void;
  onGenerate: (input: StudioPromptSubmit) => void | Promise<void>;
  generating?: boolean;
  generateError?: string | null;
}) {
  const [showStarts, setShowStarts] = useState(false);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
          Start something new
        </h2>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowStarts((open) => !open)}
            aria-expanded={showStarts}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
              showStarts && "bg-muted text-foreground",
            )}
          >
            Browse starts
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                showStarts && "rotate-180",
              )}
            />
          </button>
          <StudioCreateMenu
            onBlank={onBlank}
            onTemplates={onTemplates}
            label="Create"
            align="end"
          />
        </div>
      </div>

      <StudioPrompt
        onSubmit={onGenerate}
        busy={generating}
        error={generateError}
      />

      {showStarts ? (
        <div className="mt-4">
          <StudioStartRow>
            <StudioCreateTile onClick={onBlank} />
            {START_ICONS.map(({ title, iconName }) => (
              <StudioStartTile
                key={iconName}
                title={title}
                iconName={iconName}
                onClick={iconName === "carousel" ? onTemplates : onBlank}
              />
            ))}
          </StudioStartRow>
        </div>
      ) : null}
    </section>
  );
}
