"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

import { Header } from "@/components/header";
import { LeftSidebar, RAIL_SHORTCUTS } from "@/components/canvas/left-sidebar";
import { CanvasToolbar } from "@/components/canvas/canvas-toolbar";
import { CanvasChromeRestore } from "@/components/canvas/canvas-chrome-restore";
import { ElementsToolbar } from "@/components/canvas/elements-toolbar";
import { CanvasView } from "@/components/canvas/canvas-view";
import { SelectionToolbar } from "@/components/canvas/selection-toolbar";
import { AutoFlowPrompt } from "@/components/canvas/auto-flow-prompt";
import { RightSidebar } from "@/components/canvas/right-sidebar";
import { PreviewModal } from "@/components/canvas/preview-modal";
import { EditorReviewPanel } from "@/components/canvas/editor-review-panel";
import type { NavId } from "@/components/canvas/left-sidebar";
import { EditorPhoneDock } from "@/components/canvas/editor-phone-dock";
import { StudioIntentBootstrap } from "@/components/studio/studio-intent-bootstrap";
import { peekStudioIntent } from "@/lib/studio/pending-intent";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useProject } from "@/hooks/use-project";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import { cn } from "@/lib/utils";
import { MessageSquareText } from "lucide-react";

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

  useEffect(() => {
    if (!slidesController) return;
    if (!projectId) return;

    const store = useCanvasStore.getState();
    if (store.currentProjectId || store.isGeneratingCarousel) return;

    // Generate intent owns the first load — keep the canvas fallback for AI.
    const intent = peekStudioIntent();
    if (intent?.type === "generate" && intent.projectId === projectId) {
      return;
    }

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

export default function CarouselEditor() {
  const [activeNav, setActiveNav] = useState<NavId>("elements");
  const [showDotGrid, setShowDotGrid] = useState(true);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSlideId, setPreviewSlideId] = useState<number>(0);
  const [focusMode, setFocusMode] = useState(false);
  /** Hide only canvas toolbar + slide navigator (sidebars stay). */
  const [canvasChrome, setCanvasChrome] = useState(true);
  const [phoneSheet, setPhoneSheet] = useState<"library" | "style" | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const manager = useCanvasManager();
  const postCaption = useCanvasStore((s) => s.postCaption);
  const isGeneratingCarousel = useCanvasStore((s) => s.isGeneratingCarousel);

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

      if (event.key === "Escape" && !event.defaultPrevented) {
        if (phoneSheet) {
          event.preventDefault();
          setPhoneSheet(null);
          return;
        }
        if (manager?.crop.active) return;
        const store = useCanvasStore.getState();
        if (store.eraserActive) {
          event.preventDefault();
          store.setEraserActive(false);
          return;
        }
        if (focusMode) {
          event.preventDefault();
          setFocusMode(false);
        }
        return;
      }

      // Toggle canvas toolbar + slide navigator (not full focus mode).
      if (event.key === "\\" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        if (focusMode) return;
        setCanvasChrome((open) => !open);
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.repeat) return;
      if (!/^[1-9]$/.test(event.key)) return;
      const next = RAIL_SHORTCUTS[Number(event.key) - 1];
      if (!next) return;
      event.preventDefault();
      setActiveNav(next);
      setIsLeftCollapsed(false);
      if (window.matchMedia("(max-width: 767px)").matches) {
        setPhoneSheet("library");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode, manager, phoneSheet]);

  const sheetFrame =
    "max-md:fixed max-md:inset-x-0 max-md:z-40 max-md:overflow-hidden max-md:rounded-t-3xl max-md:bg-background max-md:bottom-[calc(4.75rem+env(safe-area-inset-bottom))] max-md:h-[min(72dvh,calc(100dvh-8.5rem))] md:static md:flex md:h-full md:shrink-0";

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background font-sans text-foreground select-none">
      {!focusMode && (
        <Header
          onPreview={() => {
            const storeCurrentId = useCanvasStore.getState().currentSlideId;
            setPreviewSlideId(storeCurrentId);
            setShowPreviewModal(true);
          }}
          onReview={() => setReviewOpen((open) => !open)}
          onFocus={() => {
            setPhoneSheet(null);
            setFocusMode(true);
          }}
        />
      )}

      <Suspense fallback={null}>
        <StudioIntentBootstrap />
        <ProjectBootstrap />
        <AuthLinkHandler />
      </Suspense>

      <div className="flex min-h-0 flex-1">
        {!focusMode && (
          <div
            className={cn(
              sheetFrame,
              phoneSheet === "library" ? "max-md:flex" : "max-md:hidden",
            )}
          >
            <LeftSidebar
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              isLeftCollapsed={isLeftCollapsed}
              setIsLeftCollapsed={setIsLeftCollapsed}
              showDotGrid={showDotGrid}
              setShowDotGrid={setShowDotGrid}
            />
          </div>
        )}

        <main
          className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/20"
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
          {!focusMode && canvasChrome && (
            <CanvasToolbar onHideChrome={() => setCanvasChrome(false)} />
          )}

          <div className="relative flex min-h-0 flex-1">
            <CanvasView />
            {focusMode && <SelectionToolbar />}
            {focusMode && (
              <ElementsToolbar onExit={() => setFocusMode(false)} />
            )}
            {!focusMode && !canvasChrome && (
              <CanvasChromeRestore onShow={() => setCanvasChrome(true)} />
            )}
            {!focusMode && <AutoFlowPrompt />}
            {!focusMode && !isGeneratingCarousel && !postCaption.trim() ? (
              <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-4">
                <button
                  type="button"
                  onClick={() => setReviewOpen(true)}
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-background/95 px-3.5 py-1.5 text-[12px] font-medium text-foreground ring-1 ring-border/60 backdrop-blur"
                >
                  <MessageSquareText className="size-3.5 opacity-70" />
                  Generate post caption
                </button>
              </div>
            ) : null}
            {!focusMode && phoneSheet ? (
              <button
                type="button"
                aria-label="Close panel"
                className="absolute inset-0 z-30 md:hidden"
                onClick={() => setPhoneSheet(null)}
              />
            ) : null}
          </div>
          {!focusMode && canvasChrome && <SlideNavigator />}
        </main>

        {!focusMode && reviewOpen ? (
          <EditorReviewPanel open={reviewOpen} onClose={() => setReviewOpen(false)} />
        ) : null}

        {!focusMode && (
          <div
            className={cn(
              sheetFrame,
              phoneSheet === "style" ? "max-md:flex" : "max-md:hidden",
            )}
          >
            <div className="relative h-full min-h-0 w-full">
              <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-[13px] text-muted-foreground md:hidden">
                Select an object on the slide to change its style.
              </p>
              <div className="relative z-10 flex h-full min-h-0 w-full">
                <RightSidebar
                  isRightCollapsed={isRightCollapsed}
                  setIsRightCollapsed={setIsRightCollapsed}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {!focusMode && (
        <EditorPhoneDock
          libraryOpen={phoneSheet === "library"}
          styleOpen={phoneSheet === "style"}
          onLibrary={() => {
            setIsLeftCollapsed(false);
            setPhoneSheet((current) => (current === "library" ? null : "library"));
          }}
          onStyle={() => {
            setIsRightCollapsed(false);
            setPhoneSheet((current) => (current === "style" ? null : "style"));
          }}
        />
      )}

      <PreviewModal
        open={showPreviewModal}
        initialSlideId={previewSlideId}
        onClose={() => setShowPreviewModal(false)}
      />
    </div>
  );
}
