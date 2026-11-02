"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import {
  StudioCreateTile,
  StudioStartTile,
} from "@/components/studio/start/studio-start-tile";
import { StudioStartRow } from "@/components/studio/start/studio-start-row";
import {
  StudioPrompt,
  type StudioPromptSubmit,
} from "@/components/studio/studio-prompt";
import { StudioSectionHeader } from "@/components/studio/ui/studio-section-header";
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
  name,
  topic,
  onBlank,
  onTemplates,
  onGenerate,
  generating,
  generateError,
}: {
  name: string | null;
  topic?: string;
  onBlank: () => void;
  onTemplates: () => void;
  onGenerate: (input: StudioPromptSubmit) => void | Promise<void>;
  generating?: boolean;
  generateError?: string | null;
}) {
  const [showStarts, setShowStarts] = useState(true);

  return (
    <section>
      <div className="mb-8 flex items-end justify-between gap-3">
        <h1 className="min-w-0 text-xl font-bold tracking-tight text-foreground">
          {name ? `Start something new, ${name}` : "Welcome"}
        </h1>
        <StudioCreateMenu
          onBlank={onBlank}
          onTemplates={onTemplates}
          label="Create"
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
