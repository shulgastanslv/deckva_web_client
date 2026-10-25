"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";

import { getActiveOrganization } from "@/actions/organizations";
import Logo from "@/components/logo";
import { StudioInviteDialog } from "@/components/studio/dialogs/studio-invite-dialog";
import { StudioUpgradeDialog } from "@/components/studio/dialogs/studio-upgrade-dialog";
import { StudioNotifications } from "@/components/studio/header/studio-notifications";
import { StudioOrgSwitcher } from "@/components/studio/org/studio-org-switcher";
import { StudioUserNav } from "@/components/studio/studio-user-nav";
import { Button } from "@/components/ui/button";

export function StudioHeader({ onSignIn }: { onSignIn?: () => void }) {
  const router = useRouter();
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    if (!signedIn) {
      setIsUpgrade(false);
      return;
    }
    const load = async () => {
      const res = await getActiveOrganization();
      if (res.success && res.organization) {
        setIsUpgrade(res.organization.isUpgrade);
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

  const requireAuth = () => {
    if (!signedIn) {
      onSignIn?.();
      return false;
    }
    return true;
  };

  const openInvite = () => {
    if (!requireAuth()) return;
    if (!isUpgrade) {
      setUpgradeOpen(true);
      return;
    }
    setInviteOpen(true);
  };

  const openUpgrade = () => {
    if (!requireAuth()) return;
    setUpgradeOpen(true);
  };

  return (
    <>
      <header className="flex shrink-0 items-center justify-between gap-3 px-5 pt-3 pb-1 sm:px-6">
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
          <Button
            type="button"
            variant="secondary"
            className="hidden h-8 gap-1.5 rounded-full bg-neutral-200/80 px-3 text-[13px] font-medium text-neutral-900 hover:bg-neutral-200 sm:inline-flex dark:bg-muted dark:text-foreground dark:hover:bg-muted/80"
            onClick={openInvite}
          >
            <UserPlus className="size-3.5" />
            Invite
          </Button>

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
              variant="ghost"
              className="h-8 rounded-full px-3 text-[13px]"
              onClick={onSignIn}
            >
              Sign in
            </Button>
          ) : null}

          <StudioUserNav onUpgrade={openUpgrade} isUpgrade={isUpgrade} />
        </div>
      </header>

      <StudioInviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        initialTab="invite"
        onUpgrade={openUpgrade}
      />
      <StudioUpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
