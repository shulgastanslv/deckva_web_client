"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  Share,
  Globe,
  Undo2,
  Redo2,
  Focus,
  Play,
} from "lucide-react";
import Logo from "@/components/logo/logo";
import { useSession } from "next-auth/react";
import { AuthModal } from "@/components/auth";
import { HelpDialog } from "@/components/help-dialog";
import { PublishCommunityDialog } from "@/components/publish-community-dialog";
import { StudioUserNav } from "@/components/studio/studio-user-nav";
import { CommandsKbd } from "@/components/commands_kbd";
import { ShareModal } from "./share-modal";
import { ExportModal } from "./export-modal";
import { ProjectFileMenu } from "@/components/canvas/project-file-menu";
import { RatioSelect } from "@/components/canvas/ratio-select";
import { SaveStatusMenu } from "@/components/canvas/save-status-menu";
import { useCanvasManager } from "@/context/canvas-manager";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useProject } from "@/hooks/use-project";
import { fitCanvasJSON } from "@/lib/canvas/fit-frame";
import { CANVAS_RATIOS, type RatioKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const centerBtn =
  "h-9 gap-1.5 rounded-full border-none px-3 text-[13px]";

const sideBtn =
  "h-9 gap-1.5 rounded-full border-none px-3.5 text-[13px] font-medium shadow-none";

interface HeaderProps {
  onPreview?: () => void;
  onPhonePreview?: () => void;
  onFocus?: () => void;
  onReview?: () => void;
}

export function Header({ onPreview, onFocus }: HeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authVerifyToken, setAuthVerifyToken] = useState<string | null>(null);
  const [authResetToken, setAuthResetToken] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const { status } = useSession();
  const [showShare, setShowShare] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const manager = useCanvasManager();
  const slides = useCanvasStore((s) => s.slides);
  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const currentRatio = useCanvasStore((s) => s.currentRatio);
  const setCurrentRatio = useCanvasStore((s) => s.setCurrentRatio);
  const { rename } = useProject();
  const [name, setName] = useState(projectTitle);
  const signedIn = status === "authenticated";

  useEffect(() => {
    setName(projectTitle);
  }, [projectTitle]);

  const handleRatioChange = (ratio: RatioKey) => {
    const to = CANVAS_RATIOS[ratio];
    if (!to) return;
    const state = useCanvasStore.getState();
    const from = state.canvasDimensions;
    if (state.currentRatio === ratio) return;

    if (manager && (from.width !== to.width || from.height !== to.height)) {
      for (const slide of state.slides) {
        if (slide.id === state.currentSlideId) continue;
        state.updateSlideJSONById(slide.id, fitCanvasJSON(slide.canvasJSON, from, to));
      }
      manager.fitToFrame(from, to);
    }
    setCurrentRatio(ratio);
  };

  useEffect(() => {
    const onAuthLink = (event: Event) => {
      const detail = (
        event as CustomEvent<{ verify?: string | null; reset?: string | null }>
      ).detail;
      if (detail?.verify) setAuthVerifyToken(detail.verify);
      if (detail?.reset) setAuthResetToken(detail.reset);
      if (detail?.verify || detail?.reset) setIsAuthModalOpen(true);
    };
    window.addEventListener("core:auth-link", onAuthLink);
    return () => window.removeEventListener("core:auth-link", onAuthLink);
  }, []);

  const openPublish = () => {
    if (status !== "authenticated") {
      setIsAuthModalOpen(true);
      return;
    }
    setIsPublishOpen(true);
  };

  const commitName = () => {
    const next = name.trim() || "Untitled Carousel";
    setName(next);
    if (next !== projectTitle) void rename(next);
  };

  const slideCount = slides.length || 1;

  return (
    <>
      <header className="z-20 grid h-16 w-full shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-b border-border/50 bg-background px-4 select-none">
        {/* Project */}
        <div className="flex min-w-0 items-center gap-2">
          <Logo width={32} height={32} href="/studio" />



          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="h-10 min-w-0 max-w-[11rem] flex-1 truncate rounded-full border-none bg-muted/40 px-3.5 text-[13px] font-medium text-foreground shadow-none outline-none transition-colors hover:bg-muted/60 focus:bg-muted/50 sm:max-w-[15rem]"
            placeholder="Project name"
            aria-label="Project name"
          />

          <ProjectFileMenu
            onExport={() => setShowExport(true)}
            onShare={() => setShowShare(true)}
            onHelp={() => setIsHelpOpen(true)}
          />
          <RatioSelect
            label="Resize"
            currentRatio={currentRatio}
            onRatioChange={(ratio) => handleRatioChange(ratio as RatioKey)}
          />
          <SaveStatusMenu />
        </div>

        {/* Edit tools — center */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className={centerBtn}
            onClick={() => void manager?.undo()}
            title="Undo"
          >
            <Undo2 className="size-4" />
            <span className="hidden lg:inline">Undo</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className={centerBtn}
            onClick={onPreview}
            title="Preview carousel"
          >
            <Play className="size-4" />
            <span className="hidden lg:inline">Preview</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={centerBtn}
            onClick={() => void manager?.redo()}
            title="Redo"
          >
            <Redo2 className="size-4" />
            <span className="hidden lg:inline">Redo</span>
          </Button>

          <div className="hidden xl:block">
            <CommandsKbd />
          </div>
        </div>

        {/* Share / export */}
        <div className="flex min-w-0 items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShare(true)}
            className={cn(
              sideBtn,
              "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <Share className="size-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={openPublish}
            className={cn(
              sideBtn,
              "hidden text-muted-foreground hover:bg-muted/60 hover:text-foreground md:inline-flex",
            )}
            title="Publish to community"
          >
            <Globe className="size-4" />
            <span className="hidden lg:inline">Community</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setShowExport(true)}
            className={cn(
              sideBtn,
              "bg-foreground text-background hover:bg-foreground/90",
            )}
          >
            <ArrowUp className="size-4" />
            Export / {slideCount} PNGs / ZIP
          </Button>

          {signedIn ? (
            <StudioUserNav onCommunity={openPublish} />
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className={cn(sideBtn, "bg-muted/40 hover:bg-muted/60")}
              onClick={() => setIsAuthModalOpen(true)}
            >
              Sign in
            </Button>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        verifyToken={authVerifyToken}
        resetToken={authResetToken}
        onOpenChange={(open) => {
          setIsAuthModalOpen(open);
          if (!open) {
            setAuthVerifyToken(null);
            setAuthResetToken(null);
          }
        }}
      />
      <ShareModal
        open={showShare}
        onOpenChange={setShowShare}
        onNeedAuth={() => {
          setShowShare(false);
          setIsAuthModalOpen(true);
        }}
      />
      <ExportModal
        open={showExport}
        onOpenChange={setShowExport}
        onNeedAuth={() => {
          setShowExport(false);
          setIsAuthModalOpen(true);
        }}
      />
      <HelpDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
      <PublishCommunityDialog
        open={isPublishOpen}
        onOpenChange={setIsPublishOpen}
        onAuthRequired={() => setIsAuthModalOpen(true)}
      />
    </>
  );
}
