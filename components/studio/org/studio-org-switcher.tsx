"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  createOrganization,
  getUserOrganizations,
  setActiveOrganization,
  type OrganizationListItem,
} from "@/actions/organizations";
import { StudioOrgAvatar } from "@/components/studio/org/studio-org-avatar";
import { StudioBadge } from "@/components/studio/ui/studio-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { planLabel } from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

export function StudioOrgSwitcher() {
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const [open, setOpen] = useState(false);
  const [orgs, setOrgs] = useState<OrganizationListItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!signedIn) {
      setOrgs([]);
      setActiveId(null);
      return;
    }
    const res = await getUserOrganizations();
    if (!res.success) return;
    setOrgs(res.organizations);
    setActiveId(res.activeOrganizationId);
  }, [signedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onChanged = () => void refresh();
    window.addEventListener("studio:org-changed", onChanged);
    return () => window.removeEventListener("studio:org-changed", onChanged);
  }, [refresh]);

  const active = orgs.find((o) => o.id === activeId) ?? orgs[0] ?? null;

  const switchTo = async (id: string) => {
    if (busy || id === activeId) {
      setOpen(false);
      return;
    }
    setBusy(true);
    try {
      const res = await setActiveOrganization(id);
      if (res.success) {
        setActiveId(id);
        setOpen(false);
        window.dispatchEvent(new CustomEvent("studio:org-changed"));
        window.dispatchEvent(new CustomEvent("studio:folders-changed"));
        window.dispatchEvent(new CustomEvent("core:projects-changed"));
      }
    } finally {
      setBusy(false);
    }
  };

  const submitCreate = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await createOrganization(draft.trim() || "New organization");
      if (res.success) {
        setCreating(false);
        setDraft("");
        setOpen(false);
        await refresh();
        window.dispatchEvent(new CustomEvent("studio:org-changed"));
        window.dispatchEvent(new CustomEvent("studio:folders-changed"));
        window.dispatchEvent(new CustomEvent("core:projects-changed"));
      }
    } finally {
      setBusy(false);
    }
  };

  if (!signedIn) return null;

  return (
    <div className="px-3 pb-2">
      <DropdownMenu
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setCreating(false);
            setDraft("");
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-xl px-1.5 py-1.5 text-left transition-colors hover:bg-white/80 dark:hover:bg-muted/60",
              open && "bg-white shadow-sm dark:bg-muted",
            )}
          >
            {active ? (
              <StudioOrgAvatar name={active.name} color={active.color} />
            ) : (
              <span className="size-7 rounded-md bg-neutral-200" />
            )}
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-neutral-950 dark:text-foreground">
              {active?.name ?? "Organization"}
            </span>
            <span className="flex size-6 items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm dark:bg-muted">
              <ChevronDown className="size-3.5" />
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="w-[280px] overflow-hidden rounded-2xl border-neutral-200 p-0 shadow-xl dark:border-border"
        >
          {active ? (
            <div className="flex items-center gap-2.5 px-3 py-3">
              <StudioOrgAvatar
                name={active.name}
                color={active.color}
                className="size-8 text-[12px]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-neutral-950 dark:text-foreground">
                  {active.name}
                </p>
                <p className="text-[12px] text-neutral-500">
                  {planLabel(active.plan)}
                </p>
              </div>
              <button
                type="button"
                aria-label="Add organization"
                className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                onClick={() => setCreating(true)}
              >
                <Plus className="size-4" />
              </button>
            </div>
          ) : null}

          <div className="border-t border-neutral-100 px-3 pt-2.5 pb-1 dark:border-border">
            <p className="text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">
              Other organizations
            </p>
          </div>

          <div className="max-h-[240px] overflow-y-auto px-1.5 pb-1.5">
            {orgs
              .filter((o) => o.id !== active?.id)
              .map((org) => (
                <button
                  key={org.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void switchTo(org.id)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-muted"
                >
                  <StudioOrgAvatar name={org.name} color={org.color} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-semibold text-neutral-950 dark:text-foreground">
                        {org.name}
                      </span>
                      {org.role === "ADMIN" || org.role === "OWNER" ? (
                        <StudioBadge className="uppercase">
                          {org.role === "OWNER" ? "Owner" : "Admin"}
                        </StudioBadge>
                      ) : null}
                    </span>
                    <span className="block text-[12px] text-neutral-500">
                      {planLabel(org.plan)}
                    </span>
                  </span>
                </button>
              ))}

            {creating ? (
              <div className="px-2 py-2">
                <Input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Organization name"
                  className="h-8 rounded-lg text-[13px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void submitCreate();
                    }
                    if (e.key === "Escape") {
                      setCreating(false);
                      setDraft("");
                    }
                  }}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-muted"
              >
                <span className="inline-flex size-7 items-center justify-center rounded-md bg-neutral-100 text-neutral-500 dark:bg-muted">
                  <Plus className="size-3.5" />
                </span>
                <span className="text-[13px] font-medium text-neutral-700 dark:text-foreground">
                  Add organization
                </span>
              </button>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
