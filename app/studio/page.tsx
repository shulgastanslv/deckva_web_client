"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

import { Header } from "@/components/header";
import { LeftSidebar, RAIL_SHORTCUTS } from "@/components/canvas/left-sidebar";
import { CanvasToolbar } from "@/components/canvas/canvas-toolbar";
import { ElementsToolbar } from "@/components/canvas/elements-toolbar";
import { CanvasView } from "@/components/canvas/canvas-view";
import { ReferencePanel } from "@/components/canvas/reference-panel";
import { AutoFlowPrompt } from "@/components/canvas/auto-flow-prompt";
import { GenerateOverlay } from "@/components/canvas/generate-overlay";
import { RightSidebar } from "@/components/canvas/right-sidebar";
import { PreviewModal } from "@/components/canvas/preview-modal";
import type { NavId } from "@/components/canvas/left-sidebar";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useProject } from "@/hooks/use-project";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import { StudioPhoneGate } from "@/components/studio-phone-gate";

const SlideNavigator = dynamic(
  () => import("@/components/canvas/slide-navigator").then((mod) => mod.SlideNavigator),
  { ssr: false },
);

function ProjectBootstrap() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const { loadProject, persist } = useProject();
  const slidesController = useSlidesController();
  useAutoSave(persist);

  // Hydrate once from the URL only if nothing is selected yet.
  // Do not re-apply searchParams when currentProjectId changes: sidebar uses
  // history.replaceState, so Next.js params stay stale and would bounce back.
  useEffect(() => {
    if (!slidesController) return;

    const storeId = useCanvasStore.getState().currentProjectId;
    if (storeId) return;
    if (!projectId) return;

    void loadProject(projectId);
  }, [projectId, slidesController, loadProject]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void persist();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [persist]);

  return null;
}

function AuthLinkHandler() {
  const searchParams = useSearchParams();
  const verify = searchParams.get("verify");
  const reset = searchParams.get("reset");

  useEffect(() => {
    if (!verify && !reset) return;
    window.dispatchEvent(
      new CustomEvent("core:auth-link", {
        detail: { verify, reset },
      }),
    );
    const url = new URL(window.location.href);
    url.searchParams.delete("verify");
    url.searchParams.delete("reset");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(null, "", next);
  }, [verify, reset]);

  return null;
}

export default function CarouselStudio() {
  const [activeNav, setActiveNav] = useState<NavId>("templates");
  const [showDotGrid, setShowDotGrid] = useState(true);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSlideId, setPreviewSlideId] = useState<number>(0);
  const [focusMode, setFocusMode] = useState(false);
  const [focusInspector, setFocusInspector] = useState(false);
  const manager = useCanvasManager();

  useEffect(() => {
    if (!focusMode || !manager) return;

    setFocusInspector(manager.getActiveObject() != null);
    const openForClick = (event: { target?: unknown }) => {
      if (useCanvasStore.getState().handActive) return;
      if (!event.target) setFocusInspector(false);
    };
    manager.canvas.on("mouse:down", openForClick);
    const unsubscribe = manager.on("selection", (object) => {
      if (object) setFocusInspector(true);
    });

    return () => {
      manager.canvas.off("mouse:down", openForClick);
      unsubscribe();
    };
  }, [focusMode, manager]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable);
      const editing = manager?.getActiveObject() as { isEditing?: boolean } | null;
      if (typing || editing?.isEditing) return;
      if (document.querySelector("[role='dialog'][data-state='open'], [data-slot='select-content'], [data-slot='dropdown-menu-content']")) {
        return;
      }

      if (focusMode && event.key === "Escape" && !event.defaultPrevented && !manager?.crop.active) {
        event.preventDefault();
        setFocusMode(false);
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.repeat) return;
      if (!/^[1-9]$/.test(event.key)) return;
      const next = RAIL_SHORTCUTS[Number(event.key) - 1];
      if (!next) return;
      event.preventDefault();
      setActiveNav(next);
      setIsLeftCollapsed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode, manager]);

  return (
    <StudioPhoneGate>
    <div className="flex flex-col h-screen w-full bg-background text-foreground font-sans overflow-hidden select-none">
      {!focusMode && (
        <Header
          onPreview={() => {
            const storeCurrentId = useCanvasStore.getState().currentSlideId;
            setPreviewSlideId(storeCurrentId);
            setShowPreviewModal(true);
          }}
          onFocus={() => setFocusMode(true)}
        />
      )}

      <Suspense fallback={null}>
        <ProjectBootstrap />
        <AuthLinkHandler />
      </Suspense>

      <div className="flex flex-1 min-h-0">
        {!focusMode && (
          <LeftSidebar
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            isLeftCollapsed={isLeftCollapsed}
            setIsLeftCollapsed={setIsLeftCollapsed}
            showDotGrid={showDotGrid}
            setShowDotGrid={setShowDotGrid}
          />
        )}

        <main
          className="flex-1 flex flex-col bg-muted/50 overflow-hidden min-w-0 relative"
          style={
            showDotGrid
              ? {
                  backgroundImage:
                    "radial-gradient(var(--border) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }
              : {}
          }
        >
          {!focusMode && <CanvasToolbar />}

          <div className="flex flex-1 min-h-0 relative">
            <CanvasView />
            <GenerateOverlay />
            {focusMode && (
              <ElementsToolbar onExit={() => setFocusMode(false)} />
            )}
            {!focusMode && <ReferencePanel />}
            {!focusMode && <AutoFlowPrompt />}
            {focusMode && focusInspector && (
              <div className="absolute inset-y-0 right-0 z-20 shadow-xl">
                <RightSidebar
                  isRightCollapsed={false}
                  setIsRightCollapsed={() => setFocusInspector(false)}
                />
              </div>
            )}
          </div>
          {!focusMode && <SlideNavigator />}
        </main>

        {!focusMode && (
          <RightSidebar
            isRightCollapsed={isRightCollapsed}
            setIsRightCollapsed={setIsRightCollapsed}
          />
        )}
      </div>

      <PreviewModal
        open={showPreviewModal}
        initialSlideId={previewSlideId}
        onClose={() => setShowPreviewModal(false)}
      />
    </div>
    </StudioPhoneGate>
  );
}
