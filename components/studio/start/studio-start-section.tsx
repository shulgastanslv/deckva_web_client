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

  return (
    <div className="flex flex-col">
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-[22px] font-semibold tracking-tight text-foreground">
              Let's create something new
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose a template or start from scratch.
            </p>
          </div>
          <StudioCreateMenu
            onBlank={onBlank}
            onTemplates={onTemplates}
            label="View options"
            align="end"
          />
        </div>
        <div className="flex flex-row gap-4 m-6">
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
        <StudioPrompt
          initialTopic={topic}
          onSubmit={onGenerate}
          busy={generating}
          error={generateError}
        />
      </section>
    </div>
  );
}