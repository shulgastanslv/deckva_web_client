"use client";

import { StudioBrandKit } from "@/components/studio/studio-brand-kit";
import { StudioShell } from "@/components/studio/studio-shell";
import { StudioPhoneGate } from "@/components/studio-phone-gate";

export default function StudioBrandKitPage() {
  return (
    <StudioPhoneGate>
      <StudioShell>
        <StudioBrandKit />
      </StudioShell>
    </StudioPhoneGate>
  );
}
