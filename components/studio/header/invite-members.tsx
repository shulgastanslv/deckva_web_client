"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Link as Link2,
  SpinnerGap as Loader2,
  Envelope as Mail,
  UserPlus,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import {
  getOrCreateInviteLink,
  sendOrganizationInvites,
} from "@/actions/invites";
import {
  invalidateStudioOrganizations,
  useActiveOrganization,
} from "@/lib/studio/queries";
import {
  INVITEABLE_ORG_ROLES,
  OrgMemberRole,
  isOrgManager,
  type InviteableOrgRole,
} from "@/lib/roles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function InviteMembersDialog() {
  const t = useTranslations("studio.invite");
  const tc = useTranslations("common");
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const queryClient = useQueryClient();
  const organization = useActiveOrganization(signedIn);
  const org = organization.data?.organization ?? null;
  const canInvite = isOrgManager(org?.role);

  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState("");
  const [role, setRole] = useState<InviteableOrgRole>(OrgMemberRole.MEMBER);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  if (!signedIn || !org || !canInvite) return null;

  const reset = () => {
    setEmails("");
    setRole(OrgMemberRole.MEMBER);
    setError(null);
    setSummary(null);
    setBusy(false);
  };

  const handleCopyLink = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await getOrCreateInviteLink(org.id);
      if (!res.success || !("url" in res)) {
        setError("error" in res ? res.error : t("createLinkFailed"));
        return;
      }
      await navigator.clipboard.writeText(res.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t("copyFailed"));
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async () => {
    if (!emails.trim() || busy) return;
    setBusy(true);
    setError(null);
    setSummary(null);
    try {
      const res = await sendOrganizationInvites({
        organizationId: org.id,
        emails,
        role,
      });
      if (!res.success || !("results" in res)) {
        setError("error" in res ? res.error : t("sendFailed"));
        return;
      }

      const notified = res.results.filter((r) => r.status === "notified").length;
      const invited = res.results.filter((r) => r.status === "invited").length;
      const already = res.results.filter(
        (r) => r.status === "already_member",
      ).length;

      const parts: string[] = [];
      if (notified) parts.push(t("notifiedInApp", { n: notified }));
      if (invited) parts.push(t("inviteLinkReady", { n: invited }));
      if (already) parts.push(t("alreadyMembers", { n: already }));
      setSummary(parts.join(" · ") || tc("done"));
      setEmails("");
      void invalidateStudioOrganizations(queryClient);
    } catch {
      setError(t("sendFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
 className="rounded-md bg-[#4262ff] px-3.5 text-[13px] font-semibold text-white hover:bg-[#4262ff]/90"
        >
          <UserPlus className="mr-2 size-4" />
          {t("title")}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="w-[min(30rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-md"
        showCloseButton
      >
        <DialogHeader className="gap-1 px-5 pt-5 pb-3">
          <DialogTitle className="text-[17px] font-semibold tracking-tight">
            {t("inviteTo", { name: org.name })}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 pb-5">
          <div className="relative">
            <Mail className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-muted-foreground" />
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              disabled={busy}
              rows={4}
              placeholder={t("emailsHint")}
              className={cn(
                "min-h-[110px] w-full resize-none rounded-2xl bg-muted/30 py-3 pr-3.5 pl-10 text-[14px] leading-relaxed text-foreground outline-none",
                "placeholder:text-muted-foreground/70 focus:bg-muted/40",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-muted/35 p-1">
            {INVITEABLE_ORG_ROLES.map((value) => (
              <button
                key={value}
                type="button"
                disabled={busy}
                onClick={() => setRole(value)}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-xl text-[13px] font-medium transition-colors",
                  role === value
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {value === OrgMemberRole.MEMBER ? t("member") : t("admin")}
              </button>
            ))}
          </div>

          {error ? (
            <p className="text-[13px] text-destructive">{error}</p>
          ) : null}
          {summary ? (
            <p className="text-[13px] text-muted-foreground">{summary}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => void handleCopyLink()}
              className="rounded-md px-4 text-[13px]"
            >
              {busy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Link2 className="size-3.5" />
              )}
              {copied ? t("copied") : t("copyInviteLink")}
            </Button>
            <Button
              type="button"
              disabled={busy || !emails.trim()}
              onClick={() => void handleSend()}
              className="ml-auto h-10 rounded-md px-5 text-[13px] font-medium"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  {t("send")}
                  <ArrowRight className="size-3.5 opacity-70" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
