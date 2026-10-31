"use client";

import { useEffect, useRef } from "react";

import { useCanvasStore } from "@/store/useCanvasStore";

const STORAGE_KEY = "swibp.autosave";
const QUIET_MS = 1600;
const RETRY_MS = 8000;

type Persist = (options?: { thumbnail?: boolean }) => Promise<{ success: boolean; error?: string }>;

/** Debounced background save. It never captures a thumbnail and waits out slide loads. */
export function useAutoSave(persist: Persist) {
  const persistRef = useRef(persist);
  persistRef.current = persist;

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === "0") {
      useCanvasStore.getState().setAutoSave(false);
    }

    let timer = 0;
    let cancelled = false;

    const tick = () => {
      timer = 0;
      const state = useCanvasStore.getState();
      if (
        cancelled ||
        !state.autoSave ||
        !state.isDirty ||
        state.isLoadingProject ||
        state.isGeneratingCarousel
      ) {
        return;
      }
      void persistRef.current({ thumbnail: false }).then((res) => {
        if (cancelled || res.success || res.error === "Sign in to save") return;
        if (!useCanvasStore.getState().isDirty || !useCanvasStore.getState().autoSave) return;
        timer = window.setTimeout(tick, RETRY_MS);
      });
    };

    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, QUIET_MS);
    };

    const unsubscribe = useCanvasStore.subscribe((state, previous) => {
      if (
        !state.autoSave ||
        !state.isDirty ||
        state.isLoadingProject ||
        state.isGeneratingCarousel
      ) {
        return;
      }
      if (state.editRevision === previous.editRevision && state.autoSave === previous.autoSave) return;
      schedule();
    });

    const initial = useCanvasStore.getState();
    if (initial.autoSave && initial.isDirty) schedule();

    return () => {
      cancelled = true;
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);
}
