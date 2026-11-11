"use client";

import {
  Keyboard,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="ml-1 inline-flex h-5 items-center justify-center rounded-[4px] border border-border/50 bg-muted/40 px-1.5 text-[11px] font-medium text-muted-foreground first:ml-0">
    {children}
  </kbd>
);

const ShortcutItem = ({ label, keys }: { label: string; keys: React.ReactNode[] }) => (
  <DropdownMenuItem className="flex cursor-default items-center justify-between rounded-xl px-3 py-2 text-[13px] text-foreground focus:bg-muted/50">
    <span>{label}</span>
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Kbd key={i}>{key}</Kbd>
      ))}
    </div>
  </DropdownMenuItem>
);

export function KeyboardShortcutsMenu() {
  const t = useTranslations("studio.shortcuts");
  const tc = useTranslations("common");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md border-none bg-muted/40 text-muted-foreground shadow-none outline-none transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/20"
          title={t("keyboard")}
        >
          <Keyboard className="size-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[280px] rounded-2xl p-2">
        <DropdownMenuLabel className="px-3 py-2 text-[15px] font-semibold text-foreground">
          {t("title")}
        </DropdownMenuLabel>

        <div className="mt-2">
          <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t("general")}
          </div>
          <DropdownMenuGroup>
            <ShortcutItem label={t("playPause")} keys={["space"]} />
            <ShortcutItem label={tc("undo")} keys={["⌘", "Z"]} />
            <ShortcutItem label={tc("redo")} keys={["⌘", "⇧", "Z"]} />
            <ShortcutItem label={tc("expand")} keys={["⌘", "E"]} />
          </DropdownMenuGroup>
        </div>

        <div className="mt-4">
          <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t("animationEditing")}
          </div>
          <DropdownMenuGroup>
            <ShortcutItem label={tc("copy")} keys={["⌘", "C"]} />
            <ShortcutItem label={tc("cut")} keys={["⌘", "X"]} />
            <ShortcutItem label={tc("paste")} keys={["⌘", "V"]} />
            <ShortcutItem label={tc("duplicate")} keys={["⌘", "D"]} />
            <ShortcutItem label={tc("hide")} keys={["⌘", "⇧", "H"]} />
            <ShortcutItem label={tc("delete")} keys={["delete"]} />
          </DropdownMenuGroup>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
