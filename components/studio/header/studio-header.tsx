"use client";

import { useEffect, useState } from "react";
import { Gift, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";

import { getActiveOrganization } from "@/actions/organizations";
import Logo from "@/components/logo";
import { StudioInviteDialog } from "@/components/studio/dialogs/studio-invite-dialog";
import { StudioUpgradeDialog } from "@/components/studio/dialogs/studio-upgrade-dialog";
import { StudioNotifications } from "@/components/studio/header/studio-notifications";
import { StudioUserNav } from "@/components/studio/studio-user-nav";
import { StudioButton } from "@/components/studio/ui/studio-button";
import { planLabel } from "@/lib/studio/plans";

export function StudioHeader({ onSignIn }: { onSignIn?: () => void }) {
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteTab, setInviteTab] = useState<"invite" | "rewards">("invite");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [plan, setPlan] = useState("starter");

  useEffect(() => {
    if (!signedIn) return;
    const load = async () => {
      const res = await getActiveOrganization();
      if (res.success && res.organization) setPlan(res.organization.plan);
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

  const openInvite = (tab: "invite" | "rewards" = "invite") => {
    if (!signedIn) {
      onSignIn?.();
      return;
    }
    setInviteTab(tab);
    setInviteOpen(true);
  };

  const openUpgrade = () => {
    if (!signedIn) {
      onSignIn?.();
      return;
    }
    setUpgradeOpen(true);
  };

  return (
    <>
      <header className="flex shrink-0 items-center justify-between gap-4 px-6 pt-4 pb-2 sm:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo
            width={28}
            height={28}
            href="/studio"
            className="shrink-0 transition-opacity hover:opacity-80"
          />
          <button
            type="button"
            onClick={openUpgrade}
            className="hidden items-center rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50 sm:inline-flex dark:border-border dark:bg-background dark:text-muted-foreground dark:hover:bg-muted"
          >
            {planLabel(plan)} plan
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {signedIn ? (
            <StudioButton
              variant="secondary"
              className="hidden h-8 rounded-full sm:inline-flex"
              onClick={() => openInvite("invite")}
            >
              <UserPlus className="size-3.5" />
              Invite members
            </StudioButton>
          ) : (
            <StudioButton
              variant="ghost"
              className="h-8 rounded-full"
              onClick={onSignIn}
            >
              Sign in
            </StudioButton>
          )}

          <StudioButton
            variant="primary"
            className="hidden h-8 rounded-full px-3.5 sm:inline-flex"
            onClick={openUpgrade}
          >
            Upgrade
          </StudioButton>

          <button
            type="button"
            aria-label="Rewards"
            onClick={() => openInvite("rewards")}
            className="hidden size-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 sm:flex dark:text-muted-foreground dark:hover:bg-muted"
          >
            <Gift className="size-[18px] stroke-[1.75]" />
          </button>

          <StudioNotifications />
          <StudioUserNav variant="header" />
        </div>
      </header>

      <StudioInviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        initialTab={inviteTab}
        onUpgrade={openUpgrade}
      />
      <StudioUpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
