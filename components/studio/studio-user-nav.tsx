"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  SignOut as LogOut,
  ChatCircle as MessageCircle,
  Gear as Settings,
  User,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { AuthModal } from "@/components/auth";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { ProfileSettingsDialog } from "@/components/profile-settings-dialog";
import { StudioAvatar } from "@/components/studio/ui/studio-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { invalidateStudioProfile, useMyProfile } from "@/lib/studio/queries";
import { cn } from "@/lib/utils";

const itemClass =
  "cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[14px] text-foreground focus:bg-muted/50";

const iconClass = "size-4 shrink-0 stroke-[1.75] text-foreground";

function NavItem({
  icon,
  label,
  onSelect,
  className,
}: {
  icon: ReactNode;
  label: string;
  onSelect: () => void;
  className?: string;
}) {
  return (
    <DropdownMenuItem className={cn(itemClass, className)} onSelect={onSelect}>
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </DropdownMenuItem>
  );
}

export function StudioUserNav({
  onCommunity,
  showFeedback = true,
}: {
  /** Optional editor-only mobile community publish entry. */
  onCommunity?: () => void;
  showFeedback?: boolean;
}) {
  const t = useTranslations("studio.userNav");
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const signedIn = status === "authenticated" && Boolean(session?.user);
  const isAdmin = session?.user?.role === "ADMIN";
  const profile = useMyProfile(signedIn);

  useEffect(() => {
    const onProfileChanged = () => {
      void invalidateStudioProfile(queryClient);
    };
    window.addEventListener("studio:profile-changed", onProfileChanged);
    return () =>
      window.removeEventListener("studio:profile-changed", onProfileChanged);
  }, [queryClient]);

  const userEmail = profile.data?.email ?? session?.user?.email ?? "";
  const userName =
    profile.data?.name?.trim() ||
    session?.user?.name?.trim() ||
    userEmail ||
    t("account");
  const userLetter = (userName[0] || "U").toUpperCase();
  const avatarSrc = profile.data?.image ?? session?.user?.image ?? null;

  if (!signedIn) {
    return (
      <>
        <Button
          type="button"
          variant="secondary"
          className="h-9 rounded-md border-none bg-muted/40 px-3.5 text-[13px] font-medium shadow-none hover:bg-muted/60"
          onClick={() => setAuthOpen(true)}
        >
          {t("signIn")}
        </Button>
        <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
      </>
    );
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <StudioAvatar
            letter={userLetter}
            name={userName}
            src={avatarSrc}
            interactive
            className="size-9 text-[13px]"
            aria-label={t("accountMenu")}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={10}
          className="w-[260px] overflow-hidden rounded-2xl p-2"
        >
          <div className="flex items-center gap-3 px-2 py-2.5">
            <StudioAvatar
              letter={userLetter}
              name={userName}
              src={avatarSrc}
              className="size-9 text-[13px]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold tracking-tight text-foreground">
                {userName}
              </p>
              {userEmail && userEmail !== userName ? (
                <p className="truncate text-[12px] text-muted-foreground">
                  {userEmail}
                </p>
              ) : null}
            </div>
          </div>

          <DropdownMenuSeparator className="my-1.5 bg-border/50" />

          <NavItem
            icon={<User className={iconClass} />}
            label={t("profile")}
            onSelect={() => setAccountOpen(true)}
          />
          {showFeedback ? (
            <NavItem
              icon={<MessageCircle className={iconClass} />}
              label={t("feedback")}
              onSelect={() => setFeedbackOpen(true)}
            />
          ) : null}
          {isAdmin ? (
            <NavItem
              icon={<Settings className={iconClass} />}
              label={t("adminConsole")}
              onSelect={() => router.push("/admin")}
            />
          ) : null}

          {onCommunity ? (
            <NavItem
              icon={<Globe className={iconClass} />}
              label={t("publish")}
              onSelect={onCommunity}
            />
          ) : null}

          <DropdownMenuSeparator className="my-1.5 bg-border/50" />

          <NavItem
            icon={<LogOut className={iconClass} />}
            label={t("logOut")}
            onSelect={() => signOut({ callbackUrl: "/" })}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileSettingsDialog open={accountOpen} onOpenChange={setAccountOpen} />
      {showFeedback ? (
        <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      ) : null}
    </>
  );
}
