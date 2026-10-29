"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  ChevronRight,
  LogOut,
  ArrowUp,
  Copy,
  Check,
  SlidersHorizontal,
  Share,
  Globe,
  Undo2,
  Redo2,
  Loader2,
  CloudOff,
  Focus,
  MessageSquareText,
  Shield,
  PlayIcon,
} from "lucide-react";
import { NotificationsMenu } from "@/components/notifications-menu";
import Link from "next/link";
import Logo from "@/components/logo";
import { useSession, signOut } from "next-auth/react";
import { AuthModal } from "@/components/auth";
import { HelpDialog } from "@/components/help-dialog";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { ProfileSettingsDialog } from "@/components/profile-settings-dialog";
import { PublishTemplateDialog } from "@/components/publish-template-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandsKbd } from "@/components/commands_kbd";
import { ShareModal } from "./share-modal";
import { ExportModal } from "./export-modal";
import { useCanvasManager } from "@/context/canvas-manager";
import { useSlidesController } from "@/context/canvas-manager";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useProject } from "@/hooks/use-project";
import {
  copyImageToClipboard,
  renderSlidesToImages,
} from "@/lib/export/carousel";

const accountItemClass =
  "cursor-pointer gap-2.5 rounded-none px-3.5 py-2.5 text-[14px] text-neutral-900 focus:bg-neutral-100 dark:text-foreground dark:focus:bg-muted";

interface HeaderProps {
  onPreview?: () => void;
  onPhonePreview?: () => void;
  onFocus?: () => void;
}

