"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { updateTemplateMeta } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLATFORMS } from "@/lib/platforms";

const CATEGORIES = [
  "Built-in",
  ...PLATFORMS.map((platform) => platform.id),
] as const;

export function EditTemplateDialog({
  open,
  onOpenChange,
  template,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    title: string;
    category: string;
    badge: string | null;
  } | null;
  onSaved?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Other");
  const [badge, setBadge] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !template) return;
    setTitle(template.title);
    setCategory(template.category || "Other");
    setBadge(template.badge ?? "");
    setError(null);
    setSaving(false);
  }, [open, template]);

  const categoryOptions = (() => {
    if (!category || CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      return [...CATEGORIES];
    }
    return [...CATEGORIES, category];
  })();

  const onSave = async () => {
    if (!template) return;
    const nextTitle = title.trim();
    if (!nextTitle) {
      setError("Enter a name");
      return;
    }
    if (!category.trim()) {
      setError("Enter a category");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await updateTemplateMeta(template.id, {
        title: nextTitle,
        category: category.trim(),
        badge: badge.trim() || null,
      });
      if (!res.success) {
        setError("Failed to save template");
        return;
      }
      onSaved?.();
      onOpenChange(false);
      window.dispatchEvent(new Event("core:templates-changed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit template</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-template-title">Name</Label>
            <Input
              id="edit-template-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Template name"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-template-badge">Badge</Label>
            <Input
              id="edit-template-badge"
              value={badge}
              onChange={(event) => setBadge(event.target.value)}
              placeholder="Optional"
            />
          </div>
          {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => void onSave()} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
