"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CircleUserRound,
  Home,
  LogOut,
  Mail,
  Moon,
  Share2,
  Sparkles,
  Sun,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";

import { AuthModal } from "@/components/auth";
import { ProfileSettingsDialog } from "@/components/profile-settings-dialog";
import { SocialSubscribeDialog } from "@/components/social-subscribe-dialog";
import { StudioAvatar } from "@/components/studio/ui/studio-avatar";
import { WhatsNewModal } from "@/components/whats-new-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const itemClass =
  "cursor-pointer gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px]";

export function StudioUserNav({
  variant = "header",
}: {
  variant?: "header" | "rail";
}) {
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const userEmail = session?.user?.email ?? "";
  const userName = session?.user?.name?.trim() || userEmail || "Account";
  const userLetter = (userName[0] || "U").toUpperCase();
  const isHeader = variant === "header";

  const menu = (
    <DropdownMenuContent
      side="bottom"
      align="end"
      sideOffset={10}
      className="w-[280px] overflow-hidden rounded-2xl border border-neutral-200 bg-white p-0 shadow-xl dark:border-border dark:bg-background"
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <StudioAvatar letter={userLetter} className="size-10 text-[14px]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold leading-tight text-neutral-950 dark:text-foreground">
            {userName}
          </p>
          {userEmail ? (
            <p className="mt-0.5 truncate text-[12px] leading-tight text-neutral-500 dark:text-muted-foreground">
              {userEmail}
            </p>
          ) : null}
        </div>
      </div>

      <DropdownMenuSeparator className="mx-0 my-0" />

      <div className="p-1.5">
        <DropdownMenuItem
          className={itemClass}
          onClick={() => setProfileOpen(true)}
        >
          <CircleUserRound className="size-4 text-neutral-500" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className={itemClass}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark ? (
            <Sun className="size-4 text-neutral-500" />
          ) : (
            <Moon className="size-4 text-neutral-500" />
          )}
          {isDark ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
      </div>

      <DropdownMenuSeparator className="mx-0 my-0" />

      <div className="p-1.5">
        <DropdownMenuItem asChild className={itemClass}>
          <Link href="/docs">
            <BookOpen className="size-4 text-neutral-500" />
            Learning center
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={itemClass}
          onClick={() => setWhatsNewOpen(true)}
        >
          <Sparkles className="size-4 text-neutral-500" />
          What&apos;s new
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={itemClass}>
          <Link href="/docs/contact">
            <Mail className="size-4 text-neutral-500" />
            Contact us
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={itemClass}
          onClick={() => setSocialOpen(true)}
        >
          <Share2 className="size-4 text-neutral-500" />
          Social
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={itemClass}>
          <Link href="/">
            <Home className="size-4 text-neutral-500" />
            Home page
          </Link>
        </DropdownMenuItem>
      </div>

      <DropdownMenuSeparator className="mx-0 my-0" />

      <div className="p-1.5">
        <DropdownMenuItem
          className={itemClass}
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  );

  return (
    <>
      {status === "authenticated" && session?.user ? (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "rounded-full outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring",
                    menuOpen && "ring-2 ring-[#2f5bff]/40",
                  )}
                  aria-label="Account"
                >
                  <StudioAvatar
                    letter={userLetter}
                    className="size-9 border border-black/5 text-[13px] shadow-sm"
                  />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side={isHeader ? "bottom" : "right"} sideOffset={8}>
              <p className="font-medium">{userName}</p>
              {userEmail ? (
                <p className="text-[11px] opacity-80">{userEmail}</p>
              ) : null}
            </TooltipContent>
          </Tooltip>
          {menu}
        </DropdownMenu>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Sign in"
            >
              <StudioAvatar letter="U" className="size-9 text-[13px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            Sign in
          </TooltipContent>
        </Tooltip>
      )}

      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
      <ProfileSettingsDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <WhatsNewModal open={whatsNewOpen} onOpenChange={setWhatsNewOpen} />
      <SocialSubscribeDialog open={socialOpen} onOpenChange={setSocialOpen} />
    </>
  );
}
