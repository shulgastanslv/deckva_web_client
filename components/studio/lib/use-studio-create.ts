"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { getActiveOrganization } from "@/actions/organizations";
import { getUserProjects } from "@/actions/projects";
import { stashStudioIntent } from "@/lib/studio/pending-intent";
import { FREE_CAROUSEL_LIMIT } from "@/lib/studio/plans";

async function requireCarouselSlot(): Promise<boolean> {
  const [orgRes, projectsRes] = await Promise.all([
    getActiveOrganization(),
    getUserProjects(),
  ]);
  if (orgRes.success && orgRes.organization.isUpgrade) return true;
  const count = projectsRes.success ? projectsRes.projects.length : 0;
  if (count >= FREE_CAROUSEL_LIMIT) {
    window.dispatchEvent(new CustomEvent("studio:open-upgrade"));
    return false;
  }
  return true;
}

export function useStudioCreate() {
  const router = useRouter();
  const { status } = useSession();
  const [authNeeded, setAuthNeeded] = useState(false);

  const requireAuth = () => {
    if (status === "authenticated") return true;
    setAuthNeeded(true);
    return false;
  };

  const openBlank = async () => {
    if (!requireAuth()) return;
    if (!(await requireCarouselSlot())) return;
    stashStudioIntent({ type: "new" });
    router.push("/studio/editor");
  };

  const openTemplates = () => router.push("/studio/templates");

  return {
    authNeeded,
    setAuthNeeded,
    openBlank,
    openTemplates,
  };
}
