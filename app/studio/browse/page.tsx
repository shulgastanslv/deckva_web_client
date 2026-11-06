"use client";

import { Suspense } from "react";

import { StudioBrowse } from "@/components/studio/studio-browse";
import { StudioShell } from "@/components/studio/studio-shell";

export default function StudioBrowsePage() {
  return (
    <StudioShell>
      <Suspense fallback={null}>
        <StudioBrowse />
      </Suspense>
    </StudioShell>
  );
}
