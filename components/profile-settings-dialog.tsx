"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { getProfile, updateProfile } from "@/actions/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { update } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSaved(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    void getProfile().then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (!res.success) {
        setError("Failed to load profile");
        return;
      }
      setName(res.name ?? "");
      setEmail(res.email);
      setHasPassword(res.hasPassword);
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const onSave = async () => {
    setError(null);
    setSaved(false);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter a name");
      return;
    }

    const changingPassword = Boolean(newPassword || confirmPassword || currentPassword);
    if (changingPassword) {
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
    }

    setSaving(true);
    try {
      const res = await updateProfile({
        name: trimmedName,
        ...(changingPassword
          ? {
            currentPassword: hasPassword ? currentPassword : undefined,
            newPassword,
          }
          : {}),
      });
      if (!res.success) {
        setError("Failed to save profile");
        return;
      }
      await update({ name: res.name });
      setHasPassword((prev) => prev || changingPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile settings</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={name}
                className="bg-muted/50"
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                value={email}
                readOnly
                disabled
                className="bg-muted/50"
              />
            </div>
            <p className="text-[13px] font-medium text-muted-foreground">
              {hasPassword ? "Change password" : "You can set a password to secure your account"}
            </p>
            <div className="space-y-2">
              <Label htmlFor="profile-new-password">New password</Label>
              <Input
                id="profile-new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-confirm-password">Confirm password</Label>
              <Input
                id="profile-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                className="bg-muted/50"
              />
            </div>

            {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
            {saved ? (
              <p className="text-[13px] text-muted-foreground">Profile saved</p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={saving}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button type="button" onClick={() => void onSave()} disabled={saving} className="rounded-full">
                {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
