"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProject } from "@/hooks/use-project";
import { useApplyTemplate } from "@/hooks/use-apply-template";
import { getTemplates, type TemplateListItem } from "@/actions/templates";
import { useCanvasStore } from "@/store/useCanvasStore";
import { CANVAS_RATIOS } from "@/lib/types";
import { PLATFORMS, type PlatformId } from "@/lib/platforms";
import { PLATFORM_TEMPLATE_CATEGORY } from "@/lib/templates/categories";
import { PlatformIcon } from "@/components/icons/platform-icons";
import { cn } from "@/lib/utils";

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
  const { status } = useSession();
  const { newProject, persist } = useProject();
  const { applyTemplateById } = useApplyTemplate();

  const [name, setName] = useState("");
  const [formatId, setFormatId] = useState<PlatformId>(PLATFORMS[0].id);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const format = PLATFORMS.find((item) => item.id === formatId) ?? PLATFORMS[0];
  const dims = CANVAS_RATIOS[format.ratio];

  const visibleTemplates = useMemo(() => {
    if (formatId === "Other") return templates;
    const category = PLATFORM_TEMPLATE_CATEGORY[formatId];
    return templates.filter(
      (t) =>
        (category != null && t.category === category) ||
        t.category === formatId ||
        t.aspectRatio === format.ratio,
    );
  }, [templates, formatId, format.ratio]);

  useEffect(() => {
    if (!open) return;
    setName("");
    setFormatId("Other");
    setTemplateId(null);
    setError(null);
    setLoading(false);

    let cancelled = false;
    setLoadingList(true);
    void getTemplates()
      .then((res) => {
        if (cancelled) return;
        if (res.success) setTemplates(res.templates);
        else setTemplates([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    // Drop selection if the chosen template is hidden by format filter.
    if (!templateId) return;
    const stillVisible = visibleTemplates.some((t) => t.id === templateId);
    if (!stillVisible) setTemplateId(null);
  }, [visibleTemplates, templateId]);

  const handleCreate = async () => {
    if (!name.trim() || loading) return;

    if (status !== "authenticated") {
      setError("Sign in first");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await newProject(name.trim(), format.ratio);
    if (!res.success) {
      setError("Couldn't create the project");
      setLoading(false);
      return;
    }

    if (templateId) {
      const applied = await applyTemplateById(templateId);
      if (applied.success) {
        // Keep the format the user picked, even if the template uses another ratio.
        useCanvasStore.getState().setCurrentRatio(format.ratio);
        await persist();
      }
    }

    setName("");
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] rounded-2xl border-none p-5 gap-5 shadow-xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            New project
          </DialogTitle>
          <p className="text-[13px] text-muted-foreground">
            {format.label} · {format.ratio} · {dims.width}×{dims.height}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleCreate()}
            placeholder="Project name"
            disabled={loading}
            className="h-8 rounded-full border-0 bg-muted/50 px-4 text-[13px] shadow-none"
          />

          <div className="space-y-2">
            <p className="text-[13px] text-muted-foreground">Format</p>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={loading}
                  onClick={() => setFormatId(item.id)}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] transition-colors",
                    formatId === item.id
                      ? "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground",
                  )}
                >
                  <PlatformIcon id={item.id} className="size-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[13px] text-muted-foreground">Template</p>
            <div className="flex max-h-36 flex-col gap-1 overflow-y-auto rounded-2xl bg-muted/30 p-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => setTemplateId(null)}
                className={cn(
                  "flex h-9 items-center rounded-xl px-3 text-left text-[13px] transition-colors",
                  templateId === null
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Blank
              </button>

              {loadingList ? (
                <div className="flex items-center justify-center gap-2 py-4 text-[13px] text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Loading…
                </div>
              ) : visibleTemplates.length === 0 ? (
                <p className="px-3 py-3 text-[13px] text-muted-foreground">
                  No templates for this format
                </p>
              ) : (
                visibleTemplates.slice(0, 12).map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    disabled={loading}
                    onClick={() => setTemplateId(tpl.id)}
                    className={cn(
                      "flex h-9 items-center justify-between gap-2 rounded-full px-3 text-left text-[13px] transition-colors",
                      templateId === tpl.id
                        ? "bg-muted/50 text-foreground border border-border shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span className="min-w-0 truncate">{tpl.title}</span>
                    <span className="shrink-0 text-[13px] opacity-60">
                      {tpl.slideCount}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-[13px] text-destructive">{error}</p>}

        <Button
          type="button"
          size="lg"
          className="rounded-full"
          disabled={!name.trim() || loading}
          onClick={() => void handleCreate()}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Create"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
