"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

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

// Импортируем компоненты дропдауна из shadcn/ui
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLES = [
  "All roles",
  "Bloggers",
  "Marketers",
  "Designers",
  "Developers",
  "SEO specialists",
  "Copywriters",
  "Social media managers",
  "Video creators",
  "Podcasters",
  "Content strategists",
  "Freelancers",
  "Other",
] as const;

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
  const [selectedRole, setSelectedRole] = useState<string>("All roles");

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Create a new content
          </h2>
          <p className="text-sm text-muted-foreground">Write your content idea and we will generate it for you</p>
        </div>

        <StudioCreateMenu
          onBlank={onBlank}
          onTemplates={onTemplates}
          label="Create New"
          align="end"
        />
      </div>

      <StudioPrompt
        initialTopic={topic}
        onSubmit={onGenerate}
        busy={generating}
        error={generateError}
      />

      <div className="flex flex-row gap-4 mt-4">
        <StudioCreateTile onClick={onBlank} />
        <StudioStartRow>
          <StudioStartTile
            title="Generate Idea"
            iconName="idea"
            onClick={onBlank}
          />
          <StudioStartTile
            title="Image Upload"
            iconName="image"
            onClick={onBlank}
          />
          <StudioStartTile
            title="Layers"
            iconName="layers"
            onClick={onBlank}
          />
            <StudioStartTile
              title="List of Contents"
              iconName="list"
              onClick={onBlank}
            />
          <StudioStartTile
            title="Code Block"
            iconName="codeblock"
            onClick={onBlank}
          />
        </StudioStartRow>
      </div>
    </section>
  );
}