"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleUserRound, LogOut, Shield } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { AuthModal } from "@/components/auth";
import { ProfileSettingsDialog } from "@/components/profile-settings-dialog";
import { StudioAvatar } from "@/components/studio/ui/studio-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const itemClass =
  "cursor-pointer gap-2.5 rounded-none px-3.5 py-2.5 text-[14px] text-neutral-900 focus:bg-neutral-100 dark:text-foreground dark:focus:bg-muted";

export function StudioUserNav() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const signedIn = status === "authenticated" && Boolean(session?.user);
  const userEmail = session?.user?.email ?? "";
  const userName = session?.user?.name?.trim() || userEmail || "Account";
  const userLetter = (userName[0] || "U").toUpperCase();

  if (!signedIn) {
    return (
      <>
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Sign in"
        >
          <StudioAvatar letter="U" className="size-8 text-[12px]" />
        </button>
        <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
      </>
    );
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
              menuOpen && "ring-2 ring-[#4262ff]/35",
            )}
            aria-label="Account"
          >
            <StudioAvatar letter={userLetter} className="size-8 text-[12px]" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={10}
          className="w-[220px] overflow-hidden rounded-2xl border-0 bg-white p-0 dark:bg-background dark:ring-1 dark:ring-border"
        >
          <div className="flex items-center gap-2.5 px-3.5 py-3">
            <StudioAvatar letter={userLetter} className="size-8 text-[12px]" />
            <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-neutral-950 dark:text-foreground">
              {userName}
            </p>
          </div>

          <DropdownMenuSeparator className="mx-0 my-0 bg-neutral-200/80 dark:bg-border" />

          <div className="py-1">
            <DropdownMenuItem
              className={itemClass}
              onClick={() => setAccountOpen(true)}
            >
              <CircleUserRound className="size-4 stroke-[1.75] text-neutral-800 dark:text-muted-foreground" />
              Account
            </DropdownMenuItem>
           
            <DropdownMenuItem
              className={itemClass}
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="size-4 stroke-[1.75] text-neutral-800 dark:text-muted-foreground" />
              Log out
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileSettingsDialog open={accountOpen} onOpenChange={setAccountOpen} />
    </>
  );
}
