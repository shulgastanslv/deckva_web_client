"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { createProject } from "@/actions/projects";
import {
  armTourForce,
  isTourDone,
  isTourForced,
  markTourDone,
  pathnameTourArea,
  readTourProjectId,
  readTourStepIndex,
  shouldForceTourFromQuery,
  stripPlayNowFromUrl,
  TOUR_STEPS,
  tourStepAt,
  writeTourProjectId,
  writeTourStepIndex,
  type TourStepDef,
  type TourStepId,
} from "@/lib/studio/tour";

async function ensureEditorProject(): Promise<string | null> {
  const cached = readTourProjectId();
  if (cached) return cached;

  const created = await createProject({
    title: "Tour",
    aspectRatio: "4:5",
    slidesCount: 3,
  });
  if (created.success === false) return null;
  writeTourProjectId(created.projectId);
  return created.projectId;
}

export function useStudioTour() {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);

  const step: TourStepDef | null = active ? tourStepAt(stepIndex) : null;
  const stepId: TourStepId | null = step?.id ?? null;
  const isLast = stepIndex >= TOUR_STEPS.length - 1;

  const finish = useCallback(() => {
    markTourDone();
    setActive(false);
    setStepIndex(0);
    setBusy(false);
  }, []);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  const goToIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, TOUR_STEPS.length - 1));
    writeTourStepIndex(clamped);
    setStepIndex(clamped);
  }, []);

  const next = useCallback(async () => {
    if (busy) return;
    const current = tourStepAt(stepIndex);
    if (!current) {
      finish();
      return;
    }

    if ("action" in current && current.action === "openEditor") {
      setBusy(true);
      try {
        const area = pathnameTourArea(pathname);
        if (area === "editor") {
          goToIndex(stepIndex + 1);
          return;
        }
        const projectId = await ensureEditorProject();
        if (!projectId) {
          finish();
          return;
        }
        // Keep force + step so tour resumes after navigation.
        armTourForce();
        writeTourStepIndex(stepIndex + 1);
        router.push(`/studio/editor?project=${encodeURIComponent(projectId)}`);
        setStepIndex(stepIndex + 1);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (isLast) {
      finish();
      return;
    }
    goToIndex(stepIndex + 1);
  }, [busy, finish, goToIndex, isLast, pathname, router, stepIndex]);

  useEffect(() => {
    if (status !== "authenticated") {
      setActive(false);
      return;
    }
    if (!pathname?.startsWith("/studio")) return;

    const fromQuery = shouldForceTourFromQuery(searchParams);
    if (fromQuery) {
      armTourForce();
      stripPlayNowFromUrl();
      // /studio/editor?playNow=1 jumps straight into editor steps.
      const area = pathnameTourArea(pathname);
      const start =
        area === "editor"
          ? TOUR_STEPS.findIndex((s) => s.area === "editor")
          : 0;
      writeTourStepIndex(start >= 0 ? start : 0);
    }

    const forced = isTourForced();
    if (!forced && isTourDone()) {
      setActive(false);
      return;
    }

    const area = pathnameTourArea(pathname);
    if (area === "other") {
      setActive(false);
      return;
    }

    // Persist step across navigations (and first-run) via sessionStorage.
    let index = readTourStepIndex();
    const def = tourStepAt(index);
    if (def && def.area !== area) {
      if (area === "editor") {
        const editorStart = TOUR_STEPS.findIndex((s) => s.area === "editor");
        index = editorStart >= 0 ? Math.max(index, editorStart) : index;
      } else if (area === "home" && def.area === "editor") {
        const bridge = TOUR_STEPS.findIndex((s) => s.id === "openEditor");
        index = bridge >= 0 ? Math.min(index, bridge) : index;
      }
    }

    writeTourStepIndex(index);
    setStepIndex(index);
    setActive(true);
  }, [status, pathname, searchParams]);

  return {
    active,
    step,
    stepId,
    stepIndex,
    stepCount: TOUR_STEPS.length,
    isLast,
    busy,
    next,
    skip,
  };
}
