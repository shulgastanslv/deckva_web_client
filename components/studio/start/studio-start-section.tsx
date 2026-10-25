"use client";

import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import { StudioStartRow } from "@/components/studio/start/studio-start-row";
import {
  StudioCreateTile,
  StudioStartTile,
} from "@/components/studio/start/studio-start-tile";

export function StudioStartSection({
  onBlank,
  onTemplates,
}: {
  onBlank: () => void;
  onTemplates: () => void;
}) {
  return (
    <section>
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
          Start something new
        </h2>
        <StudioCreateMenu
          onBlank={onBlank}
          onTemplates={onTemplates}
          label="Create"
          align="end"
        />
      </div>

      <StudioStartRow>
        <StudioCreateTile onClick={onBlank} />
        <StudioStartTile
          title="From template"
          iconName="carousel"
          onClick={onTemplates}
        />
      </StudioStartRow>
    </section>
  );
}
