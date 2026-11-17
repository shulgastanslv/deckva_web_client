"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

import { StudioHome } from "@/components/studio/studio-home";
import { StudioShell } from "@/components/studio/studio-shell";

/** Legacy /studio/upgrade route — billing removed, redirect home. */
export default function StudioUpgradeRoute() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/studio");
  }, [router]);

  return (
    <Suspense fallback={null}>
      <StudioShell>
        <StudioHome />
      </StudioShell>
    </Suspense>
  );
}
