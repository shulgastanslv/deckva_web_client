"use client";

import { StudioTemplates } from "@/components/studio/studio-templates";
import { StudioShell } from "@/components/studio/studio-shell";

export default function StudioTemplatesPage() {
  return (
    <StudioShell>
      <StudioTemplates />
    </StudioShell>
  );
}
