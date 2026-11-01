"use client";

import { Suspense } from "react";

import { StudioProjects } from "@/components/studio/studio-projects";
import { StudioShell } from "@/components/studio/studio-shell";

export default function StudioProjectsPage() {
  return (
    <StudioShell>
      <Suspense fallback={null}>
        <StudioProjects />
      </Suspense>
    </StudioShell>
  );
}
