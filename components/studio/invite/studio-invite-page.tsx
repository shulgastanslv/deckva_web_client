"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";

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
        setLoadError("error" in res ? res.error : "Invite not found");
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
        setActionError("error" in res ? res.error : "Couldn't accept invite");
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
        setActionError("error" in res ? res.error : "Couldn't decline invite");
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
            className="rounded-full"
            onClick={() => setAuthOpen(true)}
          >
            Sign in
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={() => router.push("/studio")}
          >
            Open studio
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
                Invite unavailable
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                {loadError || "This invite link is invalid or no longer works."}
              </p>
              <Button
                type="button"
                className="mt-6 rounded-full"
                onClick={() => router.push("/studio")}
              >
                Go to studio
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
                  Organization invite
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  {invite.organizationName}
                </h1>
                <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
                  {invite.invitedByName
                    ? `${invite.invitedByName} invited you to join as ${invite.role.toLowerCase()}.`
                    : `You've been invited to join as ${invite.role.toLowerCase()}.`}
                  {invite.email ? ` Sent to ${invite.email}.` : null}
                </p>
              </div>

              {invite.alreadyMember || done === "accepted" ? (
                <div className="mt-8 space-y-3">
                  <p className="rounded-2xl bg-muted/40 px-4 py-3 text-center text-[13px] text-muted-foreground">
                    You&apos;re already in this organization.
                  </p>
                  <Button
                    type="button"
                    className="h-11 w-full rounded-full"
                    onClick={() => router.push("/studio")}
                  >
                    Open studio
                    <ArrowRight className="size-3.5 opacity-70" />
                  </Button>
                </div>
              ) : done === "declined" ? (
                <p className="mt-8 rounded-2xl bg-muted/40 px-4 py-3 text-center text-[13px] text-muted-foreground">
                  Invite declined.
                </p>
              ) : blocked ? (
                <p className="mt-8 rounded-2xl bg-muted/40 px-4 py-3 text-center text-[13px] text-muted-foreground">
                  {invite.expired
                    ? "This invite has expired."
                    : invite.revoked
                      ? "This invite was revoked."
                      : "This invite is no longer available."}
                </p>
              ) : (
                <div className="mt-8 space-y-3">
                  {!signedIn ? (
                    <p className="rounded-2xl bg-muted/35 px-4 py-3 text-center text-[13px] text-muted-foreground">
                      Sign in to accept or decline this invite.
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
                    className="h-11 w-full rounded-full text-[14px] font-medium"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        {signedIn ? "Join organization" : "Sign in to join"}
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
                        "h-11 w-full rounded-full text-[14px] font-medium text-muted-foreground",
                      )}
                    >
                      Decline
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
