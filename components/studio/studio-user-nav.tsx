"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CircleUserRound,
  ExternalLink,
  Home,
  LogOut,
  Mail,
  MoreHorizontal,
  Moon,
  Send,
  Sparkles,
  Sun,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";

import { AuthModal } from "@/components/auth";
import { ProfileSettingsDialog } from "@/components/profile-settings-dialog";
import { SocialSubscribeDialog } from "@/components/social-subscribe-dialog";
import { WhatsNewModal } from "@/components/whats-new-modal";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const itemClass =
  "cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]";

function UserLetterAvatar({
  letter,
  className,
}: {
  letter: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground",
        className,
      )}
      aria-hidden
    >
      {letter}
    </span>
  );
}

export function StudioUserNav() {
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
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

  return (
    <>
      {status === "authenticated" && session?.user ? (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Account"
                >
                  <UserLetterAvatar
                    letter={userLetter}
                    className="size-9 text-[13px] bg-white text-black border border-border backdrop-blur-sm"
                  />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Account
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={10}
            className="w-[252px] overflow-visible rounded-xl border border-border bg-background p-0 shadow-lg"
          >
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <UserLetterAvatar
                letter={userLetter}
                className="size-8 text-[12px]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
                  {userName}
                </p>
                {userEmail ? (
                  <p className="truncate text-[12px] leading-tight text-muted-foreground">
                    {userEmail}
                  </p>
                ) : null}
              </div>
            </div>

            <DropdownMenuSeparator className="mx-0 my-0" />

            <div className="p-1">
              <DropdownMenuItem
                className={itemClass}
                onClick={() => setProfileOpen(true)}
              >
                <CircleUserRound className="size-4 text-foreground" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem
                className={itemClass}
                onClick={() => setTheme(isDark ? "light" : "dark")}
              >
                {isDark ? (
                  <Sun className="size-4 text-foreground" />
                ) : (
                  <Moon className="size-4 text-foreground" />
                )}
                {isDark ? "Light" : "Dark"}
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="mx-0 my-0" />

            <div className="p-1">
              <DropdownMenuItem asChild className={itemClass}>
                <Link href="/docs">
                  <BookOpen className="size-4 text-foreground" />
                  User guide
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={itemClass}
                onClick={() => setWhatsNewOpen(true)}
              >
                <Sparkles className="size-4 text-foreground" />
                What&apos;s new
              </DropdownMenuItem>
              <DropdownMenuItem asChild className={itemClass}>
                <Link href="/docs/contact">
                  <Mail className="size-4 text-foreground" />
                  Contact us
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className={itemClass}>
                  <MoreHorizontal className="size-4 text-foreground" />
                  More
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent
                  sideOffset={6}
                  className="z-[60] w-48 rounded-xl border border-border bg-background p-1 shadow-xl"
                >
                  <DropdownMenuItem asChild className={itemClass}>
                    <Link href="/">
                      Home page
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={itemClass}
                    onClick={() => setSocialOpen(true)}
                  >
                    Social
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className={itemClass}>
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
                className={itemClass}
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="size-4 text-foreground" />
                Log out
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
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
              <UserLetterAvatar letter="U" className="size-9 text-[13px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
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
