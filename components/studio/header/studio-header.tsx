"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronRight, Keyboard, Menu, Send, UserPlus } from "lucide-react";

import { useActiveOrganization } from "@/lib/studio/queries";
import Logo from "@/components/logo";
import { StudioUpgradeDialog } from "@/components/studio/dialogs/studio-upgrade-dialog";
import { StudioNotifications } from "@/components/studio/header/studio-notifications";
import { StudioUserNav } from "@/components/studio/studio-user-nav";
import { Button } from "@/components/ui/button";

export function StudioHeader({
  onSignIn,
  onMenu,
}: {
  onSignIn?: () => void;
  onMenu?: () => void;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated";
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const organization = useActiveOrganization(signedIn);
  const isUpgrade = Boolean(organization.data?.organization?.isUpgrade);

  useEffect(() => {
    const onOpenUpgrade = () => setUpgradeOpen(true);
    window.addEventListener("studio:open-upgrade", onOpenUpgrade);
    return () =>
      window.removeEventListener("studio:open-upgrade", onOpenUpgrade);
  }, []);

  const openUpgrade = () => {
    if (!signedIn) {
      onSignIn?.();
      return;
    }
    setUpgradeOpen(true);
  };

  return (
    <>
      <header className="flex shrink-0 items-center justify-between gap-2 bg-muted/20 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:gap-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          {onMenu ? (
            <button
              type="button"
              onClick={onMenu}
              aria-label="Open menu"
              className="flex size-9 items-center justify-center rounded-full text-foreground md:hidden"
            >
              <Menu className="size-5 stroke-[1.75]" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Studio home"
            className="flex shrink-0 items-center transition-opacity hover:opacity-80"
          >
            <Logo
              width={32}
              height={32}
              href="/studio"
              className="shrink-0 hover:rotate-0"
            />
          </button>
          {!isUpgrade ? (
            <Button
              type="button"
              className="h-9 rounded-full bg-[#4262ff] px-3 text-[12px] font-semibold text-white hover:bg-[#3554e8] sm:px-3.5 sm:text-[13px]"
              onClick={openUpgrade}
            >
              Upgrade
            </Button>
          ) : (
            <span className="inline-flex h-9 items-center rounded-full bg-[#4262ff]/12 px-3 text-[12px] font-semibold text-[#4262ff]">
              Pro
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* --- НОВЫЕ ЭЛЕМЕНТЫ ДЛЯ ХЕДЕРА --- */}
          <div className="flex items-center gap-3">

            {/* Кнопка горячих клавиш */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/40 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground border-none shadow-none"
              title="Keyboard shortcuts"
            >
              <Keyboard className="size-4" />
            </button>

            <Button
              variant="secondary"
              className="h-9 rounded-full px-3 font-medium shadow-none border-none transition-colors"
            >
              <UserPlus className="mr-2 size-3.5" />
              Invite Members
            </Button>

          </div>
          {/* {session?.user?.role === "ADMIN" ? (
            <Button variant="secondary" className="hidden h-9 rounded-full sm:inline-flex" onClick={() => router.push("/admin")}>
              Admin panel <ChevronRight className="size-4" />
            </Button>
          ) : null} */}

         

          <StudioNotifications />

          {!signedIn ? (
            <Button
              type="button"
              variant="secondary"
              className="rounded-full"
              onClick={onSignIn}
            >
              Sign in
            </Button>
          ) : (
            <StudioUserNav />
          )}
        </div>
      </header>

      <StudioUpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
