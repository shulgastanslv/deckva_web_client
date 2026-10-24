"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Gift,
  Heart,
  Info,
  Lightbulb,
  Link2,
  Mail,
  UserPlus,
  X,
} from "lucide-react";

import {
  getActiveOrganization,
  type OrganizationListItem,
} from "@/actions/organizations";
import { StudioOrgAvatar } from "@/components/studio/org/studio-org-avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Tab = "invite" | "rewards";

export function StudioInviteDialog({
  open,
  onOpenChange,
  initialTab = "invite",
  onUpgrade,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: Tab;
  onUpgrade?: () => void;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [org, setOrg] = useState<OrganizationListItem | null>(null);
  const [emails, setEmails] = useState("");
  const [copied, setCopied] = useState(false);
  const [inviteMode, setInviteMode] = useState<"manual" | "link">("manual");

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setEmails("");
    setCopied(false);
    void (async () => {
      const res = await getActiveOrganization();
      if (res.success) setOrg(res.organization);
    })();
  }, [open, initialTab]);

  const inviteUrl = useMemo(() => {
    if (!org?.inviteCode || typeof window === "undefined") return "";
    return `${window.location.origin}/studio?invite=${org.inviteCode}`;
  }, [org?.inviteCode]);

  const copyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const emailList = emails
    .split(/[,;\s]+/)
    .map((e) => e.trim())
    .filter(Boolean);
  const canSend = emailList.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-2xl border-neutral-200 bg-white p-0 shadow-2xl sm:max-w-[520px] dark:bg-background"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 pt-4 dark:border-border">
          <div className="flex items-center gap-5">
            {(
              [
                { id: "invite" as const, label: "Invite" },
                { id: "rewards" as const, label: "Rewards" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "relative pb-3 text-[14px] font-semibold transition-colors",
                  tab === item.id
                    ? "text-neutral-950 dark:text-foreground"
                    : "text-neutral-400 hover:text-neutral-700",
                )}
              >
                {item.label}
                {tab === item.id ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2f5bff]" />
                ) : null}
              </button>
            ))}
          </div>
          <div className="mb-3 flex items-center gap-1">
            <button
              type="button"
              aria-label="Info"
              className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <Info className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {tab === "invite" ? (
          <div className="px-5 py-5">
            <div className="flex items-center gap-2">
              {org ? (
                <StudioOrgAvatar
                  name={org.name}
                  color={org.color}
                  className="size-6 text-[10px]"
                />
              ) : null}
              <DialogTitle className="text-[18px] font-bold tracking-tight text-neutral-950 dark:text-foreground">
                Invite to {org?.name ?? "organization"}
              </DialogTitle>
            </div>

            <div className="mt-4 flex items-center gap-1 border-b border-neutral-100 dark:border-border">
              {(
                [
                  { id: "manual" as const, label: "Manual invite", icon: Mail },
                  { id: "link" as const, label: "Invite link", icon: Link2 },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setInviteMode(id)}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 px-3 pb-2.5 text-[13px] font-medium transition-colors",
                    inviteMode === id
                      ? "text-neutral-950 dark:text-foreground"
                      : "text-neutral-400 hover:text-neutral-700",
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                  {inviteMode === id ? (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2f5bff]" />
                  ) : null}
                </button>
              ))}
            </div>

            {inviteMode === "manual" ? (
              <div className="mt-4">
                <div className="flex items-start gap-2 rounded-xl border-2 border-[#2f5bff]/70 bg-white px-3 py-3 dark:bg-background">
                  <UserPlus className="mt-0.5 size-4 shrink-0 text-neutral-400" />
                  <textarea
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                    placeholder="Enter or copy and paste email addresses"
                    rows={3}
                    className="min-h-[72px] w-full resize-none bg-transparent text-[14px] outline-none placeholder:text-neutral-400"
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!canSend}
                    className={cn(
                      "h-9 rounded-lg px-4 text-[13px] font-semibold text-white transition-colors",
                      canSend
                        ? "bg-[#2f5bff] hover:bg-[#254ae6]"
                        : "cursor-not-allowed bg-neutral-200",
                    )}
                    onClick={() => {
                      void copyLink();
                      onOpenChange(false);
                    }}
                  >
                    Send invitations
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyLink()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-300 px-3 text-[13px] font-medium text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-border dark:text-foreground dark:hover:bg-muted"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Link2 className="size-3.5" />
                    )}
                    {copied ? "Copied" : "Copy team invite link"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-neutral-100 px-3 py-2.5 text-[13px] break-all text-neutral-700 dark:bg-muted dark:text-foreground">
                  {inviteUrl || "Loading…"}
                </div>
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#2f5bff] text-[14px] font-semibold text-white transition-colors hover:bg-[#254ae6]"
                >
                  {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
                  {copied ? "Link copied" : "Copy invite link"}
                </button>
              </div>
            )}

            <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#eef2ff] px-3 py-3 text-[12px] leading-relaxed text-neutral-700 dark:bg-primary/10 dark:text-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0 text-[#2f5bff]" />
              <p>
                <button
                  type="button"
                  className="font-semibold text-[#2f5bff] underline underline-offset-2"
                  onClick={() => {
                    onOpenChange(false);
                    onUpgrade?.();
                  }}
                >
                  Upgrade
                </button>{" "}
                to invite guests to shared carousels and collaborate securely
                with clients and partners.
              </p>
            </div>
          </div>
        ) : (
          <div className="px-5 py-5">
            <DialogTitle className="text-[18px] font-bold tracking-tight text-neutral-950 dark:text-foreground">
              Invite new accounts, get rewards
            </DialogTitle>

            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-[13px] text-neutral-700 dark:text-foreground">
                <span className="mt-0.5 inline-flex size-7 items-center justify-center rounded-full bg-[#eef2ff] text-[#2f5bff]">
                  <Gift className="size-3.5" />
                </span>
                <span>
                  <strong className="font-semibold">You get:</strong> bonus AI
                  credits and early feature access for every referral.
                </span>
              </li>
              <li className="flex items-start gap-3 text-[13px] text-neutral-700 dark:text-foreground">
                <span className="mt-0.5 inline-flex size-7 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-500/10">
                  <Heart className="size-3.5" />
                </span>
                <span>
                  <strong className="font-semibold">They get:</strong> a warm
                  welcome pack and starter templates.
                </span>
              </li>
            </ul>

            <div className="mt-5 rounded-xl bg-neutral-100 px-3 py-2.5 text-[13px] break-all text-neutral-700 dark:bg-muted dark:text-foreground">
              {inviteUrl || "Loading…"}
            </div>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#2f5bff] text-[14px] font-semibold text-white transition-colors hover:bg-[#254ae6]"
            >
              {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
              {copied ? "Link copied" : "Copy invite link"}
            </button>

            <div className="mt-5 flex items-start gap-2 text-[12px] leading-relaxed text-neutral-500">
              <Lightbulb className="mt-0.5 size-3.5 shrink-0" />
              <p>
                Share your invite link so teammates can join{" "}
                {org?.name ?? "your organization"} instantly.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
