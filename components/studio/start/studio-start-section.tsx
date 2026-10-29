"use client";

import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import { StudioStartRow } from "@/components/studio/start/studio-start-row";
import {
  StudioCreateTile,
  StudioStartTile,
} from "@/components/studio/start/studio-start-tile";
import type { StudioIconName } from "@/components/studio/ui/studio-icons";

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
        {START_ICONS.map(({ title, iconName }) => (
          <StudioStartTile
            key={iconName}
            title={title}
            iconName={iconName}
            onClick={iconName === "carousel" ? onTemplates : onBlank}
          />
        ))}
      </StudioStartRow>
    </section>
  );
}
