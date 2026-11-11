"use client";

import { useState } from "react";
import { ChevronDown, Plus, MoreHorizontal, Palette, Users, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import {
  createOrganization,
  setActiveOrganization,
} from "@/actions/organizations";
import { studioKeys, useUserOrganizations } from "@/lib/studio/queries";
import { isOrgManager, isOrgOwner } from "@/lib/roles";
import { StudioOrgAvatar } from "@/components/studio/org/studio-org-avatar";
import { StudioBadge } from "@/components/studio/ui/studio-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { planLabel } from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

// Импортируйте компоненты диалогов (если они в другом файле)
import { 
  EditProfileDialog, 
  ManageMembersDialog, 
  DeleteOrganizationDialog 
} from "@/components/studio/org/org-dialogs"; 

export function StudioOrgSwitcher({
  variant = "sidebar",
  className,
}: {
  variant?: "sidebar" | "header";
  className?: string;
}) {
  const queryClient = useQueryClient();
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const organizations = useUserOrganizations(signedIn);
  const orgs = organizations.data?.organizations ?? [];
  const activeId = organizations.data?.activeOrganizationId ?? null;
  
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  // Состояния для диалоговых окон
  const [isEditAvatarOpen, setIsEditAvatarOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const active = orgs.find((o) => o.id === activeId) ?? orgs[0] ?? null;
  const isAdmin = isOrgManager(active?.role);

  const switchTo = async (id: string) => {
    if (busy || id === activeId) {
      setOpen(false);
      return;
    }
    setBusy(true);
    try {
      const res = await setActiveOrganization(id);
      if (res.success) {
        queryClient.setQueryData(studioKeys.organizations, (current: typeof organizations.data) =>
          current ? { ...current, activeOrganizationId: id } : current,
        );
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
    <>
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
          {/* ... Триггер DropdownMenu (остается без изменений) ... */}
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 text-left transition-colors",
                isHeader
                  ? cn(
                      "max-w-[min(100%,14rem)] rounded-md px-1.5 py-1 hover:bg-muted/80",
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
                    isHeader ? "size-6" : "size-7 rounded-md",
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
            className="w-[280px] overflow-hidden rounded-2xl p-0"
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
                    {planLabel(active.isUpgrade)} · {active.memberCount}{" "}
                    {active.memberCount === 1 ? "member" : "members"}
                  </p>
                </div>
                
                {active ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Organization settings"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <MoreHorizontal className="size-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-2xl p-1"
                    >
                      {isAdmin ? (
                        <DropdownMenuItem
                          onClick={() => setIsEditAvatarOpen(true)}
                          className="cursor-pointer gap-2.5 rounded-xl py-2 text-[13px]"
                        >
                          <Palette className="size-4 text-muted-foreground" />
                          Edit organization
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem
                        onClick={() => setIsMembersOpen(true)}
                        className="cursor-pointer gap-2.5 rounded-xl py-2 text-[13px]"
                      >
                        <Users className="size-4 text-muted-foreground" />
                        Manage members
                      </DropdownMenuItem>
                      {isOrgOwner(active.role) ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setIsDeleteOpen(true)}
                            className="cursor-pointer gap-2.5 rounded-xl py-2 text-[13px] text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash2 className="size-5" />
                            Delete organization
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
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
                        {isOrgManager(org.role) ? (
                          <StudioBadge className="uppercase">
                            {isOrgOwner(org.role) ? "Owner" : "Admin"}
                          </StudioBadge>
                        ) : null}
                      </span>
                      <span className="block text-[12px] text-muted-foreground">
                        {org.memberCount}{" "}
                        {org.memberCount === 1 ? "member" : "members"}
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
                    className="h-8 rounded-md border-0 bg-muted text-[13px] shadow-none dark:bg-background/40"
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
                  <span className="inline-flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground dark:bg-background/40">
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

      {/* Рендер вынесенных компонентов */}
      <EditProfileDialog 
        open={isEditAvatarOpen} 
        onOpenChange={setIsEditAvatarOpen} 
        organization={active} 
      />
      <ManageMembersDialog 
        open={isMembersOpen} 
        onOpenChange={setIsMembersOpen} 
        organization={active} 
      />
      <DeleteOrganizationDialog 
        open={isDeleteOpen} 
        onOpenChange={setIsDeleteOpen} 
        organization={active} 
      />
    </>
  );
}