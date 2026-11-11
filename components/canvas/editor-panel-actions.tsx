"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowUp,
  ChevronDown,
  Globe,
  Play,
  Share,
  Smartphone,
} from "lucide-react";

import { AuthModal } from "@/components/auth";
import { ExportModal } from "@/components/export-modal";
import { PublishCommunityDialog } from "@/components/publish-community-dialog";
import { ShareModal } from "@/components/share-modal";
import { StudioUserNav } from "@/components/studio/studio-user-nav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";

const iconBtn =
  "size-8 rounded-md border-none text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground";

const menuItem =
  "cursor-pointer gap-2 rounded-xl px-3 py-2.5 text-[13px] focus:bg-muted/50";

type EditorPanelActionsProps = {
  onPreview?: () => void;
  onPhonePreview?: () => void;
  className?: string;
};

/** Figma-style right-panel chrome: account · preview · share / export. */
export function EditorPanelActions({
  onPreview,
  onPhonePreview,
  className,
}: EditorPanelActionsProps) {
  const { status } = useSession();
  const slides = useCanvasStore((s) => s.slides);
  const [authOpen, setAuthOpen] = useState(false);
  const [authVerifyToken, setAuthVerifyToken] = useState<string | null>(null);
  const [authResetToken, setAuthResetToken] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  useEffect(() => {
    const onAuthLink = (event: Event) => {
      const detail = (
        event as CustomEvent<{ verify?: string | null; reset?: string | null }>
      ).detail;
      if (detail?.verify) setAuthVerifyToken(detail.verify);
      if (detail?.reset) setAuthResetToken(detail.reset);
      if (detail?.verify || detail?.reset) setAuthOpen(true);
    };
    window.addEventListener("core:auth-link", onAuthLink);
    return () => window.removeEventListener("core:auth-link", onAuthLink);
  }, []);

  const requireAuth = (then: () => void) => {
    if (status !== "authenticated") {
      setAuthOpen(true);
      return;
    }
    then();
  };

  const slideCount = slides.length || 1;

  return (
    <>
      <div className={cn("flex items-center gap-1.5", className)}>
        <StudioUserNav
          showFeedback
          onCommunity={() => requireAuth(() => setPublishOpen(true))}
        />
        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                className="h-9 gap-1 rounded-md border-none bg-primary px-3 text-[12px] font-medium text-primary-foreground shadow-none hover:bg-primary/90"
              >
                Share
                <ChevronDown className="size-3 opacity-80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-2xl p-1.5">
              <DropdownMenuItem
                className={menuItem}
                onSelect={() => requireAuth(() => setShareOpen(true))}
              >
                <Share className="size-4" />
                Share link
              </DropdownMenuItem>
              <DropdownMenuItem
                className={menuItem}
                onSelect={() => requireAuth(() => setPublishOpen(true))}
              >
                <Globe className="size-4" />
                Publish to community
              </DropdownMenuItem>
              <DropdownMenuItem
                className={menuItem}
                onSelect={() => requireAuth(() => setExportOpen(true))}
              >
                <ArrowUp className="size-4" />
                Export · {slideCount} PNG / ZIP
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {(onPreview || onPhonePreview) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={iconBtn}
                title="Preview"
                aria-label="Preview"
              >
                <Play className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-52 rounded-2xl p-1.5">
              {onPreview ? (
                <DropdownMenuItem className={menuItem} onSelect={onPreview}>
                  <Play className="size-4" />
                  Preview carousel
                </DropdownMenuItem>
              ) : null}
              {onPhonePreview ? (
                <DropdownMenuItem className={menuItem} onSelect={onPhonePreview}>
                  <Smartphone className="size-4" />
                  Preview on phone
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <AuthModal
        isOpen={authOpen}
        verifyToken={authVerifyToken}
        resetToken={authResetToken}
        onOpenChange={(open) => {
          setAuthOpen(open);
          if (!open) {
            setAuthVerifyToken(null);
            setAuthResetToken(null);
          }
        }}
      />
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        onNeedAuth={() => {
          setShareOpen(false);
          setAuthOpen(true);
        }}
      />
      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        onNeedAuth={() => {
          setExportOpen(false);
          setAuthOpen(true);
        }}
      />
      <PublishCommunityDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        onAuthRequired={() => setAuthOpen(true)}
      />
    </>
  );
}
