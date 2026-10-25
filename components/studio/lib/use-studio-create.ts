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
  const [generateOpen, setGenerateOpen] = useState(false);
  const [theme, setTheme] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const openGenerate = async () => {
    if (!requireAuth()) return;
    if (!(await requireCarouselSlot())) return;
    setGenerateOpen(true);
  };

  const submitGenerate = async (overrideTheme?: string) => {
    const fromArg =
      typeof overrideTheme === "string" ? overrideTheme.trim() : "";
    const trimmed = fromArg || theme.trim();
    if (!trimmed || submitting) return;
    if (!requireAuth()) return;
    if (!(await requireCarouselSlot())) return;
    setTheme(trimmed);
    setSubmitting(true);
    stashStudioIntent({ type: "generate", theme: trimmed, slides: 5 });
    router.push("/studio/editor");
  };

  const closeGenerate = () => {
    setGenerateOpen(false);
    setTheme("");
    setSubmitting(false);
  };

  return {
    authNeeded,
    setAuthNeeded,
    generateOpen,
    setGenerateOpen,
    theme,
    setTheme,
    submitting,
    openBlank,
    openTemplates,
    openGenerate,
    submitGenerate,
    closeGenerate,
  };
}
