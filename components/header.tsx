"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  ChevronRight,
  LogOut,
  ArrowUp,
  Share,
  Globe,
  Undo2,
  Redo2,
  CloudOff,
  Focus,
  MessageCircle,
  Play,
} from "lucide-react";
import Logo from "@/components/logo/logo";
import { useQueryClient } from "@tanstack/react-query";
import { useSession, signOut } from "next-auth/react";
import { AuthModal } from "@/components/auth";
import { HelpDialog } from "@/components/help-dialog";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { ProfileSettingsDialog } from "@/components/profile-settings-dialog";
import { PublishCommunityDialog } from "@/components/publish-community-dialog";
import { StudioUpgradeDialog } from "@/components/studio/dialogs/studio-upgrade-dialog";
import { PlanDropdown } from "@/components/studio/header/plan-dropdown";
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
import { useCanvasStore } from "@/store/useCanvasStore";
import { useProject } from "@/hooks/use-project";
import {
  invalidateStudioProfile,
  useActiveOrganization,
  useMyProfile,
} from "@/lib/studio/queries";
import { cn } from "@/lib/utils";

const accountItemClass =
  "cursor-pointer gap-2.5 rounded-none px-3.5 py-2.5 text-[14px] text-neutral-900 focus:bg-neutral-100 dark:text-foreground dark:focus:bg-muted";

const iconBtn =
  "size-9 rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground";

const labelBtn =
  "h-9 gap-2 rounded-full px-3 text-[13px] font-medium";

interface HeaderProps {
  onPreview?: () => void;
  onPhonePreview?: () => void;
  onFocus?: () => void;
  onReview?: () => void;
}

