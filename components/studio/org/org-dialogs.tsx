"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Loader2,
  MoreHorizontal,
} from "lucide-react";

import {
  deleteOrganization,
  getOrganizationMembers,
  removeOrganizationMember,
  transferOrganizationOwnership,
  updateOrganization,
  updateOrganizationMemberRole,
  type OrganizationMemberItem,
} from "@/actions/organizations";
import {
  listOrganizationInvites,
  revokeOrganizationInvite,
  sendOrganizationInvites,
} from "@/actions/invites";
import { StudioAvatar } from "@/components/studio/ui/studio-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { invalidateStudioOrganizations } from "@/lib/studio/queries";
import {
  INVITEABLE_ORG_ROLES,
  OrgMemberRole,
  isOrgManager,
  isOrgOwner,
  type InviteableOrgRole,
} from "@/lib/roles";
import { cn } from "@/lib/utils";

const ORG_COLORS = [
  "#7EB6FF",
  "#C4B5FD",
  "#86EFAC",
  "#FCD34D",
  "#FDA4AF",
  "#67E8F9",
];

interface OrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: {
    id: string;
    name: string;
    color: string;
    role: string;
  } | null;
}

function invalidateOrg(queryClient: ReturnType<typeof useQueryClient>) {
  void invalidateStudioOrganizations(queryClient);
  window.dispatchEvent(new CustomEvent("studio:org-changed"));
}

