"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CircleUserRound,
  LogOut,
  Moon,
  PlusIcon,
  Sun,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";

import { AuthModal } from "@/components/auth";
import { WhiteLogo } from "@/components/logo";
import { ProfileSettingsDialog } from "@/components/profile-settings-dialog";
import { WhatsNewModal } from "@/components/whats-new-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { stashStudioIntent } from "@/lib/studio/pending-intent";
import { cn } from "@/lib/utils";

function BrandAvatar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary",
        className,
      )}
    >
      <WhiteLogo
        width={18}
        height={18}
        href="#"
        className="pointer-events-none hover:rotate-0"
      />
    </span>
  );
}

export function StudioHomeHeader() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const userEmail = session?.user?.email ?? "";
  const userName = session?.user?.name?.trim() || userEmail || "Account";

  const createProject = () => {
    if (status !== "authenticated") {
      setAuthOpen(true);
      return;
    }
    stashStudioIntent({ type: "new" });
    router.push("/studio/editor");
  };

  return (
    <>
      <header className="z-20 flex w-full shrink-0 select-none items-center justify-end gap-2 bg-transparent px-5 py-3">
        <button
          type="button"
          onClick={createProject}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
        >
          <PlusIcon className="size-3.5" />
          Create project
        </button>

        <button
          type="button"
          onClick={() => setWhatsNewOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
        >
          <BookOpen className="size-3.5" />
          What&apos;s new
        </button>

        {status === "authenticated" && session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Account"
              >
                <BrandAvatar className="size-9" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-[280px] rounded-2xl border border-border bg-background p-0 shadow-lg"
            >
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <BrandAvatar className="size-11" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-foreground">
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
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Sign in"
          >
            <BrandAvatar className="size-9" />
          </button>
        )}
      </header>

      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
      <ProfileSettingsDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <WhatsNewModal open={whatsNewOpen} onOpenChange={setWhatsNewOpen} />
    </>
  );
}
