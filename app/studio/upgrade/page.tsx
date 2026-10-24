"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { StudioHome } from "@/components/studio/studio-home";
import { StudioShell } from "@/components/studio/studio-shell";
import { StudioPhoneGate } from "@/components/studio-phone-gate";

/** Deep-link: open studio and fire the upgrade dialog. */
export default function StudioUpgradeRoute() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/studio");
    const t = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("studio:open-upgrade"));
    }, 80);
    return () => window.clearTimeout(t);
  }, [router]);

  return (
    <StudioPhoneGate>
      <StudioShell>
        <StudioHome />
      </StudioShell>
    </StudioPhoneGate>
  );
}
