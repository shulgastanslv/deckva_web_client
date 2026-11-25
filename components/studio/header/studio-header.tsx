"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { List as Menu } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import Logo from "@/components/logo/logo";
import { StudioNotifications } from "@/components/studio/header/studio-notifications";
import { StudioUserNav } from "@/components/studio/studio-user-nav";
import { Button } from "@/components/ui/button";
import { controlSize } from "@/components/ui/control";
import { cn } from "@/lib/utils";
import { KeyboardShortcutsMenu } from "./keyboard-shortcuts-menu";
import { PlanDropdown } from "./plan-dropdown";
import { InviteMembersDialog } from "./invite-members";

export function StudioHeader({
  onSignIn,
  onMenu,
}: {
  onSignIn?: () => void;
  onMenu?: () => void;
}) {
  const t = useTranslations("common");
  const tn = useTranslations("studio.nav");
  const router = useRouter();
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <header className="flex shrink-0 items-center justify-between gap-2 bg-muted/20 px-3 py-3 md:rounded-t-2xl md:px-6 md:py-4">
      <div className="flex min-w-0 items-center gap-1 sm:gap-2">
        {onMenu ? (
          <button
            type="button"
            onClick={onMenu}
            aria-label={tn("openMenu")}
            className={cn(
              controlSize,
              "flex items-center justify-center rounded-md text-foreground md:hidden",
            )}
          >
            <Menu className="size-5 stroke-[1.5]" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label={tn("studioHome")}
          className={cn(
            controlSize,
            "flex shrink-0 items-center justify-center transition-opacity hover:opacity-80",
          )}
        >
          <Logo
            width={36}
            height={36}
            href="/studio"
            className="shrink-0 hover:rotate-0"
          />
        </button>
        {signedIn ? (
          <span data-tour="plan" className="inline-flex min-w-0">
            <PlanDropdown />
          </span>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div className="hidden items-center gap-2 md:flex">
          <KeyboardShortcutsMenu />
          <InviteMembersDialog />
        </div>
        <div className="md:hidden">
          <InviteMembersDialog />
        </div>
        <StudioNotifications />

        {!signedIn ? (
          <Button
            type="button"
            variant="secondary"
            className="rounded-md border-none bg-muted/40 px-3 text-[13px] font-medium shadow-none hover:bg-muted/60 sm:px-3.5"
            onClick={onSignIn}
          >
            {t("signIn")}
          </Button>
        ) : (
          <StudioUserNav />
        )}
      </div>
    </header>
  );
}