export function Header({ onPreview, onFocus, onReview }: HeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authVerifyToken, setAuthVerifyToken] = useState<string | null>(null);
  const [authResetToken, setAuthResetToken] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [showShare, setShowShare] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const organization = useActiveOrganization(status === "authenticated");
  const isUpgrade = Boolean(organization.data?.organization?.isUpgrade);

  const manager = useCanvasManager();
  const slides = useCanvasStore((s) => s.slides);
  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const { rename, isDirty } = useProject();
  const [name, setName] = useState(projectTitle);
  const signedIn = status === "authenticated";
  const profile = useMyProfile(signedIn);

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
    return () => window.removeEventListener("core:auth-link", onAuthLink);
  }, []);

  useEffect(() => {
    const onProfileChanged = () => {
      void invalidateStudioProfile(queryClient);
    };
    window.addEventListener("studio:profile-changed", onProfileChanged);
    return () =>
      window.removeEventListener("studio:profile-changed", onProfileChanged);
  }, [queryClient]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleNameBlur = () => {
    const next = name.trim() || "Untitled Carousel";
    setName(next);
    if (next !== projectTitle) void rename(next);
  };

  const handleUndo = () => {
    void manager?.undo();
  };

  const handleRedo = () => {
    void manager?.redo();
  };

  const openPublish = () => {
    if (status !== "authenticated") {
      setIsAuthModalOpen(true);
      return;
    }
    setIsPublishOpen(true);
  };

  const userEmail = profile.data?.email ?? session?.user?.email ?? "";
  const userName =
    profile.data?.name?.trim() ||
    session?.user?.name?.trim() ||
    userEmail ||
    "Account";
  const userInitial = userName ? userName[0].toUpperCase() : "?";
  const avatarSrc =
    profile.data?.image ||
    session?.user?.image ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(userName)}`;
  const slideCount = slides.length || 1;

  return (
    <>
      <header className="z-20 grid h-16 w-full shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 bg-background/95 px-4 text-sm select-none backdrop-blur border-b border-border/50">        {/* Project */}
        <div className="flex min-w-0 items-center gap-2">
          <Logo width={32} height={32} href="/studio" />
          <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground/40 sm:block" />
          <div className="flex min-w-0 items-center gap-1.5">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="h-9 min-w-0 flex-1 truncate rounded-full border border-transparent bg-muted/50 px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/70 focus:border-border/50 focus:bg-background focus:outline-none sm:max-w-[15rem] sm:flex-none"
              placeholder="Project name..."
              aria-label="Project name"
            />
            {isDirty ? (
              <span
                className="hidden items-center gap-1 rounded-full px-2 text-[12px] text-muted-foreground sm:inline-flex"
                title="Unsaved changes"
              >
                <CloudOff className="size-3.5" />
                Unsaved
              </span>
            ) : null}
          </div>
        </div>

        {/* Edit + view */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-muted/40 p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={iconBtn}
              onClick={handleUndo}
              title="Undo"
            >
              <Undo2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={iconBtn}
              onClick={handleRedo}
              title="Redo"
            >
              <Redo2 className="size-4" />
            </Button>
            <div className="hidden md:block">
              <CommandsKbd />
            </div>
          </div>

          <div className="flex items-center rounded-full bg-muted/40 p-0.5">
            <Button
              variant="default"
              size="sm"
              onClick={onPreview}
              className={labelBtn}
              title="Preview carousel"
            >
              <Play className="size-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFocus}
              className={cn(labelBtn, "text-muted-foreground hover:bg-background hover:text-foreground")}
              title="Focus mode"
            >
              <Focus className="size-4" />
              <span className="hidden sm:inline">Focus</span>
            </Button>
          </div>
        </div>

        {/* Share + account */}
        <div className="flex min-w-0 items-center justify-end gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShare(true)}
              className={cn(labelBtn, "text-muted-foreground hover:bg-muted/60 hover:text-foreground")}
            >
              <Share className="size-4" />
              <span className="hidden lg:inline">Share</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openPublish}
              className={cn(labelBtn, "hidden text-muted-foreground hover:bg-muted/60 hover:text-foreground sm:inline-flex")}
              title="Publish or republish to community"
            >
              <Globe className="size-4" />
              <span className="hidden lg:inline">Community</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowExport(true)}
              className={cn(labelBtn, "bg-foreground text-background hover:bg-foreground/90")}
            >
              <ArrowUp className="size-4" />
              Export
              <span className="hidden font-normal opacity-60 sm:inline">
                · {slideCount} PNG
              </span>
            </Button>
          </div>

          <div className="mx-0.5 hidden h-5 w-px bg-border/60 sm:block" />

          <div className="flex items-center gap-2">
            {signedIn ? (
              <PlanDropdown
                isUpgrade={isUpgrade}
                openUpgrade={() => setUpgradeOpen(true)}
              />
            ) : null}
            {signedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-full p-0 ring-1 ring-border/60 hover:bg-muted/40 hover:ring-border"
                    title="Settings"
                  >
                    <Avatar className="size-9 ring-0">
                      <AvatarImage
                        src={avatarSrc}
                        alt={userName}
                        className="object-cover"
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
                  className="w-[240px] overflow-hidden rounded-2xl p-0"
                >
                  <div className="flex items-center gap-2.5 px-3.5 py-3">
                    <Avatar className="size-8">
                      <AvatarImage
                        src={avatarSrc}
                        alt={userName}
                        className="object-cover"
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
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={accountItemClass}
                      onClick={() => setIsFeedbackOpen(true)}
                    >
                      <MessageCircle className="size-4 stroke-[1.75] text-neutral-800 dark:text-muted-foreground" />
                      Feedback
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={cn(accountItemClass, "sm:hidden")}
                      onClick={openPublish}
                    >
                      <Globe className="size-4 stroke-[1.75] text-neutral-800 dark:text-muted-foreground" />
                      Community publish
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
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className={labelBtn}
                onClick={() => setIsAuthModalOpen(true)}
              >
                Sign in
              </Button>
            )}
          </div>
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
      <PublishCommunityDialog
        open={isPublishOpen}
        onOpenChange={setIsPublishOpen}
        onAuthRequired={() => setIsAuthModalOpen(true)}
      />
      <StudioUpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
