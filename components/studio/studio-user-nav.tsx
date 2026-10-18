"use client";

import { useEffect, useState } from "react";
import {
  CircleUserRound,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";

import { AuthModal } from "@/components/auth";
import { ProfileSettingsDialog } from "@/components/profile-settings-dialog";
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
                    className="size-8 text-[13px]"
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
            sideOffset={12}
            className="w-[280px] rounded-2xl border border-border bg-background p-0 shadow-lg"
          >
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
              <UserLetterAvatar
                letter={userLetter}
                className="size-10 text-[13px]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-foreground">
                  {userName}
                </p>
                {userEmail ? (
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                    {userEmail}
                  </p>
                ) : null}
              </div>
            </div>

            <DropdownMenuSeparator className="mx-0 my-0" />

            <div className="py-1.5">
              <DropdownMenuItem
                className="cursor-pointer gap-3 rounded-none px-4 py-2.5 text-[13px]"
                onClick={() => setProfileOpen(true)}
              >
                <CircleUserRound className="size-4 text-foreground" />
                Manage Account
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-3 rounded-none px-4 py-2.5 text-[13px]"
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

            <div className="py-1.5 pb-2">
              <DropdownMenuItem
                className="cursor-pointer gap-3 rounded-none px-4 py-2.5 text-[13px]"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="size-4 text-foreground" />
                Log Out
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
    </>
  );
}
