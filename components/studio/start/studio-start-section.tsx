"use client";

import { ChevronDown } from "lucide-react";

import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import { StudioStartRow } from "@/components/studio/start/studio-start-row";
import {
  StudioCreateTile,
  StudioStartTile,
} from "@/components/studio/start/studio-start-tile";
import {
  START_CATEGORIES,
  STUDIO_START_PRESETS,
  type StartCategoryId,
} from "@/components/studio/start/studio-start-presets";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function StudioStartSection({
  category,
  onCategoryChange,
  onBlank,
  onGenerate,
  onTemplates,
  onPreset,
}: {
  category: StartCategoryId;
  onCategoryChange: (id: StartCategoryId) => void;
  onBlank: () => void;
  onGenerate: () => void;
  onTemplates: () => void;
  onPreset: (theme: string) => void;
}) {
  const categoryMeta =
    START_CATEGORIES.find((c) => c.id === category) ?? START_CATEGORIES[0];

  const presets =
    category === "all"
      ? STUDIO_START_PRESETS
      : STUDIO_START_PRESETS.filter((p) => p.category === category);

  return (
    <section>
      <div className="mb-1 flex items-start justify-between gap-4">
        <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
          Start something new
        </h2>
        <StudioCreateMenu
          onBlank={onBlank}
          onGenerate={onGenerate}
          onTemplates={onTemplates}
          label="Create"
          align="end"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="mb-4 h-8 gap-1 rounded-full px-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            {category === "all"
              ? "Carousels for all topics"
              : `Carousels for ${categoryMeta.label.toLowerCase()}`}
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-[180px] rounded-2xl border-0 bg-muted p-1.5 shadow-none"
        >
          {START_CATEGORIES.map((cat) => (
            <DropdownMenuItem
              key={cat.id}
              className="cursor-pointer rounded-xl text-[13px]"
              onClick={() => onCategoryChange(cat.id)}
            >
              {cat.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <StudioStartRow>
        <StudioCreateTile onClick={onBlank} />
        {presets.map((preset) => (
          <StudioStartTile
            key={preset.id}
            title={preset.title}
            iconName={preset.icon}
            onClick={() => onPreset(preset.theme)}
          />
        ))}
      </StudioStartRow>
    </section>
  );
}
