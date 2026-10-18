"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  KeyRound,
  Loader2,
  LogOut,
  Monitor,
  Moon,
  Shield,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";

import { deleteAccount, getProfile, updateProfile } from "@/actions/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Section = "profile" | "security" | "preferences" | "account";

const NAV: { id: Section; label: string; icon: typeof UserRound }[] = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "security", label: "Security", icon: KeyRound },
  { id: "preferences", label: "Preferences", icon: Monitor },
  { id: "account", label: "Account", icon: Shield },
];

function formatJoined(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function ProfileSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session, update } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [section, setSection] = useState<Section>("profile");
  const [themeMounted, setThemeMounted] = useState(false);

  const [name, setName] = useState("");
  const [initialName, setInitialName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const userId = session?.user?.id ?? "";
  const avatarSrc =
    image ||
    session?.user?.image ||
    (userId
      ? `https://api.dicebear.com/10.x/squircles/svg?seed=${userId}`
      : undefined);
  const initial = (name.trim()[0] || email[0] || "U").toUpperCase();
  const isDark = themeMounted && resolvedTheme === "dark";

  const nameDirty = name.trim() !== initialName.trim();
  const passwordDirty = Boolean(
    currentPassword || newPassword || confirmPassword,
  );
  const canSaveProfile = nameDirty && name.trim().length > 0;
  const canSaveSecurity = passwordDirty;

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setSection("profile");
    setLoading(true);
    setError(null);
    setSaved(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setDeleteConfirm("");
    setDeletePassword("");

    void getProfile().then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (!res.success) {
        setError((res as { error: string }).error);
        return;
      }
      setName(res.name ?? "");
      setInitialName(res.name ?? "");
      setEmail(res.email);
      setImage(res.image);
      setHasPassword(res.hasPassword);
      setEmailVerified(Boolean(res.emailVerified));
      setCreatedAt(res.createdAt);
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const sectionTitle = useMemo(
    () => NAV.find((item) => item.id === section)?.label ?? "Settings",
    [section],
  );

  const onSaveProfile = async () => {
    setError(null);
    setSaved(false);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter a name");
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({ name: trimmedName });
      if (!res.success) {
        setError((res as { error: string }).error);
        return;
      }
      await update({ name: res.name });
      setInitialName(res.name ?? trimmedName);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const onSaveSecurity = async () => {
    setError(null);
    setSaved(false);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (hasPassword && !currentPassword) {
      setError("Enter your current password");
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
      });
      if (!res.success) {
        setError((res as { error: string }).error);
        return;
      }
      setHasPassword(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      const res = await deleteAccount({
        confirm: deleteConfirm,
        password: hasPassword ? deletePassword : undefined,
      });
      if (!res.success) {
        setError((res as { error: string }).error);
        return;
      }
      onOpenChange(false);
      await signOut({ callbackUrl: "/" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="gap-0 overflow-hidden rounded-2xl border-0 p-0 ring-1 ring-foreground/10 sm:max-w-2xl"
      >
        <div className="flex min-h-[420px] flex-col sm:flex-row">
          <aside className="flex shrink-0 flex-col border-b border-border/60 bg-muted/30 sm:w-[190px] sm:border-r sm:border-b-0">
            <div className="px-4 pt-4 pb-3">
              <DialogTitle className="text-[13px] font-semibold tracking-tight">
                Settings
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[12px] text-muted-foreground">
                Manage your account
              </DialogDescription>
            </div>

            <nav className="flex gap-1 overflow-x-auto px-2 pb-3 sm:flex-col sm:overflow-visible sm:px-2 sm:pb-4">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSection(item.id);
                      setError(null);
                      setSaved(false);
                    }}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium transition-colors",
                      active
                        ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/10"
                        : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="border-b border-border/60 px-5 py-3.5">
              <h3 className="text-[13px] font-semibold tracking-tight">
                {sectionTitle}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {section === "profile" ? (
                    <div className="space-y-5">
                      <div className="flex items-center gap-3.5">
                        <Avatar size="lg" className="size-14">
                          <AvatarImage src={avatarSrc} alt={name || email} />
                          <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-foreground">
                            {name.trim() || "Your name"}
                          </p>
                          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                            {email}
                          </p>
                          {createdAt ? (
                            <p className="mt-1 text-[11px] text-muted-foreground/80">
                              Joined {formatJoined(createdAt)}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="profile-name">Display name</Label>
                        <Input
                          id="profile-name"
                          value={name}
                          className="h-9 rounded-xl bg-muted/50 px-3"
                          onChange={(event) => {
                            setName(event.target.value);
                            setSaved(false);
                          }}
                          placeholder="Your name"
                          autoComplete="name"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor="profile-email">Email</Label>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-medium",
                              emailVerified
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {emailVerified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                        <Input
                          id="profile-email"
                          value={email}
                          readOnly
                          disabled
                          className="h-9 rounded-xl bg-muted/40 px-3"
                        />
                        <p className="text-[12px] text-muted-foreground">
                          Email can&apos;t be changed here.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {section === "security" ? (
                    <div className="space-y-4">
                      <p className="text-[13px] leading-relaxed text-muted-foreground">
                        {hasPassword
                          ? "Update the password you use to sign in."
                          : "Set a password so you can also sign in with email."}
                      </p>

                      {hasPassword ? (
                        <div className="space-y-2">
                          <Label htmlFor="profile-current-password">
                            Current password
                          </Label>
                          <Input
                            id="profile-current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(event) => {
                              setCurrentPassword(event.target.value);
                              setSaved(false);
                            }}
                            autoComplete="current-password"
                            className="h-9 rounded-xl bg-muted/50 px-3"
                          />
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <Label htmlFor="profile-new-password">
                          New password
                        </Label>
                        <Input
                          id="profile-new-password"
                          type="password"
                          value={newPassword}
                          onChange={(event) => {
                            setNewPassword(event.target.value);
                            setSaved(false);
                          }}
                          autoComplete="new-password"
                          className="h-9 rounded-xl bg-muted/50 px-3"
                          placeholder="At least 6 characters"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="profile-confirm-password">
                          Confirm password
                        </Label>
                        <Input
                          id="profile-confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(event) => {
                            setConfirmPassword(event.target.value);
                            setSaved(false);
                          }}
                          autoComplete="new-password"
                          className="h-9 rounded-xl bg-muted/50 px-3"
                        />
                      </div>
                    </div>
                  ) : null}

                  {section === "preferences" ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/40 px-4 py-3.5 ring-1 ring-foreground/5">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-foreground">
                            Appearance
                          </p>
                          <p className="mt-0.5 text-[12px] text-muted-foreground">
                            Switch between light and dark theme
                          </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {isDark ? (
                            <Moon className="size-4 text-muted-foreground" />
                          ) : (
                            <Sun className="size-4 text-muted-foreground" />
                          )}
                          <Switch
                            checked={isDark}
                            onCheckedChange={(checked) =>
                              setTheme(checked ? "dark" : "light")
                            }
                            aria-label="Dark theme"
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {section === "account" ? (
                    <div className="space-y-5">
                      <div className="rounded-2xl bg-muted/40 px-4 py-3.5 ring-1 ring-foreground/5">
                        <p className="text-[13px] font-medium text-foreground">
                          Sign out
                        </p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          End this session on this device.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-3 h-8 rounded-full"
                          onClick={() => {
                            onOpenChange(false);
                            void signOut({ callbackUrl: "/" });
                          }}
                        >
                          <LogOut className="size-3.5" />
                          Sign out
                        </Button>
                      </div>

                      <div className="rounded-2xl bg-destructive/5 px-4 py-3.5 ring-1 ring-destructive/15">
                        <p className="text-[13px] font-medium text-destructive">
                          Delete account
                        </p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                          Permanently removes your projects, saved items, and
                          account. This cannot be undone.
                        </p>

                        {hasPassword ? (
                          <div className="mt-3 space-y-2">
                            <Label htmlFor="delete-password">Password</Label>
                            <Input
                              id="delete-password"
                              type="password"
                              value={deletePassword}
                              onChange={(event) =>
                                setDeletePassword(event.target.value)
                              }
                              autoComplete="current-password"
                              className="h-9 rounded-xl bg-background/80 px-3"
                            />
                          </div>
                        ) : null}

                        <div className="mt-3 space-y-2">
                          <Label htmlFor="delete-confirm">
                            Type DELETE to confirm
                          </Label>
                          <Input
                            id="delete-confirm"
                            value={deleteConfirm}
                            onChange={(event) =>
                              setDeleteConfirm(event.target.value)
                            }
                            placeholder="DELETE"
                            className="h-9 rounded-xl bg-background/80 px-3"
                            autoComplete="off"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          className="mt-3 h-8 rounded-full"
                          disabled={
                            deleting ||
                            deleteConfirm.trim().toUpperCase() !== "DELETE" ||
                            (hasPassword && !deletePassword)
                          }
                          onClick={() => void onDelete()}
                        >
                          {deleting ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          Delete account
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {!loading &&
            (section === "profile" || section === "security") ? (
              <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-5 py-3">
                <div className="min-h-4 text-[12px]">
                  {error ? (
                    <p className="text-destructive">{error}</p>
                  ) : saved ? (
                    <p className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3.5" />
                      Saved
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 rounded-full"
                    onClick={() => onOpenChange(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="h-8 rounded-full"
                    disabled={
                      saving ||
                      (section === "profile"
                        ? !canSaveProfile
                        : !canSaveSecurity)
                    }
                    onClick={() =>
                      void (section === "profile"
                        ? onSaveProfile()
                        : onSaveSecurity())
                    }
                  >
                    {saving ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </div>
              </div>
            ) : error && section === "account" ? (
              <div className="border-t border-border/60 px-5 py-3">
                <p className="text-[12px] text-destructive">{error}</p>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
