"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronRight } from "lucide-react";

import { getActiveOrganization } from "@/actions/organizations";
import Logo from "@/components/logo";
import { StudioUpgradeDialog } from "@/components/studio/dialogs/studio-upgrade-dialog";
import { StudioNotifications } from "@/components/studio/header/studio-notifications";
import { StudioUserNav } from "@/components/studio/studio-user-nav";
import { Button } from "@/components/ui/button";

export function StudioHeader({ onSignIn }: { onSignIn?: () => void }) {
  const router = useRouter();
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!signedIn) {
      setIsUpgrade(false);
      return;
    }
    const load = async () => {
      const res = await getActiveOrganization();
      if (res.success && res.organization) {
        setIsUpgrade(Boolean(res.organization?.isUpgrade));
      }
    };
    void load();

    const onOrg = () => void load();
    window.addEventListener("studio:org-changed", onOrg);
    return () => window.removeEventListener("studio:org-changed", onOrg);
  }, [signedIn]);

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
      <header className="flex shrink-0 items-center justify-between gap-3 px-5 pt-3 pb-1 sm:px-6 bg-background dark:bg-muted/20">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
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
            <Button variant="secondary" className="h-8 rounded-full">
              Admin panel <ChevronRight className="size-4" />
            </Button>
          ) : null}

          {!isUpgrade ? (
            <Button
              type="button"
              className="h-8 rounded-full bg-[#4262ff] px-3.5 text-[13px] font-semibold text-white hover:bg-[#3554e8]"
              onClick={openUpgrade}
            >
              Upgrade
            </Button>
          ) : (
            <span className="hidden h-8 items-center rounded-full bg-[#4262ff]/12 px-3 text-[12px] font-semibold text-[#4262ff] sm:inline-flex">
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
