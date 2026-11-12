"use client";

import { Suspense } from "react";

import { StudioConnectors } from "@/components/studio/studio-connectors";
import { StudioShell } from "@/components/studio/studio-shell";

export default function StudioConnectorsPage() {
  return (
    <StudioShell>
      <Suspense fallback={null}>
        <StudioConnectors />
      </Suspense>
    </StudioShell>
  );
}
