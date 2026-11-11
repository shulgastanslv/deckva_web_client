"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  SpinnerGap as Loader2,
} from "@phosphor-icons/react";

import {
  acceptOrganizationInvite,
  declineOrganizationInvite,
  getInvitePreview,
  type InvitePreview,
} from "@/actions/invites";
import { AuthModal } from "@/components/auth";
import Logo from "@/components/logo/logo";
import { StudioOrgAvatar } from "@/components/studio/org/studio-org-avatar";
import { Button } from "@/components/ui/button";
import { invalidateStudioOrganizations } from "@/lib/studio/queries";
import { cn } from "@/lib/utils";

export function StudioInvitePage({ token }: { token: string }) {
  const t = useTranslations("studio.invite.page");
  const te = useTranslations("errors");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status } = useSession();
  const signedIn = status === "authenticated";

  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [done, setDone] = useState<"accepted" | "declined" | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getInvitePreview(token).then((res) => {
      if (cancelled) return;
      if (!res.success || !("invite" in res)) {
        setLoadError("error" in res ? res.error : t("notFound"));
        setInvite(null);
      } else {
        setInvite(res.invite);
        setLoadError(null);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token, signedIn]);

  const blocked =
    !invite ||
    invite.expired ||
    invite.revoked ||
    (invite.accepted && Boolean(invite.email));

  const accept = async () => {
    if (!invite || busy) return;
    if (!signedIn) {
      setAuthOpen(true);
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const res = await acceptOrganizationInvite(token);
      if (!res.success) {
        setActionError("error" in res ? res.error : te("inviteAcceptFailed"));
        return;
      }
      await invalidateStudioOrganizations(queryClient);
      window.dispatchEvent(new CustomEvent("studio:org-changed"));
      setDone("accepted");
      router.push("/studio");
    } finally {
      setBusy(false);
    }
  };

  const decline = async () => {
    if (!invite || busy) return;
    if (!signedIn) {
      setAuthOpen(true);
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const res = await declineOrganizationInvite(token);
      if (!res.success) {
        setActionError("error" in res ? res.error : te("inviteDeclineFailed"));
        return;
      }
      setDone("declined");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-muted/20 text-foreground">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Logo width={36} height={36} href="/studio" />
        {!signedIn ? (
          <Button
            type="button"
            variant="secondary"
            className="rounded-md"
            onClick={() => setAuthOpen(true)}
          >
            {t("signIn")}
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="rounded-md"
            onClick={() => router.push("/studio")}
          >
            {t("openStudio")}
          </Button>
        )}
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : loadError || !invite ? (
            <div className="rounded-3xl bg-background px-6 py-10 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {t("unavailable")}
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                {loadError || t("invalidOrGone")}
              </p>
              <Button
                type="button"
                className="mt-6 rounded-md"
                onClick={() => router.push("/studio")}
              >
                {t("goToStudio")}
              </Button>
            </div>
          ) : (
            <div className="rounded-3xl bg-background px-6 py-8 sm:px-8">
              <div className="flex flex-col items-center text-center">
                <StudioOrgAvatar
                  name={invite.organizationName}
                  color={invite.organizationColor}
                  className="size-16 rounded-2xl text-[18px]"
                />
                <p className="mt-5 text-[13px] font-medium tracking-wide text-muted-foreground uppercase">
                  {t("title")}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  {invite.organizationName}
                </h1>
                <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
                  {invite.invitedByName
                    ? t("invitedBy", {
                        name: invite.invitedByName,
                        role: invite.role.toLowerCase(),
                      })
                    : t("invitedGeneric", {
                        role: invite.role.toLowerCase(),
                      })}
                  {invite.email ? ` ${t("sentTo", { email: invite.email })}` : null}
                </p>
              </div>

              {invite.alreadyMember || done === "accepted" ? (
                <div className="mt-8 space-y-3">
                  <p className="rounded-2xl bg-muted/40 px-4 py-3 text-center text-[13px] text-muted-foreground">
                    {t("alreadyIn")}
                  </p>
                  <Button
                    type="button"
                    className="h-11 w-full rounded-md"
                    onClick={() => router.push("/studio")}
                  >
                    {t("openStudio")}
                    <ArrowRight className="size-3.5 opacity-70" />
                  </Button>
                </div>
              ) : done === "declined" ? (
                <p className="mt-8 rounded-2xl bg-muted/40 px-4 py-3 text-center text-[13px] text-muted-foreground">
                  {t("declined")}
                </p>
              ) : blocked ? (
                <p className="mt-8 rounded-2xl bg-muted/40 px-4 py-3 text-center text-[13px] text-muted-foreground">
                  {invite.expired
                    ? t("expired")
                    : invite.revoked
                      ? t("revoked")
                      : t("noLongerAvailable")}
                </p>
              ) : (
                <div className="mt-8 space-y-3">
                  {!signedIn ? (
                    <p className="rounded-2xl bg-muted/35 px-4 py-3 text-center text-[13px] text-muted-foreground">
                      {t("signInToAccept")}
                    </p>
                  ) : null}

                  {actionError ? (
                    <p className="text-center text-[13px] text-destructive">
                      {actionError}
                    </p>
                  ) : null}

                  <Button
                    type="button"
                    disabled={busy}
                    onClick={() => void accept()}
                    className="h-11 w-full rounded-md text-[14px] font-medium"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        {signedIn ? t("join") : t("signInToJoin")}
                        <ArrowRight className="size-3.5 opacity-70" />
                      </>
                    )}
                  </Button>

                  {signedIn ? (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => void decline()}
                      className={cn(
                        "h-11 w-full rounded-md text-[14px] font-medium text-muted-foreground",
                      )}
                    >
                      {t("decline")}
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
