"use client";

import type { ReactNode } from "react";
import {
  Command,
  Control,
  Info,
  Keyboard,
  MouseScroll,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { menuIconClass } from "@/components/canvas/sidebar/sidebar-ui";
import { cn } from "@/lib/utils";

const keyIconClass = "size-3.5 shrink-0";

function Keycap({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <kbd
      title={title}
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5",
        "border border-border/60 bg-background text-muted-foreground",
        "shadow-[0_1px_0_0_var(--border)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

function ShortcutRow({ label, keys }: { label: string; keys: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-1.5">
      <span className="text-[13px] text-foreground/90">{label}</span>
      <span className="inline-flex items-center gap-1">{keys}</span>
    </div>
  );
}

/** Icon button + shortcuts dropdown for canvas nav. */
export function CanvasNavHint() {
  const t = useTranslations("editor.zoom");

  const isMac =
    typeof navigator !== "undefined" && navigator.platform.toUpperCase().includes("MAC");
  const ModIcon = isMac ? Command : Control;
  const modTitle = isMac ? "⌘" : "Ctrl";

  const scrollKey = (
    <Keycap title={t("navScroll")}>
      <MouseScroll className={keyIconClass} />
    </Keycap>
  );
  const modKey = (
    <Keycap title={modTitle}>
      <ModIcon className={keyIconClass} />
    </Keycap>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={t("navTitle")}
          aria-label={t("navTitle")}
          className={cn(
            "size-9 shrink-0 rounded-md border-none text-muted-foreground shadow-none hover:bg-muted/40 hover:text-foreground",
            "data-[state=open]:bg-muted/40 data-[state=open]:text-foreground",
          )}
        >
          <Keyboard className={menuIconClass} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[260px] rounded-2xl p-3.5"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <p className="mb-3 text-[15px] font-semibold tracking-tight text-foreground">
          {t("navTitle")}
        </p>
        <p className="mb-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {t("navSection")}
        </p>
        <div className="flex flex-col">
          <ShortcutRow label={t("navZoom")} keys={scrollKey} />
          <ShortcutRow
            label={t("navStep")}
            keys={
              <>
                {modKey}
                {scrollKey}
              </>
            }
          />
          <ShortcutRow
            label={t("navBrowse")}
            keys={
              <Keycap title={t("navSwipe")} className="min-w-8 px-2">
                <span className="text-[11px] font-medium tracking-tight">↔</span>
              </Keycap>
            }
          />
          <ShortcutRow
            label={t("navPan")}
            keys={
              <Keycap title="Space" className="min-w-10 px-2.5">
                <span className="block h-0.5 w-5 rounded-full bg-muted-foreground/70" />
              </Keycap>
            }
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
