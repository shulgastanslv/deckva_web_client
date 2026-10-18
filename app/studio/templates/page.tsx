"use client";

import { StudioTemplates } from "@/components/studio/studio-templates";
import { StudioShell } from "@/components/studio/studio-shell";
import { StudioPhoneGate } from "@/components/studio-phone-gate";

export default function StudioTemplatesPage() {
  return (
    <StudioPhoneGate>
      <StudioShell>
        <StudioTemplates />
      </StudioShell>
    </StudioPhoneGate>
  );
}
