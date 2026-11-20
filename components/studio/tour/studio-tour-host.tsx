"use client";

import { Suspense } from "react";

import { StudioTour } from "@/components/studio/tour/studio-tour";

/** Mount once in studio layout so the tour spans home + editor. */
export function StudioTourHost() {
  return (
    <Suspense fallback={null}>
      <StudioTour />
    </Suspense>
  );
}
