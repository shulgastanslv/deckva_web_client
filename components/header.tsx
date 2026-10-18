"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  HelpCircle,
  Send,
  ChevronRight,
  LogOut,
  ArrowUp,
  Copy,
  Check,
  SlidersHorizontal,
  Share,
  GalleryHorizontalEndIcon,
  Globe,
  BookOpen,
  Undo2,
  Redo2,
  Layers2,
  Loader2,
  Save,
  CloudOff,
  Focus,
  Shield,
  MessageSquareText,
  Moon,
  Sun,
  Sparkles,
  Home,
  ExternalLink,
  Mail,
  MoreHorizontal,
} from "lucide-react";
import { NotificationsMenu } from "@/components/notifications-menu";
import Link from "next/link";
import Logo from "@/components/logo";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { AuthModal } from "@/components/auth";
import { SocialSubscribeDialog } from "@/components/social-subscribe-dialog";
import { NewProjectModal } from "@/components/new-project-modal";
import { WhatsNewModal } from "@/components/whats-new-modal";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onPreview?: () => void;
  onPhonePreview?: () => void;
  onFocus?: () => void;
}

export function Header({ onPreview, onFocus }: HeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authVerifyToken, setAuthVerifyToken] = useState<string | null>(null);
  const [authResetToken, setAuthResetToken] = useState<string | null>(null);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const authOpenRef = useRef(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  const isDark = themeMounted && resolvedTheme === "dark";

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

  useEffect(() => {
    authOpenRef.current = isAuthModalOpen;
  }, [isAuthModalOpen]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (window.localStorage.getItem("core:social-prompt")) return;
    const timer = window.setTimeout(() => {
      if (authOpenRef.current) return;
      setIsSocialOpen(true);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [status]);

  const closeSocial = (open: boolean) => {
    setIsSocialOpen(open);
    if (!open) window.localStorage.setItem("core:social-prompt", "1");
  };

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsWhatsNewOpen(true)}
            className="h-9 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/50 hidden sm:inline-flex"
            title="What's new"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </Button>
          <div className="h-4 w-px bg-border/60 mx-0.5 hidden sm:block" />
          <Button
            variant="default"
            size="sm"
            onClick={onPreview}
            className="h-9 px-3 text-[13px] font-medium gap-1.5 rounded-full shadow-2xs hover:shadow-xs transition-all"
          >
            <Layers2 className="w-3 h-3 fill-current text-primary-foreground" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onFocus}
            className="h-9 px-3 text-[13px] font-medium gap-1.5 rounded-full shadow-none transition-all"
            title="Hide the panels and keep the canvas"
          >
            <Focus className="w-3 h-3" />
          </Button>
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
              <span className="text-ы font-normal text-primary-foreground/70">
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
                sideOffset={8}
                className="w-[252px] overflow-visible rounded-xl border-0 bg-background/95 p-0 text-popover-foreground shadow-xl ring-1 ring-foreground/10 backdrop-blur-md"
              >
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  <Avatar className="size-8 ring-1 ring-border/60">
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
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold leading-tight tracking-tight text-foreground">
                      {userName}
                    </p>
                    {userEmail && userEmail !== userName ? (
                      <p className="truncate text-[12px] leading-tight text-muted-foreground">
                        {userEmail}
                      </p>
                    ) : null}
                  </div>
                </div>

                <DropdownMenuSeparator className="mx-0 my-0" />

                <div className="p-1">
                  <DropdownMenuItem
                    className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]"
                    onClick={() => setIsProfileOpen(true)}
                  >
                    <User className="size-4 text-muted-foreground" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px] md:hidden"
                    onClick={openPublish}
                  >
                    <Globe className="size-4 text-muted-foreground" />
                    Publish
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="mx-0 my-0" />

                <div className="p-1">
                  <DropdownMenuItem asChild className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]">
                    <Link href="/docs">
                      <BookOpen className="size-4 text-muted-foreground" />
                      User guide
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]"
                    onClick={() => setIsWhatsNewOpen(true)}
                  >
                    <Sparkles className="size-4 text-muted-foreground" />
                    What&apos;s new
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]">
                    <Link href="/docs/contact">
                      <Mail className="size-4 text-muted-foreground" />
                      Contact us
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-default gap-2.5 rounded-lg px-2.5 py-2 text-[13px]">
                      <MoreHorizontal className="size-4 text-muted-foreground" />
                      More
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent
                      sideOffset={6}
                      className="z-[60] w-48 rounded-xl border-0 bg-background p-1 shadow-xl ring-1 ring-foreground/10"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]"
                        onClick={() => setIsNewProjectOpen(true)}
                      >
                        New project
                      </DropdownMenuItem>
                      {session.user?.role === "ADMIN" ? (
                        <DropdownMenuItem asChild className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]">
                          <Link href="/admin">
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem asChild className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]">
                        <Link href="/">
                          Home page
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]"
                        onClick={() => setIsSocialOpen(true)}
                      >
                        Social
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]">
                        <Link href="/docs/resources">
                          Resources
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </div>

                <DropdownMenuSeparator className="mx-0 my-0" />

                <div className="p-1">
                  <DropdownMenuItem
                    className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]"
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                  >
                    {isDark ? (
                      <Sun className="size-4 text-muted-foreground" />
                    ) : (
                      <Moon className="size-4 text-muted-foreground" />
                    )}
                    <span className="flex-1">{isDark ? "Light" : "Dark"}</span>
                    <span
                      className={cn(
                        "relative h-[18px] w-8 shrink-0 rounded-full transition-colors",
                        isDark ? "bg-foreground/20" : "bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 size-3.5 rounded-full bg-background shadow-sm ring-1 ring-foreground/10 transition-transform",
                          isDark ? "left-[14px]" : "left-0.5",
                        )}
                      />
                    </span>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="mx-0 my-0" />

                <div className="p-1">
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="size-4" />
                    Sign out
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
      <SocialSubscribeDialog open={isSocialOpen} onOpenChange={closeSocial} />
      <NewProjectModal
        open={isNewProjectOpen}
        onOpenChange={setIsNewProjectOpen}
      />
      <ShareModal
        open={showShare}
        onOpenChange={setShowShare}
        onNeedAuth={() => {
          setShowShare(false);
          setIsAuthModalOpen(true);
        }}
      />
      <ExportModal open={showExport} onOpenChange={setShowExport} />
      <WhatsNewModal open={isWhatsNewOpen} onOpenChange={setIsWhatsNewOpen} />
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
