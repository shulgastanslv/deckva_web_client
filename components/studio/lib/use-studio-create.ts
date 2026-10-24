"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { stashStudioIntent } from "@/lib/studio/pending-intent";

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

  const openBlank = () => {
    if (!requireAuth()) return;
    stashStudioIntent({ type: "new" });
    router.push("/studio/editor");
  };

  const openTemplates = () => router.push("/studio/templates");

  const openGenerate = () => {
    if (!requireAuth()) return;
    setGenerateOpen(true);
  };

  const submitGenerate = (overrideTheme?: string) => {
    const fromArg =
      typeof overrideTheme === "string" ? overrideTheme.trim() : "";
    const trimmed = fromArg || theme.trim();
    if (!trimmed || submitting) return;
    if (!requireAuth()) return;
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
