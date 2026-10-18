"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { StudioHome } from "@/components/studio/studio-home";
import { StudioShell } from "@/components/studio/studio-shell";
import { StudioPhoneGate } from "@/components/studio-phone-gate";

function StudioHomeRedirects() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const project = searchParams.get("project");
    if (project) {
      router.replace(`/studio/editor?project=${encodeURIComponent(project)}`);
      return;
    }

    const verify = searchParams.get("verify");
    const reset = searchParams.get("reset");
    if (!verify && !reset) return;

    window.dispatchEvent(
      new CustomEvent("core:auth-link", {
        detail: { verify, reset },
      }),
    );
    const url = new URL(window.location.href);
    url.searchParams.delete("verify");
    url.searchParams.delete("reset");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [router, searchParams]);

  return null;
}

export default function StudioHomePage() {
  return (
    <StudioPhoneGate>
      <StudioShell>
        <Suspense fallback={null}>
          <StudioHomeRedirects />
        </Suspense>
        <StudioHome />
      </StudioShell>
    </StudioPhoneGate>
  );
}
