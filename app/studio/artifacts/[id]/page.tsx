"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { StudioPaletteArtifact } from "@/components/studio/artifacts/studio-palette-artifact";
import { StudioTextArtifact } from "@/components/studio/artifacts/studio-text-artifact";
import { StudioShell } from "@/components/studio/studio-shell";
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { useArtifact } from "@/lib/studio/queries";

function ArtifactPageInner() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const query = useArtifact(id, Boolean(id));
  const kind = query.data?.artifact.kind;

  if (query.isLoading) {
    return (
      <StudioContent>
        <StudioContentBody className="flex justify-center py-24">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </StudioContentBody>
      </StudioContent>
    );
  }

  if (kind === "PALETTE") {
    return <StudioPaletteArtifact artifactId={id} />;
  }

  return <StudioTextArtifact artifactId={id} />;
}

export default function StudioArtifactPage() {
  return (
    <StudioShell>
      <Suspense fallback={null}>
        <ArtifactPageInner />
      </Suspense>
    </StudioShell>
  );
}
