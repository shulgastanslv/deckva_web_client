"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { StudioHome } from "@/components/studio/studio-home";
import { StudioShell } from "@/components/studio/studio-shell";

function StudioHomeRedirects() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const project = searchParams.get("project");
    if (project) {
      router.replace(`/studio/editor?project=${encodeURIComponent(project)}`);
    }
  }, [router, searchParams]);

  return null;
}

export default function StudioHomePage() {
  return (
    <StudioShell>
      <Suspense fallback={null}>
        <StudioHomeRedirects />
        <StudioHome />
      </Suspense>
    </StudioShell>
  );
}
