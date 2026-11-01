"use client";

import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import {
  StudioPrompt,
  type StudioPromptSubmit,
} from "@/components/studio/studio-prompt";

export function StudioStartSection({
  name,
  onBlank,
  onTemplates,
  onGenerate,
  generating,
  generateError,
}: {
  name: string | null;
  onBlank: () => void;
  onTemplates: () => void;
  onGenerate: (input: StudioPromptSubmit) => void | Promise<void>;
  generating?: boolean;
  generateError?: string | null;
}) {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-3">
        <h1
          className="min-w-0 text-[2.5rem] leading-[1.05] font-normal tracking-tight text-foreground sm:text-5xl"
          style={{
            fontFamily: "var(--font-studio-serif), ui-serif, Georgia, serif",
          }}
        >
          Your next post{name ? `, ${name}` : ""}
        </h1>
        <StudioCreateMenu
          onBlank={onBlank}
          onTemplates={onTemplates}
          label="Create"
          align="end"
        />
      </div>

      <StudioPrompt
        onSubmit={onGenerate}
        busy={generating}
        error={generateError}
      />
    </section>
  );
}
