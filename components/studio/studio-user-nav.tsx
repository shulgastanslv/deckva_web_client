"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleUserRound, LayoutDashboard, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
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
import { invalidateStudioProfile, useMyProfile } from "@/lib/studio/queries";

const itemClass =
  "cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-[13px] text-foreground focus:bg-muted/50";

export function StudioUserNav() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

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
    "Settings";
  const userLetter = (userName[0] || "U").toUpperCase();
  const avatarSrc = profile.data?.image ?? session?.user?.image ?? null;

  if (!signedIn) {
    return (
      <>
        <StudioAvatar
          letter="U"
          interactive
          className="size-8 text-[12px]"
          aria-label="Sign in"
          onClick={() => setAuthOpen(true)}
        />
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
            open={menuOpen}
            interactive
            className="size-8 text-[12px]"
            aria-label="Account menu"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={10}
          className="w-[220px] overflow-hidden rounded-2xl p-1.5"
        >
          <div className="flex items-center gap-2.5 px-2.5 py-2.5">
            <StudioAvatar
              letter={userLetter}
              name={userName}
              src={avatarSrc}
              className="size-8 text-[12px]"
            />
            <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
              {userName}
            </p>
          </div>

          <DropdownMenuSeparator className="my-1.5 bg-border/50" />

          <DropdownMenuItem
            className={itemClass}
            onClick={() => setAccountOpen(true)}
          >
            <CircleUserRound className="size-4 stroke-[1.75] text-muted-foreground" />
            Settings
          </DropdownMenuItem>

          {isAdmin ? (
            <DropdownMenuItem
              className={itemClass}
              onClick={() => router.push("/admin")}
            >
              <LayoutDashboard className="size-4 stroke-[1.75] text-muted-foreground" />
              Admin panel
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem
            className={itemClass}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="size-4 stroke-[1.75] text-muted-foreground" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileSettingsDialog open={accountOpen} onOpenChange={setAccountOpen} />
    </>
  );
}