export function EditProfileDialog({
  open,
  onOpenChange,
  organization,
}: OrgDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(organization?.name || "");
  const [color, setColor] = useState(organization?.color || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organization || !open) return;
    setName(organization.name);
    setColor(organization.color);
    setError(null);
  }, [organization, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await updateOrganization(organization.id, {
        name: name.trim(),
        color,
      });
      if (!res.success) {
        setError("error" in res ? res.error : "Couldn't update organization");
        return;
      }
      invalidateOrg(queryClient);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[min(28rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-md"
        showCloseButton
      >
        <DialogHeader className="gap-1 px-5 pt-5 pb-3">
          <DialogTitle className="text-[17px] font-semibold tracking-tight">
            Edit organization
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            Update the name and avatar color for this workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 pb-5">
          <label className="block space-y-1.5">
            <span className="text-[12px] font-medium text-muted-foreground">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
              placeholder="Organization name"
              className="h-10 w-full rounded-2xl bg-muted/30 px-3.5 text-[14px] outline-none focus:bg-muted/40 disabled:opacity-60"
            />
          </label>

          <div className="space-y-2">
            <span className="text-[12px] font-medium text-muted-foreground">
              Color
            </span>
            <div className="flex flex-wrap gap-2">
              {ORG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={busy}
                  onClick={() => setColor(c)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md transition-transform hover:scale-105",
                    color === c && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                  )}
                  style={{ backgroundColor: c }}
                >
                  {color === c ? (
                    <Check className="size-3.5 text-black/55" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <p className="text-[13px] text-destructive">{error}</p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-md"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-md"
              disabled={busy || name.trim().length < 2}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ManageMembersDialog({
  open,
  onOpenChange,
  organization,
}: OrgDialogProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const myId = session?.user?.id ?? null;
  const isOwner = isOrgOwner(organization?.role);
  const isAdmin = isOrgManager(organization?.role);

  const [members, setMembers] = useState<OrganizationMemberItem[]>([]);
  const [pending, setPending] = useState<
    Array<{ id: string; email: string | null; role: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteableOrgRole>(OrgMemberRole.MEMBER);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);
    try {
      const [membersRes, invitesRes] = await Promise.all([
        getOrganizationMembers(organization.id),
        isAdmin
          ? listOrganizationInvites(organization.id)
          : Promise.resolve({ success: true as const, invites: [] }),
      ]);
      if (membersRes.success && "members" in membersRes) {
        setMembers(membersRes.members);
      }
      if (invitesRes.success && "invites" in invitesRes) {
        setPending(
          invitesRes.invites.map((row) => ({
            id: row.id,
            email: row.email,
            role: row.role,
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && organization) {
      void reload();
      setInviteEmails("");
      setInviteRole(OrgMemberRole.MEMBER);
      setError(null);
    } else {
      setMembers([]);
      setPending([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, organization?.id]);

  const runMemberAction = async (fn: () => Promise<{ success: boolean; error?: string }>) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fn();
      if (!res.success) {
        setError(res.error || "Something went wrong");
        return;
      }
      invalidateOrg(queryClient);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[min(32rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="gap-1 px-5 pt-5 pb-3">
          <DialogTitle className="text-[17px] font-semibold tracking-tight">
            Members
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            Manage people in {organization?.name ?? "this organization"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-5 pb-5">
          {isAdmin ? (
            <div className="space-y-4">
              <textarea
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                disabled={busy}
                rows={2}
                placeholder="Invite by email…"
                className="min-h-[64px] w-full resize-none rounded-2xl bg-muted/30 px-3.5 py-2.5 text-[13px] outline-none placeholder:text-muted-foreground/70 disabled:opacity-60"
              />
              <div className="flex flex-wrap items-center gap-2">
                <div className="grid grid-cols-2 gap-1 rounded-md bg-muted/50 p-1">
                  {INVITEABLE_ORG_ROLES.map((value) => (
                    <button
                      key={value}
                      type="button"
                      disabled={busy || (!isOwner && value === OrgMemberRole.ADMIN)}
                      onClick={() => setInviteRole(value)}
                      className={cn(
                        "h-8 rounded-md px-3 text-[12px] font-medium transition-colors",
                        inviteRole === value
                          ? "bg-background text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {value === OrgMemberRole.MEMBER ? "Member" : "Admin"}
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  disabled={busy || !inviteEmails.trim()}
                  className="ml-auto h-9 rounded-md"
                  onClick={() =>
                    void runMemberAction(async () => {
                      if (!organization) return { success: false, error: "Missing org" };
                      const res = await sendOrganizationInvites({
                        organizationId: organization.id,
                        emails: inviteEmails,
                        role: inviteRole,
                      });
                      if (res.success) setInviteEmails("");
                      return res;
                    })
                  }
                >
                  Invite
                </Button>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ul className="max-h-[280px] space-y-1 overflow-y-auto">
              {members.map((member) => {
                const isMe = member.user.id === myId;
                return (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 rounded-2xl px-2 py-2"
                  >
                    <StudioAvatar
                      name={member.user.name || member.user.email}
                      src={member.user.image}
                      className="size-9 text-[12px]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">
                        {member.user.name || "User"}
                        {isMe ? " (you)" : ""}
                      </p>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                    <span className="rounded-md bg-muted/50 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {member.role}
                    </span>
                    {(isOwner || isMe || (isAdmin && member.role === OrgMemberRole.MEMBER)) &&
                    !(isMe && member.role === OrgMemberRole.OWNER) ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            disabled={busy}
                            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            aria-label="Member actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 rounded-2xl p-1"
                        >
                          {isOwner && member.role !== OrgMemberRole.OWNER ? (
                            <>
                              <DropdownMenuItem
                                className="rounded-xl text-[13px]"
                                onClick={() =>
                                  void runMemberAction(() =>
                                    updateOrganizationMemberRole({
                                      organizationId: organization!.id,
                                      memberUserId: member.user.id,
                                      role:
                                        member.role === OrgMemberRole.ADMIN
                                          ? OrgMemberRole.MEMBER
                                          : OrgMemberRole.ADMIN,
                                    }),
                                  )
                                }
                              >
                                Make {member.role === OrgMemberRole.ADMIN ? "member" : "admin"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="rounded-xl text-[13px]"
                                onClick={() =>
                                  void runMemberAction(() =>
                                    transferOrganizationOwnership({
                                      organizationId: organization!.id,
                                      memberUserId: member.user.id,
                                    }),
                                  )
                                }
                              >
                                Transfer ownership
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          ) : null}
                          <DropdownMenuItem
                            className="rounded-xl text-[13px] text-destructive focus:text-destructive"
                            onClick={() =>
                              void runMemberAction(async () => {
                                const res = await removeOrganizationMember({
                                  organizationId: organization!.id,
                                  memberUserId: member.user.id,
                                });
                                if (res.success && isMe) onOpenChange(false);
                                return res;
                              })
                            }
                          >
                            {isMe ? "Leave organization" : "Remove"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="size-8" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {pending.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
                Pending invites
              </p>
              <ul className="space-y-1">
                {pending.map((invite) => (
                  <li
                    key={invite.id}
                    className="flex items-center gap-3 rounded-2xl px-2 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">
                        {invite.email}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {invite.role.toLowerCase()} · pending
                      </p>
                    </div>
                    {isAdmin ? (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={busy}
                        className="h-8 rounded-md text-[12px]"
                        onClick={() =>
                          void runMemberAction(() =>
                            revokeOrganizationInvite(invite.id),
                          )
                        }
                      >
                        Revoke
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {error ? (
            <p className="text-[13px] text-destructive">{error}</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteOrganizationDialog({
  open,
  onOpenChange,
  organization,
}: OrgDialogProps) {
  const queryClient = useQueryClient();
  const [confirmName, setConfirmName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setConfirmName("");
      setError(null);
    }
  }, [open]);

  const isOwner = isOrgOwner(organization?.role);
  const canDelete = confirmName === organization?.name;

  const handleDelete = async () => {
    if (!organization || !canDelete || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await deleteOrganization(organization.id);
      if (!res.success) {
        setError("error" in res ? res.error : "Couldn't delete organization");
        return;
      }
      invalidateOrg(queryClient);
      window.dispatchEvent(new CustomEvent("studio:folders-changed"));
      window.dispatchEvent(new CustomEvent("core:projects-changed"));
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[min(28rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-md"
        showCloseButton
      >
        <DialogHeader className="gap-1 px-5 pt-5 pb-3">
          <DialogTitle className="text-[17px] font-semibold tracking-tight text-destructive">
            Delete organization
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            This permanently removes the organization workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 pb-5">
          {!isOwner ? (
            <p className="rounded-2xl bg-muted/40 px-3.5 py-3 text-[13px] text-muted-foreground">
              Only the owner can delete this organization.
            </p>
          ) : (
            <>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Type <span className="font-semibold text-foreground">{organization?.name}</span>{" "}
                to confirm. Projects stay with their owners, but org membership
                is removed.
              </p>
              <input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                disabled={busy}
                className="h-10 w-full rounded-2xl bg-muted/30 px-3.5 text-[14px] outline-none focus:bg-muted/40 disabled:opacity-60"
              />
            </>
          )}

          {error ? (
            <p className="text-[13px] text-destructive">{error}</p>
          ) : null}

          <DialogFooter className="flex justify-end gap-2 bg-transparent p-0">
            <Button
              type="button"
              variant="ghost"
              className="rounded-md"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-md"
              disabled={!canDelete || !isOwner || busy}
              onClick={() => void handleDelete()}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Delete organization"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