export function Header({ onPreview, onFocus }: HeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authVerifyToken, setAuthVerifyToken] = useState<string | null>(null);
  const [authResetToken, setAuthResetToken] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const { data: session, status } = useSession();
  const [showShare, setShowShare] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  const manager = useCanvasManager();
  const slidesController = useSlidesController();
  const slides = useCanvasStore((s) => s.slides);
  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const { persist, rename, isDirty, isSaving } = useProject();
  const [name, setName] = useState(projectTitle);

  useEffect(() => {
    setName(projectTitle);
  }, [projectTitle]);

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
    return () => window.removeEventListener("swicorebp:auth-link", onAuthLink);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleNameBlur = () => {
    const next = name.trim() || "Untitled Carousel";
    setName(next);
    if (next !== projectTitle) void rename(next);
  };

  const handleSave = async () => {
    if (status !== "authenticated") {
      setIsAuthModalOpen(true);
      return;
    }
    const res = await persist();
    if (!res.success) alert("Couldn't save");
  };

  const handleUndo = () => {
    void manager?.undo();
  };

  const handleRedo = () => {
    void manager?.redo();
  };

  const handleCopySlide = async () => {
    if (copying) return;
    setCopying(true);
    try {
      slidesController?.saveCurrent();
      const state = useCanvasStore.getState();
      const current = state.slides.find((s) => s.id === state.currentSlideId);
      if (!current) throw new Error("No active slide");

      const [rendered] = await renderSlidesToImages(
        [{ id: current.id, canvasJSON: current.canvasJSON }],
        state.canvasDimensions,
        { format: "png", multiplier: 1 },
      );

      await copyImageToClipboard(rendered.blob);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Couldn't copy");
    } finally {
      setCopying(false);
    }
  };

  const openPublish = () => {
    if (status !== "authenticated") {
      setIsAuthModalOpen(true);
      return;
    }
    setIsPublishOpen(true);
  };

  const userEmail = session?.user?.email ?? "";
  const userName = session?.user?.name ?? userEmail;
  const userInitial = userName ? userName[0].toUpperCase() : "?";
  const slideCount = slides.length || 1;

  return (
    <>
      <header className="h-13 w-full flex items-center justify-between px-4 bg-background/80 backdrop-blur-md border-b border-border/60 text-[13px] z-20 shrink-0 gap-4 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <Logo width={30} height={30} href="/studio" />
          <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="bg-muted/60 font-medium text-foreground text-[13px] px-2.5 py-1 rounded-full border border-transparent hover:border-border/50 focus:border-border/60 focus:bg-muted/40 focus:outline-none transition-colors w-28 sm:w-40 truncate"
            placeholder="Project name..."
          />
          {isDirty && (
            <span className="text-[13px] text-muted-foreground shrink-0 hidden sm:inline">
              <CloudOff className="w-4 h-4" />
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFeedbackOpen(true)}
            className="h-9 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/50 hidden sm:inline-flex"
            title="Send feedback"
          >
            <MessageSquareText className="w-4 h-3" />
          </Button>

        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center p-0.5 rounded-full">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/50 hidden sm:inline-flex"
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/50 hidden sm:inline-flex"
              onClick={handleRedo}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          <CommandsKbd />
          <div className="h-4 w-px bg-border/60 mx-0.5 hidden sm:block" />
          <Button
            variant="default"
            size="sm"
            onClick={onFocus}
            className="h-9 px-3 text-[13px] font-medium gap-1.5 rounded-full shadow-2xs hover:shadow-xs transition-all"
          >
            <Focus className="w-3 h-3 fill-current text-primary-foreground" />
            <span className="hidden sm:inline">Focus</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onPreview}
            className="h-9 px-3 text-[13px] font-medium gap-1.5 rounded-full transition-all"
          >
            <PlayIcon className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            onClick={() => setShowShare(true)}
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/50"
            title="Share"
          >
            <Share className="w-3.5 h-3.5" />
          </Button>
          <NotificationsMenu />
          <Button
            variant="secondary"
            size="sm"
            onClick={openPublish}
            className="h-9 px-3 text-[13px] font-medium gap-1.5 rounded-full shadow-2xs hover:shadow-xs transition-all"
            title="Publish as Template"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Publish</span>
          </Button>

          <div className="flex items-center h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full pl-2.5 pr-0.5 shadow-2xs transition-all gap-1">
            <button
              type="button"
              onClick={() => setShowExport(true)}
              className="flex items-center gap-1.5 text-[13px] font-medium hover:opacity-90 transition-opacity"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Export</span>
              <span className="text-[12px] font-normal text-primary-foreground/70">
                [{slideCount}] · PNG
              </span>
            </button>
            <button
              type="button"
              title="Copy current slide"
              onClick={() => void handleCopySlide()}
              disabled={copying}
              className="h-6 w-6 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground flex items-center justify-center transition-colors active:scale-95 disabled:opacity-60"
            >
              {copying ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
            <button
              type="button"
              title="Export settings"
              onClick={() => setShowExport(true)}
              className="h-6 w-6 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground flex items-center justify-center transition-colors active:scale-95"
            >
              <SlidersHorizontal className="w-3 h-3" />
            </button>
          </div>
              
          <div className="h-4 w-px bg-border/60 mx-0.5" />

          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full p-0 ring-1 ring-border/60 hover:bg-muted/40 hover:ring-border"
                  title="Account"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        session.user?.image ??
                        `https://api.dicebear.com/10.x/squircles/svg?seed=${session.user?.id}`
                      }
                      alt={userName}
                    />
                    <AvatarFallback className="bg-muted text-[13px] font-medium">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-[240px] overflow-hidden rounded-2xl border-0 bg-white p-0 dark:bg-background dark:ring-1 dark:ring-border"
              >
                <div className="flex items-center gap-2.5 px-3.5 py-3">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={
                        session.user?.image ??
                        `https://api.dicebear.com/10.x/squircles/svg?seed=${session.user?.id}`
                      }
                      alt={userName}
                    />
                    <AvatarFallback className="bg-muted text-[12px] font-semibold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-neutral-950 dark:text-foreground">
                    {userName}
                  </p>
                </div>

                <DropdownMenuSeparator className="mx-0 my-0 bg-neutral-200/80 dark:bg-border" />

                <div className="py-1">
                  <DropdownMenuItem
                    className={accountItemClass}
                    onClick={() => setIsProfileOpen(true)}
                  >
                    <User className="size-4 stroke-[1.75] text-neutral-800 dark:text-muted-foreground" />
                    Account
                  </DropdownMenuItem>
                 
                  <DropdownMenuItem
                    className={accountItemClass}
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="size-4 stroke-[1.75] text-neutral-800 dark:text-muted-foreground" />
                    Log out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
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
      <FeedbackDialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} />
      <ProfileSettingsDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
      <PublishTemplateDialog
        open={isPublishOpen}
        onOpenChange={setIsPublishOpen}
        onAuthRequired={() => setIsAuthModalOpen(true)}
      />
    </>
  );
}
