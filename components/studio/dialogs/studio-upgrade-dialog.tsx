"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Minus,
  Plus,
  X,
} from "lucide-react";

import {
  getActiveOrganization,
  getUserOrganizations,
  setActiveOrganization,
  updateOrganizationPlan,
  type OrganizationListItem,
  type OrgPlan,
} from "@/actions/organizations";
import { StudioOrgAvatar } from "@/components/studio/org/studio-org-avatar";
import {
  ORG_PLANS,
  PLAN_COMPARE_ROWS,
  PLAN_FAQ,
  priceForPlan,
  type CompareCell,
  type OrgPlanId,
} from "@/lib/studio/plans";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const MEMBER_OPTIONS = [1, 2, 4, 5, 10, 20] as const;
const COMPARE_COLS = ["free", "starter", "business", "enterprise"] as const;

function CompareValue({ value }: { value: CompareCell }) {
  if (value === true) {
    return (
      <Check className="mx-auto size-4 text-[#2f5bff]" strokeWidth={2.5} />
    );
  }
  if (value === false) {
    return <Minus className="mx-auto size-3.5 text-neutral-300" />;
  }
  return (
    <span className="text-[13px] font-medium text-neutral-800 dark:text-foreground">
      {value}
    </span>
  );
}

function colLabel(col: (typeof COMPARE_COLS)[number]) {
  if (col === "free") return "Free";
  return ORG_PLANS.find((p) => p.id === col)?.name ?? col;
}

