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

export function StudioOrgSwitcher({
  variant = "sidebar",
  className,
}: {
  variant?: "sidebar" | "header";
  className?: string;
}) {
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

  const isHeader = variant === "header";

  return (
    <div className={cn(isHeader ? "min-w-0" : "px-3 pb-2", className)}>
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
              "flex items-center gap-2 text-left transition-colors",
              isHeader
                ? cn(
                    "max-w-[min(100%,14rem)] rounded-full px-1.5 py-1 hover:bg-muted/80",
                    open && "bg-muted",
                  )
                : cn(
                    "w-full rounded-2xl px-1.5 py-1.5 hover:bg-background/80 dark:hover:bg-muted/60",
                    open && "bg-background dark:bg-muted",
                  ),
            )}
          >
            {active ? (
              <StudioOrgAvatar
                name={active.name}
                color={active.color}
                className={isHeader ? "size-6 rounded-md text-[10px]" : undefined}
              />
            ) : (
              <span
                className={cn(
                  "rounded-md bg-muted",
                  isHeader ? "size-6" : "size-7 rounded-full",
                )}
              />
            )}
            <span
              className={cn(
                "min-w-0 truncate font-semibold text-foreground",
                isHeader ? "text-[13px]" : "flex-1 text-[13px]",
              )}
            >
              {active?.name ?? "Organization"}
            </span>
            <ChevronDown
              className={cn(
                "shrink-0 text-muted-foreground",
                isHeader ? "size-3.5 opacity-70" : "size-3.5",
              )}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="w-[280px] overflow-hidden rounded-2xl border-0 bg-background p-0 shadow-none dark:bg-muted"
        >
          {active ? (
            <div className="flex items-center gap-2.5 px-3 py-3">
              <StudioOrgAvatar
                name={active.name}
                color={active.color}
                className="size-8 text-[12px]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-foreground">
                  {active.name}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {planLabel(active.isUpgrade)}
                </p>
              </div>
              <button
                type="button"
                aria-label="Add organization"
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setCreating(true)}
              >
                <Plus className="size-4" />
              </button>
            </div>
          ) : null}

          <div className="px-3 pt-1 pb-1">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
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
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted dark:hover:bg-background/40"
                >
                  <StudioOrgAvatar name={org.name} color={org.color} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-semibold text-foreground">
                        {org.name}
                      </span>
                      {org.role === "ADMIN" || org.role === "OWNER" ? (
                        <StudioBadge className="uppercase">
                          {org.role === "OWNER" ? "Owner" : "Admin"}
                        </StudioBadge>
                      ) : null}
                    </span>
                    <span className="block text-[12px] text-muted-foreground">
                      {planLabel(org.isUpgrade)}
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
                  className="h-8 rounded-full border-0 bg-muted text-[13px] shadow-none dark:bg-background/40"
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
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted dark:hover:bg-background/40"
              >
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground dark:bg-background/40">
                  <Plus className="size-3.5" />
                </span>
                <span className="text-[13px] font-medium text-foreground">
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
