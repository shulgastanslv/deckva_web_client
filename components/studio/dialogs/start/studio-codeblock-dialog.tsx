"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  SpinnerGap as Loader2,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function StudioCodeBlockDialog({
  open,
  onOpenChange,
  onSubmit,
  busy,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (code: string) => void | Promise<void>;
  busy?: boolean;
  error?: string | null;
}) {
  const t = useTranslations("dialogs.codeblock");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (open) setCode("");
  }, [open]);

  const canSubmit = !busy && code.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[min(32rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="gap-1 px-5 pt-5 pb-3">
          <DialogTitle className="text-[17px] font-semibold tracking-tight">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 pb-5">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            disabled={busy}
            spellCheck={false}
            placeholder={`function hello() {\n  return "world";\n}`}
            className={cn(
              "min-h-[180px] w-full resize-none rounded-2xl bg-muted/30 px-3.5 py-3 font-mono text-[13px] leading-relaxed text-foreground outline-none",
              "placeholder:text-muted-foreground/70 focus:bg-muted/40",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />

          {error ? (
            <p className="text-[13px] text-destructive">{error}</p>
          ) : null}

          <Button
            type="button"
            className="h-10 w-full rounded-md text-[13px] font-medium"
            disabled={!canSubmit}
            onClick={() => void onSubmit(code)}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                {t("place")}
                <ArrowRight className="size-3.5 opacity-70" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
