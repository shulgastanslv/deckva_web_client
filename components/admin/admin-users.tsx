"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, SpinnerGap as Loader2, Trash as Trash2 } from "@phosphor-icons/react";

import {
  deleteUser,
  listUsers,
  provisionUser,
  updateUserFlags,
  type AdminUserRow,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUsers();
      if (res.success === false) {
        setMessage(res.error);
        return;
      }
      setUsers(res.users);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(q) ||
        (user.name ?? "").toLowerCase().includes(q),
    );
  }, [users, query]);

  const patch = async (
    userId: string,
    patchData: {
      role?: "USER" | "ADMIN";
      unlimitedGenerations?: boolean;
      banned?: boolean;
    },
  ) => {
    setBusyId(userId);
    setMessage(null);
    try {
      const res = await updateUserFlags({ userId, ...patchData });
      if (res.success === false) {
        setMessage(res.error);
        return;
      }
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: patchData.role ?? user.role,
                unlimitedGenerations:
                  typeof patchData.unlimitedGenerations === "boolean"
                    ? patchData.unlimitedGenerations
                    : patchData.role === "ADMIN"
                      ? true
                      : user.unlimitedGenerations,
                banned:
                  typeof patchData.banned === "boolean"
                    ? patchData.banned
                    : user.banned,
              }
            : user,
        ),
      );
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    setMessage(null);
    try {
      const res = await deleteUser(deleteTarget.id);
      if (res.success === false) {
        setMessage(res.error);
        return;
      }
      setUsers((prev) => prev.filter((user) => user.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5 pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
            Users
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Provision by email, then they sign in with OAuth. Manage roles and
            generation limits.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search email or name"
            className="w-full rounded-md border-none bg-muted/40 px-3.5 shadow-none sm:max-w-xs"
          />
          <Button
            type="button"
            className="rounded-md text-[13px] font-normal"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-3.5" />
            Add user
          </Button>
        </div>
      </div>

      {message ? (
        <p className="text-[13px] text-muted-foreground">{message}</p>
      ) : null}

      {loading && users.length === 0 ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-muted-foreground">
          No users found.
        </p>
      ) : (
        <ul className="flex w-full max-w-[920px] flex-col gap-2">
          {filtered.map((user) => {
            const isAdmin = user.role === "ADMIN";
            const busy = busyId === user.id;
            return (
              <li
                key={user.id}
                className={cn(
                  "rounded-2xl px-4 py-3.5",
                  user.banned ? "bg-destructive/10" : "bg-muted/50",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-foreground">
                      {user.name?.trim() || user.email}
                      {user.banned ? (
                        <span className="ml-2 text-[11px] font-medium text-destructive">
                          Banned
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {user.signedIn
                        ? `Signed in ${new Date(user.lastSignedInAt!).toLocaleDateString()}`
                        : "Pending sign-in"}
                      {" · "}
                      today {user.generationsUsedToday} gens
                      {!user.signedIn
                        ? ` · added ${new Date(user.createdAt).toLocaleDateString()}`
                        : null}
                    </p>
                    {!user.signedIn && !user.banned ? (
                      <span className="mt-1.5 inline-flex rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                        Pending OAuth
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label
                      className={cn(
                        "flex items-center gap-2 text-[12px] text-muted-foreground",
                        busy && "opacity-60",
                      )}
                    >
                      Unlimited
                      <Switch
                        checked={user.unlimitedGenerations}
                        disabled={busy || user.banned}
                        onCheckedChange={(checked) => {
                          void patch(user.id, {
                            unlimitedGenerations: checked,
                          });
                        }}
                      />
                    </label>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy || user.banned}
                      className="rounded-md border-none bg-muted/40 px-3.5 text-[12px] font-normal shadow-none hover:bg-muted/60"
                      onClick={() =>
                        void patch(user.id, {
                          role: isAdmin ? "USER" : "ADMIN",
                        })
                      }
                    >
                      {busy ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : isAdmin ? (
                        "Demote"
                      ) : (
                        "Make admin"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy}
                      className={cn(
                        "rounded-md border-none px-3.5 text-[12px] font-normal shadow-none",
                        user.banned
                          ? "bg-muted/40 hover:bg-muted/60"
                          : "bg-destructive/15 text-destructive hover:bg-destructive/25",
                      )}
                      onClick={() =>
                        void patch(user.id, { banned: !user.banned })
                      }
                    >
                      {user.banned ? "Unban" : "Ban"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy}
                      aria-label="Delete user"
                      className="rounded-md border-none bg-muted/40 px-3 text-[12px] font-normal text-destructive shadow-none hover:bg-destructive/15"
                      onClick={() => setDeleteTarget(user)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-[11px] font-medium",
                        isAdmin
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ProvisionUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onDone={(user, created) => {
          setUsers((prev) => {
            const without = prev.filter((row) => row.id !== user.id);
            return [user, ...without];
          });
          setCreateOpen(false);
          setMessage(
            created
              ? `Provisioned ${user.email}. Waiting for first OAuth sign-in.`
              : `Updated access for ${user.email}.`,
          );
        }}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="gap-0 overflow-hidden rounded-3xl border-border/50 p-0 sm:max-w-sm">
          <DialogHeader className="space-y-1 border-b border-border/40 px-5 pt-5 pb-3 text-left">
            <DialogTitle className="text-[15px] font-semibold tracking-tight">
              Delete user
            </DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              Permanently delete{" "}
              <span className="text-foreground">
                {deleteTarget?.email ?? "this account"}
              </span>
              . Projects and related data are removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 px-5 py-4">
            <Button
              type="button"
              variant="secondary"
              className="rounded-md border-none bg-muted/40 text-[13px] font-normal shadow-none"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busyId === deleteTarget?.id}
              className="rounded-md bg-destructive text-[13px] font-normal text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void confirmDelete()}
            >
              {busyId === deleteTarget?.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProvisionUserDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: (user: AdminUserRow, created: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setRole("USER");
      setError(null);
      setBusy(false);
    }
  }, [open]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await provisionUser({ name, email, role });
      if (res.success === false) {
        setError(res.error);
        return;
      }
      onDone(res.user, res.created);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-3xl border-border/50 p-0 sm:max-w-md">
        <DialogHeader className="space-y-1 border-b border-border/40 px-5 pt-5 pb-3 text-left">
          <DialogTitle className="text-[15px] font-semibold tracking-tight">
            Add user
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            Grant access by email. They sign in with Google (or another OAuth
            connector) using this address — no password is stored. If the email
            already exists, role is updated.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3 px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div>
            <label className="mb-1.5 block text-[13px] text-foreground">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
              placeholder="name@company.com"
              className="rounded-md border-none bg-muted/40 shadow-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] text-foreground">
              Display name{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              className="rounded-md border-none bg-muted/40 shadow-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] text-foreground">Role</label>
            <Select
              value={role}
              onValueChange={(value) => {
                if (value === "USER" || value === "ADMIN") setRole(value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error ? (
            <p className="text-[12px] text-destructive">{error}</p>
          ) : null}
          <Button
            type="submit"
            disabled={busy}
            className="w-full rounded-md text-[13px] font-normal"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : "Grant access"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
