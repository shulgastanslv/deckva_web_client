"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronRight, Menu } from "lucide-react";

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
      <header className="flex shrink-0 items-center justify-between gap-2 bg-background px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:gap-3 md:rounded-full md:border md:border-white/60 md:bg-white/70 md:px-4 md:py-1.5 md:pt-1.5 md:backdrop-blur-xl md:dark:border-white/10 md:dark:bg-[#14151c]/75">
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
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">

          {session?.user?.role === "ADMIN" ? (
            <Button variant="secondary" className="hidden h-8 rounded-full sm:inline-flex">
              Admin panel <ChevronRight className="size-4" />
            </Button>
          ) : null}

          {!isUpgrade ? (
            <Button
              type="button"
              className="h-8 rounded-full bg-[#4262ff] px-3 text-[12px] font-semibold text-white hover:bg-[#3554e8] sm:px-3.5 sm:text-[13px]"
              onClick={openUpgrade}
            >
              Upgrade
            </Button>
          ) : (
            <span className="inline-flex h-8 items-center rounded-full bg-[#4262ff]/12 px-3 text-[12px] font-semibold text-[#4262ff]">
              Pro
            </span>
          )}

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
