"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Copy, Loader2, Link2 } from "lucide-react";
import { FaFacebook, FaLinkedin, FaTelegram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";
import { setProjectPublic } from "@/actions/projects";
import { useProject } from "@/hooks/use-project";
import { useSession } from "next-auth/react";
import { useCanvasStore } from "@/store/useCanvasStore";
import {
  SOCIAL_NETWORKS,
  socialShareUrl,
  type SocialNetwork,
} from "@/lib/share/social";

const NETWORK_ICONS: Record<SocialNetwork, React.ElementType> = {
  x: FaXTwitter,
  telegram: FaTelegram,
  linkedin: FaLinkedin,
  threads: SiThreads,
  facebook: FaFacebook,
  whatsapp: FaWhatsapp,
};

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when auth is required before sharing */
  onNeedAuth?: () => void;
}

export function ShareModal({
  open,
  onOpenChange,
  onNeedAuth,
}: ShareModalProps) {
  const { status } = useSession();
  const { currentProjectId, persist } = useProject();
  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(currentProjectId);

  const shareUrl =
    typeof window !== "undefined" && projectId
      ? `${window.location.origin}/view/${projectId}`
      : "";

  useEffect(() => {
    if (!open) return;
    setError(null);
    setCopied(false);
    setProjectId(currentProjectId);

    if (status !== "authenticated") return;
    if (!currentProjectId) return;

    // Ensure link works for recipients: turn public on when opening share.
    setBusy(true);
    void setProjectPublic(currentProjectId, true)
      .then((res) => {
        if (res.success) setIsPublic(true);
        else alert("Couldn't update public access");
      })
      .finally(() => setBusy(false));
  }, [open, currentProjectId, status]);

  const ensureSavedAndPublic = async () => {
    if (status !== "authenticated") {
      onNeedAuth?.();
      return null;
    }

    setBusy(true);
    setError(null);
    try {
      let id = currentProjectId;
      if (!id) {
        const res = await persist();
        if (!res.success || !("projectId" in res) || !res.projectId) {
          setError("Save the project first");
          return null;
        }
        id = res.projectId;
        setProjectId(id);
      }

      const pub = await setProjectPublic(id, true);
      if (!pub.success) {
        alert("Couldn't update public access");
        return null;
      }
      setIsPublic(true);
      return id;
    } finally {
      setBusy(false);
    }
  };

  const handleTogglePublic = async (next: boolean) => {
    setIsPublic(next);
    const id = projectId ?? (await ensureSavedAndPublic());
    if (!id) {
      setIsPublic(false);
      return;
    }
    setBusy(true);
    const res = await setProjectPublic(id, next);
    setBusy(false);
    if (!res.success) {
      setIsPublic(!next);
      alert("Couldn't update public access");
    }
  };

  const handleCopy = async () => {
    const id = projectId ?? (await ensureSavedAndPublic());
    if (!id || typeof window === "undefined") return;

    const url = `${window.location.origin}/view/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Couldn't copy the link");
    }
  };

  const openSocial = async (network: SocialNetwork) => {
    const id = projectId ?? (await ensureSavedAndPublic());
    if (!id || typeof window === "undefined") return;
    const url = `${window.location.origin}/view/${id}`;
    window.open(
      socialShareUrl(network, {
        url,
        text: `${projectTitle} — carousel`,
      }),
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl border-border p-5">
        <DialogHeader className="space-y-1.5 border-b border-border/40 pb-3 text-left">
          <DialogTitle className="text-[13px] font-semibold tracking-tight">
            Share Project
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            Anyone with the link can open the carousel.
            You can turn public access off at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          {status !== "authenticated" ? (
            <p className="text-[13px] text-muted-foreground">
              Sign in to share this project.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/30 px-3 py-2.5">
                <div className="min-w-0">
                  <Label htmlFor="share-public" className="text-[13px] font-medium">
                    Public link
                  </Label>
                  <p className="text-[13px] text-muted-foreground">
                    {isPublic ? "Anyone with the link can open it" : "Off"}
                  </p>
                </div>
                <Switch
                  id="share-public"
                  checked={isPublic}
                  disabled={busy}
                  onCheckedChange={(v) => void handleTogglePublic(v)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={shareUrl || "Save the project to get a link"}
                  className="h-8 rounded-full border-border/60 bg-muted/40 font-mono text-[13px]"
                />
                <Button
                  size="sm"
                  onClick={() => void handleCopy()}
                  disabled={busy}
                  className="h-8 shrink-0 gap-1.5 rounded-full px-3 text-[13px]"
                >
                  {busy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {SOCIAL_NETWORKS.map((network) => {
                  const Icon = NETWORK_ICONS[network.id];
                  return (
                    <Button
                      key={network.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-full text-[13px]"
                      disabled={busy}
                      onClick={() => void openSocial(network.id)}
                    >
                      <Icon className="size-3.5" />
                      {network.label}
                    </Button>
                  );
                })}
              </div>

              {!projectId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-full text-[13px]"
                  disabled={busy}
                  onClick={() => void ensureSavedAndPublic()}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Save and create link
                </Button>
              )}
            </>
          )}

          {error && <p className="text-[13px] text-destructive">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
