"use client";

import { StudioProjects } from "@/components/studio/studio-projects";
import { StudioShell } from "@/components/studio/studio-shell";
import { StudioPhoneGate } from "@/components/studio-phone-gate";

export default function StudioProjectsPage() {
  return (
    <StudioPhoneGate>
      <StudioShell>
        <StudioProjects />
      </StudioShell>
    </StudioPhoneGate>
  );
}