export function StudioUpgradeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [orgs, setOrgs] = useState<OrganizationListItem[]>([]);
  const [active, setActive] = useState<OrganizationListItem | null>(null);
  const [members, setMembers] = useState(4);
  const [busy, setBusy] = useState<OrgPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<OrgPlanId, boolean>>({
    starter: true,
    business: true,
    enterprise: true,
  });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (!open) return;
    setError(null);
    void (async () => {
      const [activeRes, listRes] = await Promise.all([
        getActiveOrganization(),
        getUserOrganizations(),
      ]);
      if (activeRes.success && activeRes.organization) {
        setActive(activeRes.organization);
        setMembers(Math.max(1, activeRes.organization.memberCount || 4));
      }
      if (listRes.success) setOrgs(listRes.organizations);
    })();
  }, [open]);

  const currentPlan = active?.plan ?? "starter";

  const switchOrg = async (id: string) => {
    if (id === active?.id) return;
    const res = await setActiveOrganization(id);
    if (!res.success) return;
    const next = orgs.find((o) => o.id === id) ?? null;
    setActive(next);
    if (next) setMembers(Math.max(1, next.memberCount || 1));
    window.dispatchEvent(new CustomEvent("studio:org-changed"));
  };

  const selectPlan = async (plan: OrgPlanId) => {
    if (busy) return;
    if (plan === "enterprise") {
      window.open("mailto:hello@swibp.io?subject=Enterprise%20plan", "_blank");
      return;
    }
    if (plan === currentPlan) return;
    setBusy(plan);
    setError(null);
    try {
      const res = await updateOrganizationPlan(plan);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setActive(res.organization);
      window.dispatchEvent(new CustomEvent("studio:org-changed"));
      onOpenChange(false);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(920px,94dvh)] w-[min(1180px,96vw)] max-w-none flex-col gap-0 overflow-hidden rounded-[24px] border border-neutral-200 bg-[#f0f1f3] p-0 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:max-w-none dark:border-border dark:bg-background"
      >
        <DialogTitle className="sr-only">Upgrade plan</DialogTitle>

        <div className="relative flex shrink-0 flex-wrap items-center gap-2 border-b border-neutral-200/80 bg-white px-5 py-3.5 pr-14 dark:border-border dark:bg-card">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-border dark:bg-background dark:text-foreground"
              >
                <span className="text-neutral-500">Organization:</span>
                {active ? (
                  <StudioOrgAvatar
                    name={active.name}
                    color={active.color}
                    className="size-5 text-[9px]"
                  />
                ) : null}
                <span className="max-w-[150px] truncate">
                  {active?.name ?? "…"}
                </span>
                <ChevronDown className="size-3.5 text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[220px] rounded-xl">
              {orgs.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  className="cursor-pointer gap-2 text-[13px]"
                  onClick={() => void switchOrg(org.id)}
                >
                  <StudioOrgAvatar
                    name={org.name}
                    color={org.color}
                    className="size-5 text-[9px]"
                  />
                  {org.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-border dark:bg-background"
              >
                {members} member{members === 1 ? "" : "s"}
                <ChevronDown className="size-3.5 text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl">
              {MEMBER_OPTIONS.map((n) => (
                <DropdownMenuItem
                  key={n}
                  className="cursor-pointer text-[13px]"
                  onClick={() => setMembers(n)}
                >
                  {n} member{n === 1 ? "" : "s"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-800 dark:border-border dark:bg-background">
            $ USD
          </span>

          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto grid max-w-[1080px] items-start gap-4 lg:grid-cols-3">
            {ORG_PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const loading = busy === plan.id;
              const openFeatures = expanded[plan.id];

              return (
                <article
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-card",
                    plan.highlight
                      ? "border-[#2f5bff] ring-1 ring-[#2f5bff]/25"
                      : "border-neutral-200 dark:border-border",
                  )}
                >
                  {plan.ribbon ? (
                    <div className="bg-[#2f5bff] px-4 py-1.5 text-center text-[12px] font-semibold text-white">
                      {plan.ribbon}
                    </div>
                  ) : (
                    <div className="h-[30px] bg-transparent" aria-hidden />
                  )}

                  <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[22px] font-bold tracking-tight text-neutral-950 dark:text-foreground">
                        {plan.name}
                      </h3>
                      {isCurrent ? (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-muted dark:text-muted-foreground">
                          Current
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 min-h-[52px] text-[13px] leading-relaxed text-neutral-500 dark:text-muted-foreground">
                      {plan.blurb}
                    </p>

                    {plan.badge ? (
                      <span className="mt-3 inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        {plan.badge}
                      </span>
                    ) : (
                      <span className="mt-3 inline-block h-[26px]" aria-hidden />
                    )}

                    <p className="mt-4 text-[18px] font-semibold tracking-tight text-neutral-950 dark:text-foreground">
                      {priceForPlan(plan.id, members)}
                    </p>

                    <button
                      type="button"
                      disabled={isCurrent || Boolean(busy)}
                      onClick={() => void selectPlan(plan.id)}
                      className={cn(
                        "mt-4 inline-flex h-11 items-center justify-center gap-1.5 rounded-lg text-[14px] font-semibold transition-colors",
                        isCurrent
                          ? "cursor-default border border-neutral-200 bg-neutral-50 text-neutral-400"
                          : plan.highlight
                            ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-foreground dark:text-background"
                            : "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-muted",
                      )}
                    >
                      {loading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : isCurrent ? (
                        "Current plan"
                      ) : (
                        plan.cta
                      )}
                    </button>

                    {plan.secondaryCta && !isCurrent ? (
                      <button
                        type="button"
                        disabled={Boolean(busy)}
                        onClick={() => void selectPlan(plan.id)}
                        className="mt-2 text-center text-[13px] text-neutral-600 dark:text-muted-foreground"
                      >
                        or{" "}
                        <span className="font-semibold underline underline-offset-2">
                          upgrade now
                        </span>
                      </button>
                    ) : (
                      <div className="mt-2 h-5" aria-hidden />
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [plan.id]: !prev[plan.id],
                        }))
                      }
                      className="mt-5 flex w-full items-center justify-between gap-2 text-left text-[13px] font-semibold text-neutral-900 dark:text-foreground"
                    >
                      {plan.featuresTitle}
                      <ChevronDown
                        className={cn(
                          "size-4 text-neutral-400 transition-transform",
                          openFeatures && "rotate-180",
                        )}
                      />
                    </button>

                    {openFeatures ? (
                      <ul className="mt-3 space-y-2.5">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-[13px] leading-snug text-neutral-700 dark:text-foreground"
                          >
                            <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-neutral-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          {error ? (
            <p className="mt-4 text-center text-[12px] text-destructive">{error}</p>
          ) : null}

          <section className="mx-auto mt-12 max-w-[1080px]">
            <h2 className="text-[20px] font-bold tracking-tight text-neutral-950 dark:text-foreground">
              What changes
            </h2>
            <p className="mt-1 text-[13px] text-neutral-500 dark:text-muted-foreground">
              Side-by-side limits across Free and paid plans.
            </p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-border dark:bg-card">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-border">
                    <th className="px-5 py-3.5 text-[12px] font-semibold text-neutral-500">
                      Capability
                    </th>
                    {COMPARE_COLS.map((col) => (
                      <th
                        key={col}
                        className={cn(
                          "px-3 py-3.5 text-center text-[13px] font-bold tracking-tight text-neutral-950 dark:text-foreground",
                          col === currentPlan && "text-[#2f5bff]",
                        )}
                      >
                        {colLabel(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PLAN_COMPARE_ROWS.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-neutral-100 last:border-0 dark:border-border"
                    >
                      <td className="px-5 py-3 text-[13px] text-neutral-700 underline decoration-neutral-300 decoration-dotted underline-offset-4 dark:text-foreground">
                        {row.label}
                      </td>
                      {COMPARE_COLS.map((col) => (
                        <td key={col} className="px-3 py-3 text-center">
                          <CompareValue value={row.values[col]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mx-auto mt-12 max-w-[720px] pb-4">
            <h2
              className="text-center text-[clamp(1.5rem,2.5vw,1.85rem)] tracking-[-0.02em] text-neutral-950 dark:text-foreground"
              style={{
                fontFamily:
                  "var(--font-studio-serif), ui-serif, Georgia, serif",
              }}
            >
              FAQ
            </h2>
            <div className="mt-6 space-y-2.5">
              {PLAN_FAQ.map((item, index) => {
                const open = openFaq === index;
                return (
                  <div
                    key={item.q}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-border dark:bg-card"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-[14px] font-semibold text-neutral-950 dark:text-foreground">
                        {item.q}
                      </span>
                      {open ? (
                        <Minus className="size-4 shrink-0 text-neutral-400" />
                      ) : (
                        <Plus className="size-4 shrink-0 text-neutral-400" />
                      )}
                    </button>
                    {open ? (
                      <p className="px-5 pb-4 text-[13px] leading-relaxed text-neutral-500 dark:text-muted-foreground">
                        {item.a}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
