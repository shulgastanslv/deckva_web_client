"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";

import { useActiveOrganization } from "@/lib/studio/queries";
import Logo from "@/components/logo/logo";
import { StudioUpgradeDialog } from "@/components/studio/dialogs/studio-upgrade-dialog";
import { StudioNotifications } from "@/components/studio/header/studio-notifications";
import { StudioUserNav } from "@/components/studio/studio-user-nav";
import { Button } from "@/components/ui/button";
import { KeyboardShortcutsMenu } from "./keyboard-shortcuts-menu";
import { PlanDropdown } from "./plan-dropdown";
import { InviteMembersDialog } from "./invite-members";
import { useTranslations } from "next-intl";

export function StudioHeader({
  onSignIn,
  onMenu,
}: {
  onSignIn?: () => void;
  onMenu?: () => void;
}) {
  const t = useTranslations("common");
  const router = useRouter();
  const { status } = useSession();
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
      <header className="flex shrink-0 items-center justify-between gap-2 rounded-t-2xl bg-muted/20 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:gap-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {onMenu ? (
            <button
              type="button"
              onClick={onMenu}
              aria-label="Open menu"
              className="flex size-9 items-center justify-center rounded-md text-foreground md:hidden"
            >
              <Menu className="size-5 stroke-[1.5]" />
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
          {signedIn ? (
            <PlanDropdown isUpgrade={isUpgrade} openUpgrade={openUpgrade} />
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-3">
            <KeyboardShortcutsMenu />
            <InviteMembersDialog />
          </div>
          <StudioNotifications />

          {!signedIn ? (
            <Button
              type="button"
              variant="secondary"
              className="h-9 rounded-md border-none bg-muted/40 px-3.5 text-[13px] font-medium shadow-none hover:bg-muted/60"
              onClick={onSignIn}
            >
              {t("signIn")}
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
