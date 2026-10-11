"use client";

import { useState } from "react";
import { Loader2, Sparkles, WandSparkles } from "lucide-react";

import {
  applyTextsToSelection,
  readSelectedTexts,
} from "@/lib/ai/apply-text-rewrite";
import type { RewriteMode } from "@/lib/ai/rewrite";
import type { CanvasManager } from "@/lib/canvas/manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MODES: Array<{ id: RewriteMode; label: string }> = [
  { id: "improve", label: "Improve" },
  { id: "shorter", label: "Shorter" },
  { id: "clearer", label: "Clearer" },
  { id: "fix", label: "Fix" },
];

export function AiTextAssist({
  manager,
  disabled,
  onApplied,
}: {
  manager: CanvasManager | null;
  disabled?: boolean;
  onApplied?: (texts: string[]) => void;
}) {
  const [mode, setMode] = useState<RewriteMode>("improve");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!manager || busy || disabled) return;
    const texts = readSelectedTexts(manager).filter((text) => text.trim());
    if (texts.length === 0) {
      setError("Select a text block first");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/generate/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts,
          mode,
          note: note.trim() || undefined,
        }),
      });
      const data = (await response.json().catch(() => null)) as {
        texts?: string[];
        error?: string;
      } | null;
      if (!response.ok || !data?.texts?.length) {
        throw new Error(data?.error || "Rewrite failed");
      }
      applyTextsToSelection(manager, data.texts);
      onApplied?.(data.texts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rewrite failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {MODES.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={mode === item.id ? "secondary" : "outline"}
            disabled={busy || disabled}
            className={cn("h-7 rounded-full px-2.5 text-[12px]")}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <Input
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Optional note (tone, audience…)"
        disabled={busy || disabled}
        className="h-8 rounded-full text-[12px]"
      />
      <Button
        type="button"
        size="sm"
        disabled={busy || disabled || !manager}
        onClick={() => void run()}
        className="h-8 w-full justify-center gap-2 rounded-full text-[12px]"
      >
        {busy ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <WandSparkles className="size-3.5" />
        )}
        {busy ? "Rewriting…" : "Rewrite with AI"}
      </Button>
      {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Sparkles className="size-3 shrink-0" />
        Works on one or many selected text blocks
      </p>
    </div>
  );
}
